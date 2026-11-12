import React from 'react';
import {Tabs} from 'expo-router';
import {House,Dumbbell,ChartNoAxesColumnIncreasing,Scale,Settings2} from 'lucide-react-native';
import {C} from '../../src/lib/theme';
const pages=[['index','Home',House],['train','Train',Dumbbell],['progress','Progress',ChartNoAxesColumnIncreasing],['body','Body',Scale],['settings','Settings',Settings2]] as const;
export default function Layout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:C.accent,tabBarInactiveTintColor:C.muted,tabBarStyle:{backgroundColor:C.surface,borderTopColor:C.border,height:64,paddingTop:5,paddingBottom:9},tabBarLabelStyle:{fontSize:10,fontWeight:'700'}}}>{pages.map(([name,title,Icon])=><Tabs.Screen key={name} name={name} options={{title,tabBarIcon:({color,size})=><Icon color={color} size={size??20}/>}}/>)}</Tabs>}
