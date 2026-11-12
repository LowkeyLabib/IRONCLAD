import * as SQLite from 'expo-sqlite';
import {exercises} from '../data/exercises';
import {presetRoutines} from '../data/routines';
import {defaultPrefs,defaultProfile} from '../lib/types';
import type {Preferences,Profile,Routine,Session,SessionExercise,SetLog,BodyEntry,PhotoEntry,Exercise} from '../lib/types';
import {uuid} from '../lib/theme';
import {File,Paths} from 'expo-file-system';
export type SQLDatabase=SQLite.SQLiteDatabase;
let pending:Promise<SQLDatabase>|null=null;
export function db(){if(!pending)pending=(async()=>{const conn=await SQLite.openDatabaseAsync('ironclad.db');await migrate(conn);return conn;})();return pending;}
const schema=`
 PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS profile(id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS exercises(id TEXT PRIMARY KEY, json TEXT NOT NULL, is_custom INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE IF NOT EXISTS routines(id TEXT PRIMARY KEY, name TEXT NOT NULL, preset INTEGER NOT NULL, json TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, routine_id TEXT NOT NULL, day_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','complete')), started_at INTEGER NOT NULL, ended_at INTEGER, notes TEXT NOT NULL DEFAULT '');
 CREATE TABLE IF NOT EXISTS session_exercises(entry_id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, exercise_id TEXT NOT NULL, sort_index INTEGER NOT NULL, json TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS session_sets(id TEXT PRIMARY KEY, entry_id TEXT NOT NULL REFERENCES session_exercises(entry_id) ON DELETE CASCADE, session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, sequence INTEGER NOT NULL, reps INTEGER, seconds INTEGER, weight REAL, rir REAL, kind TEXT NOT NULL CHECK(kind IN ('warmup','working')), done_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS idx_session_dates ON sessions(started_at);
 CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_session ON sessions(status) WHERE status='active';
 CREATE INDEX IF NOT EXISTS idx_sets_exercise ON session_sets(entry_id);
 CREATE TABLE IF NOT EXISTS body_entries(id TEXT PRIMARY KEY, day TEXT UNIQUE NOT NULL, kg REAL NOT NULL CHECK(kg>0), waist_cm REAL, calories REAL);
 CREATE TABLE IF NOT EXISTS progress_photos(id TEXT PRIMARY KEY, day TEXT NOT NULL, uri TEXT NOT NULL);
 `;
async function migrate(c:SQLDatabase){
 const v=await c.getFirstAsync<{user_version:number}>('PRAGMA user_version');
 if((v?.user_version??0)>1)throw new Error('This database was created by a newer IRONCLAD version');
 if((v?.user_version??0)<1){await c.execAsync(schema);await c.execAsync('PRAGMA user_version=1');}
 await c.execAsync('PRAGMA foreign_keys=ON');
 await c.runAsync('INSERT OR IGNORE INTO profile(id,json) VALUES(1,?)',JSON.stringify(defaultProfile));
 await c.runAsync('INSERT OR IGNORE INTO settings(id,json) VALUES(1,?)',JSON.stringify(defaultPrefs));
 await c.withExclusiveTransactionAsync(async tx=>{
  for(const e of exercises)await tx.runAsync('INSERT OR IGNORE INTO exercises(id,json,is_custom) VALUES(?,?,0)',e.id,JSON.stringify(e));
  for(const r of presetRoutines)await tx.runAsync('INSERT OR IGNORE INTO routines(id,name,preset,json) VALUES(?,?,1,?)',r.id,r.name,JSON.stringify(r));
 });
}
const parse=<T,>(s:string)=>JSON.parse(s) as T;
export async function loadAll(){const c=await db();
 const p=await c.getFirstAsync<{json:string}>('SELECT json FROM profile WHERE id=1');
 const f=await c.getFirstAsync<{json:string}>('SELECT json FROM settings WHERE id=1');
 const rr=await c.getAllAsync<{json:string}>('SELECT json FROM routines ORDER BY preset DESC,name ASC');
 const ee=await c.getAllAsync<{json:string}>('SELECT json FROM exercises ORDER BY is_custom,name ASC'.replace('name ASC','id ASC'));
 const ss=await c.getAllAsync<any>('SELECT * FROM sessions ORDER BY started_at DESC');
 const se=await c.getAllAsync<any>('SELECT * FROM session_exercises ORDER BY sort_index ASC');
 const sl=await c.getAllAsync<any>('SELECT * FROM session_sets ORDER BY done_at ASC,sequence ASC');
 const be=await c.getAllAsync<any>('SELECT * FROM body_entries ORDER BY day DESC');
 const ph=await c.getAllAsync<PhotoEntry>('SELECT * FROM progress_photos ORDER BY day DESC');
 const sessions:Session[]=ss.map(s=>({id:s.id,routineId:s.routine_id,dayId:s.day_id,name:s.name,status:s.status,startedAt:s.started_at,endedAt:s.ended_at??undefined,notes:s.notes,exercises:se.filter(x=>x.session_id===s.id).map(x=>({ ...parse<SessionExercise>(x.json),entryId:x.entry_id,sortIndex:x.sort_index,setsLogged:sl.filter(y=>y.entry_id===x.entry_id).map(y=>({id:y.id,exerciseEntryId:y.entry_id,sessionId:y.session_id,sequence:y.sequence,reps:y.reps,seconds:y.seconds,weight:y.weight,rir:y.rir,kind:y.kind,doneAt:y.done_at}))}))}));
 return {profile:{...defaultProfile,...parse<Profile>(p!.json)},prefs:{...defaultPrefs,...parse<Preferences>(f!.json)},routines:rr.map(r=>parse<Routine>(r.json)),catalog:ee.map(r=>parse<Exercise>(r.json)),sessions,body:be.map(x=>({id:x.id,day:x.day,kg:x.kg,waistCm:x.waist_cm??undefined,calories:x.calories??undefined} as BodyEntry)),photos:ph};
}
export async function saveProfile(p:Profile){await(await db()).runAsync('UPDATE profile SET json=? WHERE id=1',JSON.stringify(p));}
export async function savePrefs(p:Preferences){await (await db()).runAsync('UPDATE settings SET json=? WHERE id=1',JSON.stringify(p));}
export async function saveRoutine(r:Routine){await(await db()).runAsync('INSERT OR REPLACE INTO routines(id,name,preset,json) VALUES(?,?,?,?)',r.id,r.name,r.preset?1:0,JSON.stringify(r));}
export async function deleteRoutine(id:string){await(await db()).runAsync('DELETE FROM routines WHERE id=? AND preset=0',id);}
export async function addExercise(e:Exercise){await(await db()).runAsync('INSERT INTO exercises(id,json,is_custom) VALUES(?,?,1)',e.id,JSON.stringify(e));}
export async function startSession(r:Routine,dayIndex:number):Promise<string>{
 const c=await db();const existing=await c.getFirstAsync<{id:string}>("SELECT id FROM sessions WHERE status='active' LIMIT 1");if(existing)return existing.id;
 const day=r.days[dayIndex];if(!day)throw new Error('Workout day not found');const id=uuid();
 await c.withExclusiveTransactionAsync(async tx=>{
  await tx.runAsync('INSERT INTO sessions(id,routine_id,day_id,name,status,started_at,notes) VALUES(?,?,?,?,?,?,?)',id,r.id,day.id,day.name,'active',Date.now(),'');
  for(let i=0;i<day.exercises.length;i++){
   const e=day.exercises[i],entryId=uuid();
   await tx.runAsync('INSERT INTO session_exercises(entry_id,session_id,exercise_id,sort_index,json) VALUES(?,?,?,?,?)',entryId,id,e.exerciseId,i,JSON.stringify({...e,entryId,sortIndex:i,skipped:false,notes:'',setsLogged:[]}));
  }
 });return id;
}
export async function logSet(sessionId:string,entryId:string,set:Omit<SetLog,'id'|'sessionId'|'exerciseEntryId'|'doneAt'>){
 const c=await db();const active=await c.getFirstAsync<{status:string}>('SELECT status FROM sessions WHERE id=?',sessionId);
 if(active?.status!=='active')throw new Error('Session is not active');
 await c.runAsync('INSERT INTO session_sets(id,entry_id,session_id,sequence,reps,seconds,weight,rir,kind,done_at) VALUES(?,?,?,?,?,?,?,?,?,?)',uuid(),entryId,sessionId,set.sequence,set.reps,set.seconds,set.weight,set.rir,set.kind,Date.now());
}
export async function editSet(id:string,fields:Pick<SetLog,'reps'|'seconds'|'weight'|'rir'|'kind'>){await(await db()).runAsync('UPDATE session_sets SET reps=?,seconds=?,weight=?,rir=?,kind=? WHERE id=?',fields.reps,fields.seconds,fields.weight,fields.rir,fields.kind,id);}
export async function removeSet(id:string){await(await db()).runAsync('DELETE FROM session_sets WHERE id=?',id);}
export async function updateSessionExercise(entry:SessionExercise){await(await db()).runAsync('UPDATE session_exercises SET sort_index=?,json=? WHERE entry_id=?',entry.sortIndex,JSON.stringify({...entry,setsLogged:[]}),entry.entryId);}
export async function addSessionExercise(sessionId:string,e:SessionExercise){await(await db()).runAsync('INSERT INTO session_exercises(entry_id,session_id,exercise_id,sort_index,json) VALUES(?,?,?,?,?)',e.entryId,sessionId,e.exerciseId,e.sortIndex,JSON.stringify({...e,setsLogged:[]}));}
export async function finishSession(id:string,notes:string){const c=await db();const result=await c.runAsync("UPDATE sessions SET status='complete',ended_at=?,notes=? WHERE id=? AND status='active'",Date.now(),notes,id);if(!result.changes)throw new Error('Workout already completed');}
export async function discardSession(id:string){await(await db()).runAsync("DELETE FROM sessions WHERE id=? AND status='active'",id);}
export async function saveBody(e:BodyEntry){await(await db()).runAsync('INSERT INTO body_entries(id,day,kg,waist_cm,calories) VALUES(?,?,?,?,?) ON CONFLICT(day) DO UPDATE SET kg=excluded.kg,waist_cm=excluded.waist_cm,calories=excluded.calories',e.id,e.day,e.kg,e.waistCm??null,e.calories??null);}
export async function removeBody(day:string){await(await db()).runAsync('DELETE FROM body_entries WHERE day=?',day);}
export async function addPhoto(p:PhotoEntry){await(await db()).runAsync('INSERT INTO progress_photos(id,day,uri) VALUES(?,?,?)',p.id,p.day,p.uri);}
export async function removePhoto(id:string){const c=await db();const old=await c.getFirstAsync<{uri:string}>('SELECT uri FROM progress_photos WHERE id=?',id);await c.runAsync('DELETE FROM progress_photos WHERE id=?',id);if(old?.uri.includes('/progress-photos/')&&old.uri.startsWith(Paths.document.uri))try{await new File(old.uri).delete();}catch{}}
const backupTables=['profile','settings','exercises','routines','sessions','session_exercises','session_sets','body_entries','progress_photos'] as const;
export async function backup(){const c=await db();const tables:Record<string,unknown[]>={};for(const name of backupTables)tables[name]=await c.getAllAsync(`SELECT * FROM ${name}`);return {format:'IRONCLAD',version:1,exportedAt:new Date().toISOString(),tables,notes:'Photos are device-local file references, not embedded image bytes.'};}
export async function restore(raw:unknown){
 if(!raw||typeof raw!=='object')throw new Error('Invalid backup');const b=raw as any;
 if(b.format!=='IRONCLAD'||b.version!==1||!b.tables)throw new Error('Unsupported backup format');
 for(const t of backupTables){if(!Array.isArray(b.tables[t])||b.tables[t].length>100000)throw new Error(`Invalid table ${t}`);}
 const required:{[key:string]:string[]}={profile:['id','json'],settings:['id','json'],exercises:['id','json','is_custom'],routines:['id','name','preset','json'],sessions:['id','routine_id','day_id','name','status','started_at','notes'],session_exercises:['entry_id','session_id','exercise_id','sort_index','json'],session_sets:['id','entry_id','session_id','sequence','kind','done_at'],body_entries:['id','day','kg'],progress_photos:['id','day','uri']};
 for(const t of backupTables)for(const row of b.tables[t]){
  if(!row||typeof row!=='object'||required[t].some(k=>!(k in row)))throw new Error(`Malformed ${t} entry`);
  if('json' in row){if(typeof row.json!=='string')throw new Error('Invalid JSON cell');JSON.parse(row.json);}
 }
 if(b.tables.profile.length!==1||b.tables.settings.length!==1)throw new Error('Backup must contain profile and settings');
 const c=await db();await c.withExclusiveTransactionAsync(async tx=>{
  for(const t of [...backupTables].reverse())await tx.execAsync(`DELETE FROM ${t}`);
  for(const t of backupTables)for(const row of b.tables[t]){
   const keys=Object.keys(row);if(keys.some(k=>!/^[a-z_]+$/.test(k)))throw new Error('Unexpected column');
   await tx.runAsync(`INSERT INTO ${t}(${keys.join(',')}) VALUES(${keys.map(()=>'?').join(',')})`,...(keys.map(k=>row[k]) as SQLite.SQLiteBindValue[]));
  }
 });
 await migrate(c);
}
export async function wipe(){const c=await db();const photos=await c.getAllAsync<{uri:string}>('SELECT uri FROM progress_photos');for(const photo of photos){if(photo.uri.includes('/progress-photos/')&&photo.uri.startsWith(Paths.document.uri))try{await new File(photo.uri).delete();}catch{}}await c.withExclusiveTransactionAsync(async tx=>{for(const t of [...backupTables].reverse())await tx.execAsync(`DELETE FROM ${t}`)});await migrate(c);}
