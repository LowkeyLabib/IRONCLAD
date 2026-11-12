import React from 'react';
import {Tabs} from 'expo-router';
import {House,Dumbbell,ChartNoAxesColumnIncreasing,Scale,Settings2} from 'lucide-react-native';
import {C} from '../../src/lib/theme';
const pages=[['index','Home',House],['train','Train',Dumbbell],['progress','Progress',ChartNoAxesColumnIncreasing],['body','Body',Scale],['settings','Settings',Settings2]] as const;
export default function Layout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:C.accent,tabBarInactiveTintColor:C.muted,tabBarStyle:{backgroundColor:C.surface,borderTopColor:C.border,height:74,paddingTop:10,paddingBottom:14,borderTopWidth:1,elevation:9,shadowColor:C.bg,shadowOpacity:0.24,shadowRadius:10},tabBarLabelStyle:{fontSize:11,fontWeight:'800'}}}>{pages.map(([name,title,Icon])=><Tabs.Screen key={name} name={name} options={{title,tabBarIcon:({color,size})=><Icon color={color} size={size??20}/>}}/>)}</Tabs>}
