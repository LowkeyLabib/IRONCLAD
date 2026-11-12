import {create} from 'zustand';
import * as repo from '../db/database';
import {defaultPrefs,defaultProfile} from '../lib/types';
import type {Profile,Preferences,Routine,Session,SetLog,BodyEntry,PhotoEntry,Exercise,SessionExercise} from '../lib/types';
import {duplicateRoutine} from '../data/routines';
import {uuid} from '../lib/theme';
import {cancelNotification,restNotification,scheduleReminders} from '../lib/notifications';
import * as Haptics from 'expo-haptics';
interface State {
 ready:boolean; error?:string; profile:Profile; prefs:Preferences; routines:Routine[]; catalog:Exercise[]; sessions:Session[]; body:BodyEntry[]; photos:PhotoEntry[];
 boot:()=>Promise<void>; refresh:()=>Promise<void>;
 updateProfile:(patch:Partial<Profile>)=>Promise<void>; updatePrefs:(patch:Partial<Preferences>)=>Promise<void>;
 activateRoutine:(id:string)=>Promise<void>; makeRoutine:(r:Routine)=>Promise<void>; cloneRoutine:(r:Routine)=>Promise<string>; removeRoutine:(id:string)=>Promise<void>; customExercise:(e:Exercise)=>Promise<void>;
 startWorkout:(r:Routine,day:number)=>Promise<string>; finishWorkout:(id:string,notes:string)=>Promise<void>; discardWorkout:(id:string)=>Promise<void>;
 addSet:(sessionId:string,entryId:string,set:Omit<SetLog,'id'|'sessionId'|'exerciseEntryId'|'doneAt'>)=>Promise<void>;
 editSet:(id:string,patch:Pick<SetLog,'reps'|'seconds'|'weight'|'rir'|'kind'>)=>Promise<void>; removeSet:(id:string)=>Promise<void>;
 updateEntry:(e:SessionExercise)=>Promise<void>; appendExercise:(sessionId:string,exerciseId:string)=>Promise<void>;
 recordBody:(x:BodyEntry)=>Promise<void>; deleteBody:(day:string)=>Promise<void>; addPhoto:(x:PhotoEntry)=>Promise<void>; deletePhoto:(id:string)=>Promise<void>;
 setRest:(seconds:number)=>Promise<void>; pauseRest:()=>Promise<void>; resumeRest:()=>Promise<void>; clearRest:()=>Promise<void>;
 restore:(input:unknown)=>Promise<void>; wipe:()=>Promise<void>;
}
export const useApp=create<State>((set,get)=>({
 ready:false,profile:defaultProfile,prefs:defaultPrefs,routines:[],catalog:[],sessions:[],body:[],photos:[],
 boot:async()=>{try{await get().refresh();set({ready:true,error:undefined});if(get().prefs.notifications)void scheduleReminders(get().prefs,get().routines.find(r=>r.id===get().prefs.activeRoutineId)?.schedule).catch(()=>{});}catch(e){set({ready:false,error:String(e)});}},
 refresh:async()=>{const value=await repo.loadAll();set(value);},
 updateProfile:async patch=>{const p={...get().profile,...patch};await repo.saveProfile(p);set({profile:p});},
 updatePrefs:async patch=>{const p={...get().prefs,...patch};await repo.savePrefs(p);set({prefs:p});if(['notifications','workoutReminder','weighReminder','weeklySummary','missedReminder','reminderHour','reminderMinute','quietFrom','quietUntil','sound','activeRoutineId'].some(k=>k in patch))try{await scheduleReminders(p,get().routines.find(r=>r.id===p.activeRoutineId)?.schedule);}catch{}},
 activateRoutine:async id=>{await get().updatePrefs({activeRoutineId:id});},
 makeRoutine:async r=>{if(r.preset)throw new Error('Duplicate a preset to edit it');await repo.saveRoutine(r);await get().refresh();},
 cloneRoutine:async r=>{const clone=duplicateRoutine(r,uuid());await repo.saveRoutine(clone);await get().refresh();return clone.id;},
 removeRoutine:async id=>{await repo.deleteRoutine(id);if(get().prefs.activeRoutineId===id)await get().activateRoutine('labib-ul');await get().refresh();},
 customExercise:async e=>{await repo.addExercise(e);await get().refresh();},
 startWorkout:async(r,day)=>{const id=await repo.startSession(r,day);await get().refresh();return id;},
 finishWorkout:async(id,notes)=>{await repo.finishSession(id,notes);await get().clearRest();await get().refresh();},
 discardWorkout:async id=>{await repo.discardSession(id);await get().clearRest();await get().refresh();},
 addSet:async(sessionId,entryId,payload)=>{await repo.logSet(sessionId,entryId,payload);if(get().prefs.vibration)void Haptics.selectionAsync().catch(()=>{});await get().refresh();const entry=get().sessions.find(s=>s.id===sessionId)?.exercises.find(x=>x.entryId===entryId);if(entry&&get().prefs.restAuto)await get().setRest(entry.rest+get().prefs.restOffset);},
 editSet:async(id,patch)=>{await repo.editSet(id,patch);await get().refresh();},
 removeSet:async id=>{await repo.removeSet(id);await get().refresh();},
 updateEntry:async e=>{await repo.updateSessionExercise(e);await get().refresh();},
 appendExercise:async(sessionId,exerciseId)=>{const all=get().sessions.find(x=>x.id===sessionId)?.exercises??[];const ex=get().catalog.find(x=>x.id===exerciseId);if(!ex)return;const e:SessionExercise={id:uuid(),entryId:uuid(),exerciseId,sets:3,repMin:8,repMax:12,rest:ex.defaultRest,basis:'total',sortIndex:all.length,skipped:false,notes:'',name:ex.name,setsLogged:[]};await repo.addSessionExercise(sessionId,e);await get().refresh();},
 recordBody:async x=>{await repo.saveBody(x);await get().refresh();},deleteBody:async day=>{await repo.removeBody(day);await get().refresh();},
 addPhoto:async x=>{await repo.addPhoto(x);await get().refresh();},deletePhoto:async id=>{await repo.removePhoto(id);await get().refresh();},
 setRest:async seconds=>{const old=get().prefs.rest;await cancelNotification(old?.notificationId);const end=Date.now()+Math.max(0,seconds)*1000;const id=get().prefs.notifications?await restNotification(end,get().prefs.sound):undefined;await get().updatePrefs({rest:{end,durationMs:seconds*1000,notificationId:id}});},
 pauseRest:async()=>{const rest=get().prefs.rest;if(!rest||rest.pausedRemaining!=null)return;await cancelNotification(rest.notificationId);await get().updatePrefs({rest:{end:rest.end,durationMs:rest.durationMs,pausedRemaining:Math.max(0,rest.end-Date.now())}});},
 resumeRest:async()=>{const rest=get().prefs.rest;if(!rest||rest.pausedRemaining==null)return;await get().setRest(Math.ceil(rest.pausedRemaining/1000));},
 clearRest:async()=>{await cancelNotification(get().prefs.rest?.notificationId);await get().updatePrefs({rest:undefined});},
 restore:async data=>{await repo.restore(data);await get().refresh();},
 wipe:async()=>{await repo.wipe();await get().refresh();}
}));
