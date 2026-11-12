import React,{useEffect} from 'react';
import {Stack,useRouter,useSegments} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {Text,View} from 'react-native';
import {useApp} from '../src/state/store';
import {Loading,CTA} from '../src/components/ui';
export default function Root(){const {boot,ready,error,profile}=useApp();const router=useRouter();const segments=useSegments();
 useEffect(()=>{void boot();},[]);
 useEffect(()=>{if(!ready)return;const first=segments[0] as string|undefined;if(!profile.onboardingDone&&first!=='onboarding')router.replace('/onboarding');else if(profile.onboardingDone&&first==='onboarding')router.replace('/(tabs)');},[ready,profile.onboardingDone,segments]);
 if(error)return <View style={{flex:1,backgroundColor:'#0B0D10',justifyContent:'center',padding:25}}><Text style={{color:'#F4F5F7',fontSize:22}}>Unable to open IRONCLAD</Text><Text style={{color:'#9299A3',marginVertical:18}}>{error}</Text><CTA label="Try again" onPress={boot}/></View>;
 if(!ready)return <Loading/>;
 return <><StatusBar style="light"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:'#0B0D10'},animation:'slide_from_right'}}><Stack.Screen name="(tabs)"/><Stack.Screen name="onboarding"/><Stack.Screen name="workout"/><Stack.Screen name="routine/[id]"/><Stack.Screen name="exercise/[id]"/><Stack.Screen name="history"/><Stack.Screen name="records"/><Stack.Screen name="calendar"/><Stack.Screen name="goals"/><Stack.Screen name="notifications"/><Stack.Screen name="body-analysis"/><Stack.Screen name="about"/><Stack.Screen name="library"/></Stack></>;
}
