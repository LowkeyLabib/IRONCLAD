import React,{useEffect,useState} from 'react';
import {Stack,useRouter,useSegments} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {Text,View} from 'react-native';
import {useApp} from '../src/state/store';
import {CTA} from '../src/components/ui';
import {BrandSplash} from '../src/components/Brand';
import {C} from '../src/lib/theme';

void SplashScreen.preventAutoHideAsync().catch(()=>{});

export default function Root(){
 const {boot,ready,error,profile}=useApp();
 const router=useRouter();const segments=useSegments();
 const [intro,setIntro]=useState(true);
 useEffect(()=>{void boot();const timeout=setTimeout(()=>setIntro(false),1750);return()=>clearTimeout(timeout)},[boot]);
 useEffect(()=>{if(ready||error)void SplashScreen.hideAsync().catch(()=>{});},[ready,error]);
 useEffect(()=>{
  if(!ready)return;
  const first=segments[0] as string|undefined;
  if(!profile.onboardingDone&&first!=='onboarding')router.replace('/onboarding');
  else if(profile.onboardingDone&&first==='onboarding')router.replace('/(tabs)');
 },[ready,profile.onboardingDone,segments,router]);
 return <View style={{flex:1,backgroundColor:C.bg}}>
  <StatusBar style="light" backgroundColor={C.bg}/>
  <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:C.bg},animation:'slide_from_right'}}>
   <Stack.Screen name="(tabs)"/><Stack.Screen name="onboarding"/><Stack.Screen name="workout"/>
   <Stack.Screen name="routine/[id]"/><Stack.Screen name="exercise/[id]"/>
   <Stack.Screen name="history"/><Stack.Screen name="records"/><Stack.Screen name="calendar"/>
   <Stack.Screen name="goals"/><Stack.Screen name="notifications"/><Stack.Screen name="body-analysis"/>
   <Stack.Screen name="about"/><Stack.Screen name="library"/>
  </Stack>
  {!error&&(!ready||intro)?<BrandSplash/>:null}
  {error?<View style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:C.bg,justifyContent:'center',padding:26,zIndex:200}}>
   <Text style={{fontSize:25,fontWeight:'800',color:C.text}}>Unable to open IRONCLAD</Text>
   <Text style={{color:C.muted,marginVertical:20}}>{error}</Text>
   <CTA label="Try again" onPress={boot}/>
  </View>:null}
 </View>;
}
