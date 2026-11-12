const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const ts=(()=>{try{return require('typescript')}catch{return require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}})();
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {presetRoutines}=require('../src/data/routines.ts');const {movingAverage,progression,weeklyCounts,weeklyStreak,prs,strategy,volume}=require('../src/lib/analytics.ts');
const labib=presetRoutines.find(r=>r.id==='labib-ul');
test('twelve complete presets, four-day featured routine',()=>{assert.equal(presetRoutines.length,12);assert.deepEqual(labib.days.map(x=>x.exercises.length),[7,7,9,7]);assert.deepEqual(labib.days.map(x=>x.duration),['65–80 min','65–80 min','75–90 min','65–80 min']);assert.equal(presetRoutines.every(r=>r.days.every(d=>d.exercises.length>=3)),true);});
test('personal starting weights, roles, suggested flags and timed plank',()=>{
 const lowerB=labib.days[3].exercises;assert.equal(lowerB[0].exerciseId,'deadlift');assert.equal(lowerB[0].weightMin,60);assert.equal(lowerB[0].sets,3);assert.equal(lowerB[0].repMax,6);
 const plank=lowerB.find(e=>e.exerciseId==='plank');assert.equal(plank.secondsMin,30);assert.equal(plank.secondsMax,45);assert.equal(plank.basis,'bodyweight');
 const hip=labib.days[1].exercises[1];assert.deepEqual([hip.weightMin,hip.weightMax,hip.suggested],[20,30,true]);
 assert.equal(labib.days[0].exercises[0].basis,'each');assert.equal(labib.days[1].exercises[3].basis,'each-leg');
});
function fakeSession(w,sets,day=0){return{id:String(day),name:'Upper',dayId:'x',routineId:'labib-ul',status:'complete',startedAt:day,endedAt:day+60000,notes:'',exercises:[{exerciseId:'incline-db-press',sets:3,repMax:12,setsLogged:sets.map((reps,i)=>({kind:'working',weight:w,reps,rir:2,doneAt:day+10000+i*1000}))}]}}
test('progressive overload needs consistent completed top-rep sessions',()=>{
 assert.match(progression([fakeSession(10,[12,12,12],1)],'incline-db-press',2.5,12),/Keep your load/);
 assert.match(progression([fakeSession(10,[12,12,12],1),fakeSession(10,[12,12,12],2)],'incline-db-press',2.5,12),/increasing by 2.5 kg/);
 assert.match(progression([fakeSession(10,[12,12,12],1),fakeSession(10,[11,11,11],2)],'incline-db-press',2.5,12),/Keep the load/);
});
test('body trend uses observed weight with no fabricated entries',()=>{assert.deepEqual(movingAverage([]),[]);const xs=[70,71,72].map((kg,i)=>({id:String(i),day:`2026-11-${String(i+1).padStart(2,'0')}`,kg}));assert.equal(movingAverage(xs).at(-1).avg,71);assert.match(strategy(xs,'loss'),/7 days/)});
test('volume is based on logged working sets only',()=>{const s=fakeSession(10,[10,8]);s.exercises[0].setsLogged.push({kind:'warmup',weight:5,reps:10});assert.equal(volume(s),180);s.exercises[0].basis='each';assert.equal(volume(s),360);});
