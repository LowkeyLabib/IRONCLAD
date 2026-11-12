export type Basis = 'total'|'each'|'each-leg'|'bodyweight';
export type Goal='gain'|'loss'|'recomp';
export interface Exercise { id:string; name:string; primary:string; secondary:string[]; equipment:string; category:'compound'|'isolation'|'core'; instructions:string; defaultRest:number; increment:number; }
export interface RoutineExercise { id:string; exerciseId:string; sets:number; repMin:number; repMax:number; secondsMin?:number; secondsMax?:number; weightMin?:number; weightMax?:number; basis:Basis; suggested?:boolean; rest:number; }
export interface RoutineDay { id:string; name:string; duration:string; exercises:RoutineExercise[]; }
export interface Routine { id:string; name:string; subtitle:string; days:RoutineDay[]; schedule:number[]; preset:boolean; originId?:string; }
export interface SetLog { id:string; exerciseEntryId:string; sessionId:string; sequence:number; reps:number|null; seconds:number|null; weight:number|null; rir:number|null; kind:'warmup'|'working'; doneAt:number; }
export interface SessionExercise extends RoutineExercise { entryId:string; name:string; sortIndex:number; skipped:boolean; notes:string; setsLogged:SetLog[]; }
export interface Session {id:string; routineId:string; dayId:string; name:string; status:'active'|'complete'; startedAt:number; endedAt?:number; notes:string; exercises:SessionExercise[]; }
export interface BodyEntry { id:string; day:string; kg:number; waistCm?:number; calories?:number; }
export interface PhotoEntry {id:string;day:string;uri:string;}
export interface Profile { name:string; goal:Goal; experience:'beginner'|'intermediate'|'advanced'; age?:number; heightCm?:number; goalKg?:number; activity:'light'|'moderate'|'high'; onboardingDone:boolean; }
export interface Preferences { activeRoutineId:string; units:'kg'|'lb'; notifications:boolean; workoutReminder:boolean; weighReminder:boolean; weeklySummary:boolean; missedReminder:boolean; quietFrom:number; quietUntil:number; reminderHour:number; reminderMinute:number; sound:boolean; vibration:boolean; restAuto:boolean; restOffset:number; increments:Record<string,number>; rest?: {end:number;durationMs?:number;pausedRemaining?:number; notificationId?:string}; }
export const defaultProfile:Profile={name:'',goal:'recomp',experience:'beginner',activity:'moderate',onboardingDone:false};
export const defaultPrefs:Preferences={activeRoutineId:'labib-ul',units:'kg',notifications:false,workoutReminder:false,weighReminder:false,weeklySummary:false,missedReminder:false,quietFrom:22,quietUntil:7,reminderHour:17,reminderMinute:0,sound:false,vibration:true,restAuto:true,restOffset:0,increments:{}};
