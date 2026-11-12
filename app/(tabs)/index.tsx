import React from 'react';import {BrandMark} from '../../src/components/Brand';
import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import {S,Screen,H1,Section,Panel,Metric,CTA,Empty,Bars} from '../../src/components/ui';
import {useApp} from '../../src/state/store';
import {nextWorkout,weeklyCounts,weeklyStreak,volume} from '../../src/lib/analytics';
import {C,fmt,minutes} from '../../src/lib/theme';
export default function Home(){const router=useRouter();const {profile,prefs,routines,sessions,body,startWorkout}=useApp();const routine=routines.find(r=>r.id===prefs.activeRoutineId)??routines[0];const active=sessions.find(s=>s.status==='active');const complete=sessions.filter(s=>s.status==='complete');const last=complete[0];const next=routine?nextWorkout(routine,sessions):null;const weekly=weeklyCounts(sessions);const target=routine?.id==='ul-3-rotating'?3:Math.max(1,routine?.schedule.length??4);
 async function begin(){if(active)return router.push('/workout');if(!routine||!next)return;if(!next.day.exercises.length){router.push({pathname:'/routine/[id]',params:{id:routine.id,edit:'1'}});return;}await startWorkout(routine,next.index);router.push('/workout');}
 return <Screen><View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginVertical:13}}><View><Text style={[S.label,{color:C.accent,marginBottom:5}]}>BUILT BY CONSISTENCY</Text><Text style={{color:C.muted,fontSize:11}}>Your progress. Your pace.</Text></View><BrandMark size={53}/></View><H1 sub="Show up. Log the work. Repeat.">{profile.name?`Hey, ${profile.name}`:'IRONCLAD'}</H1>
 <Panel style={{backgroundColor:C.raised,padding:22,borderColor:C.accent}}><Text style={S.label}>{active?'WORKOUT IN PROGRESS':'UP NEXT'}</Text><Text style={[S.h2,{fontSize:24,marginTop:11}]}>{active?.name??next?.day?.name??'Choose a routine'}</Text><Text style={S.muted}>{routine?.name??'No routine active'}</Text><View style={{marginTop:16}}><CTA label={active?'Resume workout':next?.day?.exercises.length?'▶ Start workout':'Configure routine'} onPress={begin} disabled={!routine}/></View></Panel>
 <Section title="This week"><View style={{flexDirection:'row',gap:9}}><Metric label="Sessions" value={`${weekly.thisWeek} / ${target}`}/><Metric label="Weekly streak" value={`${weeklyStreak(sessions,target)} wk`}/></View></Section>
 <Section title="Last workout">{last?<Panel><Text style={S.h3}>{last.name}</Text><Text style={[S.muted,{marginVertical:9}]}>{new Date(last.startedAt).toLocaleDateString()} · {minutes((last.endedAt??last.startedAt)-last.startedAt)} min</Text><View style={S.row}><Text style={S.text}>{last.exercises.reduce((n,e)=>n+e.setsLogged.filter(x=>x.kind==='working').length,0)} working sets</Text><Text style={{color:C.accent,fontWeight:'700'}}>{fmt(volume(last),0)} kg·reps</Text></View></Panel>:<Empty title="Your journey starts with one session" description="Complete a workout to see your first summary."/>}</Section>
 <Section title="Consistency trend"><Panel><Text style={S.muted}>Completed sessions · last 12 weeks</Text><Bars values={weekly.history}/></Panel></Section>
 <Section title="Bodyweight"><Panel><View style={S.row}><View><Text style={S.label}>LATEST CHECK-IN</Text><Text style={{color:C.text,fontSize:25,fontWeight:'800',marginTop:5}}>{body.length?`${fmt(prefs.units==='lb'?body[0].kg*2.20462262:body[0].kg)} ${prefs.units}`:'Not logged'}</Text></View><CTA label="Log weight" variant="secondary" small onPress={()=>router.push('/(tabs)/body')}/></View></Panel></Section>
 <View style={{height:10}}/>
 </Screen>;
}
