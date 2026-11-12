import React,{useEffect,useState} from 'react';
import {Image,Linking,Text,View,TouchableOpacity} from 'react-native';
import Animated,{useAnimatedStyle,useSharedValue,withTiming} from 'react-native-reanimated';
import {C} from '../lib/theme';

// RepDB free-tier flat illustrations: permitted for commercial in-app display with attribution.
// Each pair loops between starting and peak poses; they are not third-party scraped GIFs.
// https://github.com/RepDB/exercise-dataset/blob/main/LICENSE-DATA.md
const guide:Record<string,string>={
 'incline-db-press':'incline-db-press','lat-pulldown':'lat-pulldown','chest-press':'chest-press-machine',
 'cable-row':'seated-cable-row','lateral-raise':'lateral-raise','preacher-curl':'preacher-curl',
 'rope-pushdown':'tricep-pushdown','leg-press':'leg-press','hip-thrust':'hip-thrust',
 'leg-curl':'seated-leg-curl','leg-extension':'leg-extension','calf-raise':'seated-calf-raise',
 'cable-crunch':'cable-crunch','reverse-crunch':'reverse-crunches','shoulder-press':'dumbbell-shoulder-press',
 'flat-db-press':'db-bench-press','reverse-pec-deck':'rear-delt-fly','hammer-curl':'hammer-curl',
 'overhead-triceps':'cable-overhead-tricep-extension','reverse-db-curl':'db-reverse-curl',
 'deadlift':'deadlift','plank':'plank','wrist-curl':'dumbbell-wrist-curl','squat':'squat',
 'rdl':'romanian-deadlift','bench':'bench-press','overhead-press':'seated-barbell-overhead-press',
 'pullup':'pull-up','barbell-row':'barbell-row','biceps-curl':'bicep-curl',
 'triceps-dip':'dips','face-pull':'face-pull','walking-lunge':'walking-lunge',
 'incline-bench':'incline-bench-press','cable-fly':'cable-fly','skull-crusher':'skull-crusher',
 'front-squat':'front-squat','leg-raise':'hanging-leg-raise','bulgarian-split':'bulgarian-split-squat',
 'good-morning':'good-morning','shrug':'db-shrug'
};
const BASE='https://exercise-dataset.com/images/flat/';
export function ExerciseDemo({id,name,compact=false}:{id:string;name:string;compact?:boolean}){
 const slug=guide[id];const [failed,setFailed]=useState(false);
 const phase=useSharedValue(0);
 useEffect(()=>{
  phase.value=0;
  if(!slug||id==='plank')return;
  const timer=setInterval(()=>{phase.value=withTiming(phase.value>.5?0:1,{duration:420});},1450);
  return()=>clearInterval(timer);
 },[id,slug]);
 const fade=useAnimatedStyle(()=>({opacity:phase.value}));
 const search=()=>Linking.openURL('https://www.google.com/search?tbm=isch&q='+encodeURIComponent(name+' exercise demonstration GIF'));
 const main=id==='plank';
 const start=slug?BASE+slug+(main?'-main.webp':'-start.webp'):'';
 const peak=slug?BASE+slug+'-peak.webp':'';
 return <View style={{backgroundColor:C.raised,borderRadius:21,overflow:'hidden',borderWidth:1,borderColor:C.border,marginVertical:10}}>
  {slug&&!failed?<View style={{height:compact?164:244,backgroundColor:C.paper,overflow:'hidden'}}>
   <Image source={{uri:start}} onError={()=>setFailed(true)} resizeMode="contain" style={{width:'100%',height:'100%'}}/>
   {!main?<Animated.Image source={{uri:peak}} onError={()=>setFailed(true)} resizeMode="contain" style={[{width:'100%',height:'100%',position:'absolute',top:0,left:0},fade]}/>:null}
   <View style={{position:'absolute',top:12,left:12,paddingHorizontal:9,paddingVertical:5,borderRadius:8,backgroundColor:C.navy}}>
    <Text style={{color:C.text,fontSize:10,fontWeight:'800'}}>{main?'STATIC HOLD':'LOOPING 2-POSE GUIDE'}</Text>
   </View>
  </View>:<View style={{height:compact?70:120,justifyContent:'center',alignItems:'center',padding:16}}>
   <Text style={{fontSize:27,color:C.accent,fontWeight:'900'}}>↗ ↘</Text>
   <Text style={{color:C.muted,fontSize:12,textAlign:'center',marginTop:8}}>Visual guide unavailable offline. Use the written cues below.</Text>
  </View>}
  <View style={{padding:11}}>
   <Text style={{color:C.muted,fontSize:11}}>Illustrations by RepDB (repdb.co) · Internet needed for first view</Text>
   <TouchableOpacity onPress={search} accessibilityRole="link" style={{marginTop:7}}>
    <Text style={{color:C.accent,fontSize:12,fontWeight:'800'}}>Find full-motion GIF on Google Images ›</Text>
   </TouchableOpacity>
  </View>
 </View>;
}
