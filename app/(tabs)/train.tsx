import React from 'react';import {Text,View,TouchableOpacity,Alert} from 'react-native';import {useRouter} from 'expo-router';
import {S,Screen,H1,Panel,Section,CTA,Empty} from '../../src/components/ui';import {useApp} from '../../src/state/store';import {C} from '../../src/lib/theme';
export default function Train(){const {routines,prefs,sessions,cloneRoutine,startWorkout}=useApp();const router=useRouter();const active=sessions.find(s=>s.status==='active');
 const current=routines.find(r=>r.id===prefs.activeRoutineId);
 async function newBlank(){const r=current??routines[0];if(!r)return;const id=await cloneRoutine(r);router.push({pathname:'/routine/[id]',params:{id}});}
 return <Screen><H1 sub="Choose a plan or design your own.">Training</H1>
 {active?<Panel style={{backgroundColor:C.raised}}><Text style={S.h3}>{active.name} is underway</Text><View style={{marginTop:11}}><CTA label="Resume workout" onPress={()=>router.push('/workout')}/></View></Panel>:null}
 <Section title="Active program">{current?<TouchableOpacity onPress={()=>router.push({pathname:'/routine/[id]',params:{id:current.id}})}><Panel style={{borderWidth:1,borderColor:C.accent}}><Text style={[S.h2,{marginBottom:4}]}>{current.name}</Text><Text style={S.muted}>{current.subtitle}</Text><Text style={{color:C.accent,marginTop:10,fontWeight:'700'}}>{current.days.length} sessions in cycle · View details</Text></Panel></TouchableOpacity>:<Empty title="No active program"/>}</Section>
 <CTA label="Browse exercise library" variant="secondary" onPress={()=>router.push('/library')}/>
 <Section title="Routine library" action={<CTA label="Create custom" variant="secondary" small onPress={newBlank}/>}>{routines.map(r=><TouchableOpacity key={r.id} onPress={()=>router.push({pathname:'/routine/[id]',params:{id:r.id}})}><Panel style={{marginVertical:5}}><View style={S.row}><View style={{flex:1}}><Text style={S.h3}>{r.name}</Text><Text style={[S.muted,{marginTop:4}]}>{r.days.length} days · {r.preset?'Built-in preset':'Custom'}</Text></View>{r.id===prefs.activeRoutineId?<Text style={{color:C.accent,fontSize:12,fontWeight:'700'}}>ACTIVE</Text>:<Text style={{color:C.muted,fontSize:22}}>›</Text>}</View></Panel></TouchableOpacity>)}</Section>
 </Screen>;
}
