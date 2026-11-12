import type {Routine,RoutineDay,RoutineExercise,Basis} from '../lib/types';
import {lookup} from './exercises';
function E(id:string,sets:number,min:number,max:number,weight?:number|[number,number],basis:Basis='total',suggested=false,seconds?:[number,number]):RoutineExercise{
 const w=Array.isArray(weight)?weight:weight==null?undefined:[weight,weight];
 return {id:`${id}-${Math.random().toString(36).slice(2,8)}`,exerciseId:id,sets,repMin:min,repMax:max,weightMin:w?.[0],weightMax:w?.[1],basis,suggested,rest:lookup(id)?.defaultRest??90,secondsMin:seconds?.[0],secondsMax:seconds?.[1]};
}
function D(name:string,exercises:RoutineExercise[],duration='60–80 min'):RoutineDay{return {id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,duration,exercises};}
function R(id:string,name:string,days:RoutineDay[],subtitle?:string):Routine{return{id,name,subtitle:subtitle??`${days.length} training days / cycle`,days,schedule:[1,2,4,6].slice(0,days.length),preset:true};}
const upperA=D('UPPER A (Chest + Back)',[
 E('incline-db-press',3,8,12,10,'each'),E('lat-pulldown',3,8,12,25),E('chest-press',3,10,12,20),
 E('cable-row',3,10,12,25),E('lateral-raise',3,12,15,5,'each'),E('preacher-curl',2,10,12,[10,15],'total',true),E('rope-pushdown',2,10,15,15)],'65–80 min');
const lowerA=D('LOWER A + ABS',[
 E('leg-press',3,10,12,30),E('hip-thrust',3,8,12,[20,30],'total',true),E('leg-curl',3,10,15,15),
 E('leg-extension',2,12,15,15,'each-leg'),E('calf-raise',3,12,15,25),E('cable-crunch',3,12,15,21),E('reverse-crunch',3,12,15,undefined,'bodyweight')],'65–80 min');
const upperB=D('UPPER B (Shoulders + Arms + Forearms)',[
 E('shoulder-press',3,8,12,10,'each'),E('lat-pulldown',3,8,12,27),E('flat-db-press',3,8,12,10,'each'),
 E('cable-row',2,10,12,27),E('lateral-raise',3,12,15,5,'each'),E('reverse-pec-deck',2,12,15,[10,15],'total',true),
 E('hammer-curl',3,10,12,7.5,'each'),E('overhead-triceps',3,10,15,[10,12.5],'total',true),E('reverse-db-curl',2,12,15,5,'each')],'75–90 min');
const lowerB=D('LOWER B + ABS + FOREARMS',[
 E('deadlift',3,5,6,60),E('leg-press',3,10,12,30),E('leg-curl',2,12,15,15),E('calf-raise',3,12,15,25),
 E('cable-crunch',3,12,15,21),E('plank',3,0,0,undefined,'bodyweight',false,[30,45]),E('wrist-curl',2,15,20,5,'each')],'65–80 min');
const featured:RType=R('labib-ul',"Labib's Upper/Lower",[upperA,lowerA,upperB,lowerB],'4 Days/Week | 60–90 Minutes | Muscle Growth + Definition');
type RType=Routine;
const fullA=D('Full Body A',[E('squat',3,6,10),E('bench',3,6,10),E('barbell-row',3,8,12),E('leg-curl',2,12,15),E('cable-crunch',3,12,15)]);
const fullB=D('Full Body B',[E('rdl',3,8,10),E('overhead-press',3,6,10),E('lat-pulldown',3,8,12),E('walking-lunge',2,10,12),E('lateral-raise',2,12,15)]);
const fullC=D('Full Body C',[E('leg-press',3,10,12),E('incline-db-press',3,8,12),E('cable-row',3,10,12),E('calf-raise',3,12,15),E('hammer-curl',2,10,12)]);
const fullD=D('Full Body D',[E('front-squat',3,6,10),E('pullup',3,6,10),E('flat-db-press',3,8,12),E('face-pull',2,12,15),E('plank',3,0,0,undefined,'bodyweight',false,[30,60])]);
const push=D('Push',[E('bench',3,6,10),E('incline-db-press',3,8,12),E('shoulder-press',3,8,12),E('lateral-raise',3,12,15),E('rope-pushdown',3,10,15)]);
const pull=D('Pull',[E('deadlift',2,5,6),E('pullup',3,6,10),E('cable-row',3,10,12),E('reverse-pec-deck',3,12,15),E('hammer-curl',3,10,12)]);
const legs=D('Legs',[E('squat',3,6,10),E('rdl',3,8,12),E('leg-press',3,10,12),E('leg-curl',3,10,15),E('calf-raise',3,12,15)]);
const u1=D('Upper A',[E('bench',3,6,10),E('barbell-row',3,8,12),E('shoulder-press',3,8,12),E('lat-pulldown',3,8,12),E('biceps-curl',2,12,15),E('rope-pushdown',2,12,15)]);
const u2=D('Upper B',[E('incline-db-press',3,8,12),E('pullup',3,6,10),E('flat-db-press',3,8,12),E('cable-row',3,10,12),E('lateral-raise',3,12,15),E('hammer-curl',2,12,15)]);
const l1=D('Lower A',[E('squat',3,6,10),E('rdl',3,8,10),E('leg-extension',3,12,15),E('calf-raise',3,12,15),E('cable-crunch',3,12,15)]);
const l2=D('Lower B',[E('deadlift',3,5,6),E('leg-press',3,10,12),E('leg-curl',3,12,15),E('walking-lunge',2,10,12),E('leg-raise',3,10,15)]);
const chest=D('Chest + Triceps',[E('bench',4,6,10),E('incline-db-press',3,8,12),E('cable-fly',3,12,15),E('rope-pushdown',3,10,15),E('skull-crusher',2,10,12)]);
const back=D('Back + Biceps',[E('pullup',3,6,10),E('barbell-row',3,8,12),E('lat-pulldown',3,10,12),E('face-pull',3,12,15),E('biceps-curl',3,10,12)]);
const shoulders=D('Shoulders',[E('overhead-press',3,6,10),E('lateral-raise',4,12,15),E('reverse-pec-deck',3,12,15),E('shrug',3,10,15),E('plank',3,0,0,undefined,'bodyweight',false,[30,60])]);
const arms=D('Arms + Abs',[E('preacher-curl',3,8,12),E('rope-pushdown',3,10,15),E('hammer-curl',3,10,12),E('overhead-triceps',3,10,15),E('reverse-db-curl',3,12,15),E('cable-crunch',3,12,15)]);
const powerUpper=D('Power Upper',[E('bench',4,3,6),E('barbell-row',4,4,6),E('overhead-press',3,5,8),E('pullup',3,6,10),E('rope-pushdown',2,10,12)]);
const powerLower=D('Power Lower',[E('squat',4,3,6),E('deadlift',3,3,5),E('leg-press',3,8,12),E('calf-raise',3,10,15),E('plank',3,0,0,undefined,'bodyweight',false,[45,60])]);
const hyperUpper=D('Hypertrophy Upper',[E('incline-db-press',4,8,12),E('lat-pulldown',4,10,12),E('cable-row',3,10,15),E('lateral-raise',4,12,20),E('biceps-curl',3,12,15),E('rope-pushdown',3,12,15)]);
const hyperLower=D('Hypertrophy Lower',[E('leg-press',4,10,15),E('rdl',3,8,12),E('leg-curl',3,12,15),E('leg-extension',3,12,20),E('calf-raise',4,12,20),E('cable-crunch',3,12,15)]);
export const presetRoutines:Routine[]=[
 R('full-3','Full Body — 3 Days',[fullA,fullB,fullC]),
 R('full-4','Full Body — 4 Days',[fullA,fullB,fullC,fullD]),
 R('ul-4','Upper/Lower — 4 Days',[u1,l1,u2,l2]),
 R('ul-3-rotating','Upper/Lower — 3 Days Rotating',[u1,l1,u2,l2],'3 sessions per week; continue to next day each session'),
 R('ppl-3','Push/Pull/Legs — 3 Days',[push,pull,legs]),
 R('ppl-6','Push/Pull/Legs — 6 Days',[push,pull,legs,{...push,id:'push-2',name:'Push B'},{...pull,id:'pull-2',name:'Pull B'},{...legs,id:'legs-2',name:'Legs B'}]),
 R('bro-5','Bro Split — 5 Days',[chest,back,legs,shoulders,arms]),
 R('phul','PHUL — 4 Days',[powerUpper,powerLower,hyperUpper,hyperLower]),
 R('phat','PHAT-Inspired — 5 Days',[powerUpper,powerLower,back,chest,legs]),
 R('beginner-3','Beginner Strength — 3 Days',[D('Strength A',[E('squat',3,5,5),E('bench',3,5,5),E('barbell-row',3,5,5)]),D('Strength B',[E('squat',3,5,5),E('overhead-press',3,5,5),E('deadlift',1,5,5)]),D('Strength C',[E('leg-press',3,8,10),E('bench',3,6,8),E('lat-pulldown',3,8,10)])]),
 R('hypertrophy-4','Hypertrophy Focus — 4 Days',[hyperUpper,hyperLower,u2,l2]),
 featured,
].map(p=>({...p,schedule:p.days.length===6?[1,2,3,4,5,6]:p.days.length===5?[1,2,3,5,6]:p.days.length===3?[1,3,5]:[1,2,4,6]}));
export function duplicateRoutine(r:Routine,id:string):Routine{return {...JSON.parse(JSON.stringify(r)),id,name:`${r.name} (Custom)`,preset:false,originId:r.id};}
