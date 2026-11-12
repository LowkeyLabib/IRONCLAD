import type {BodyEntry,Session,SessionExercise,Exercise,Preferences,Routine} from './types';
export const workingSets=(s:Session)=>s.exercises.flatMap(e=>e.setsLogged.filter(l=>l.kind==='working'));
export const volume=(s:Session)=>s.exercises.reduce((total,e)=>total+e.setsLogged.filter(l=>l.kind==='working').reduce((sum,l)=>sum+(l.weight??0)*(l.reps??0)*(e.basis==='each'||e.basis==='each-leg'?2:1),0),0);
export const sessionDuration=(s:Session)=>(s.endedAt??Date.now())-s.startedAt;
export function progression(sessions:Session[],exerciseId:string,increment:number,repMax:number){
 const history=sessions.filter(s=>s.status==='complete').flatMap(s=>s.exercises.filter(x=>x.exerciseId===exerciseId).map(x=>({date:s.startedAt,entry:x}))).sort((a,b)=>b.date-a.date);
 const recent=history.slice(0,3);if(!recent.length)return 'Log your first working sets to receive recommendations.';
 if(recent.length<2)return 'Keep your load steady and build reps with consistent technique.';
 const good=recent.slice(0,2).every(({entry})=>{const sets=entry.setsLogged.filter(x=>x.kind==='working');return sets.length>=entry.sets && sets.every(s=>s.reps!=null&&s.reps>=repMax&& (s.rir==null || s.rir>=1));});
 if(good)return `Top of rep range reached twice. Consider increasing by ${increment} kg next session if form is controlled.`;
 const best=(e:SessionExercise)=>Math.max(0,...e.setsLogged.filter(s=>s.kind==='working').map(s=>s.reps??0));
 if(recent.length>=3&&best(recent[0].entry)<best(recent[1].entry)&&best(recent[1].entry)<=best(recent[2].entry))return 'Performance has dipped across sessions. Consider additional recovery before adding load.';
 if(recent.length>=3&&best(recent[0].entry)===best(recent[1].entry)&&best(recent[1].entry)===best(recent[2].entry))return 'Reps are stable over three sessions. Try a small rep increase or review recovery.';
 return 'Keep the load steady. Add clean reps before adding weight.';
}
export function prs(sessions:Session[]){const rows:Record<string,{weight:number;estimated1rm:number;reps:number;date:number}>={};
 for(const s of sessions.filter(s=>s.status==='complete'))for(const e of s.exercises)for(const l of e.setsLogged.filter(l=>l.kind==='working'&&l.weight!=null&&l.reps!=null&&l.reps>0)){
  const score=l.weight!*(1+Math.min(l.reps!,12)/30);if(!rows[e.exerciseId]||score>rows[e.exerciseId].estimated1rm)rows[e.exerciseId]={weight:l.weight!,reps:l.reps!,estimated1rm:score,date:s.endedAt??s.startedAt};
 }return rows;
}
export function movingAverage(body:BodyEntry[],period=7){const sorted=[...body].sort((a,b)=>a.day.localeCompare(b.day));return sorted.map((x,i)=>{const thisDay=Date.parse(x.day+'T12:00:00Z');const window=sorted.slice(0,i+1).filter(p=>thisDay-Date.parse(p.day+'T12:00:00Z')<(period*86400000));return {...x,avg:window.reduce((s,p)=>s+p.kg,0)/window.length};});}
export function weeklyCounts(sessions:Session[],now=Date.now()){const d=new Date(now);d.setHours(0,0,0,0);const weekday=(d.getDay()+6)%7;d.setDate(d.getDate()-weekday);const start=d.getTime();const completed=sessions.filter(s=>s.status==='complete');return {thisWeek:completed.filter(s=>s.startedAt>=start).length,start,history:Array.from({length:12},(_,i)=>{const a=start-(11-i)*7*86400000;return completed.filter(s=>s.startedAt>=a&&s.startedAt<a+7*86400000).length;})};}
export function weeklyStreak(sessions:Session[],target:number,now=Date.now()){const {history}=weeklyCounts(sessions,now);let count=0;for(let i=history.length-2;i>=0;i--){if(history[i]>=target)count++;else break;}return count;}
export function nextWorkout(r:Routine,sessions:Session[]){const filtered=sessions.filter(s=>s.routineId===r.id&&s.status==='complete').sort((a,b)=>a.startedAt-b.startedAt);const index=filtered.length%r.days.length;return {index,day:r.days[index]};}
export function groupSets(sessions:Session[],catalog:Exercise[],from:number){const counts:Record<string,number>={};for(const s of sessions.filter(s=>s.status==='complete'&&s.startedAt>=from))for(const e of s.exercises){const name=catalog.find(x=>x.id===e.exerciseId)?.primary??'Other';counts[name]=(counts[name]??0)+e.setsLogged.filter(l=>l.kind==='working').length;}return counts;}
export function calorieEstimate(kg:number,heightCm:number,age:number,activity:'light'|'moderate'|'high'){const base=10*kg+6.25*heightCm-5*age-78;return Math.round(base*({light:1.35,moderate:1.55,high:1.75}[activity]));}
export function strategy(body:BodyEntry[],goal:'gain'|'loss'|'recomp'){const data=movingAverage(body);if(data.length<3||Date.parse(data.at(-1)!.day)-Date.parse(data[0].day)<7*86400000)return 'Log weight over at least 7 days to see a trend. Daily fluctuations are normal.';const last=data[data.length-1],prev=data[Math.max(0,data.length-8)],diff=last.avg-prev.avg;
 if(goal==='gain')return diff<0.05?'Average weight is stable. If strength is also stalled, a small increase in calories may help.':diff>0.6?'Weight is increasing rapidly. Consider a slower rate to limit unwanted gain.':'Your trend is compatible with gradual muscle gain; monitor training performance too.';
 if(goal==='loss')return diff< -0.9?'Weight has dropped quickly. Prioritize recovery and avoid large deficits.':diff>=-0.05?'Weight trend is stable. Review adherence before making a small adjustment.':'Your weight is trending down. Focus on strength retention and adequate nutrition.';
 return Math.abs(diff)<0.3?'Weight is broadly stable. Compare performance and optional waist measurements over time.':'Your weight trend is shifting; body composition cannot be determined from the scale alone.';
}
