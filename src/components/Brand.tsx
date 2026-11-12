import React from 'react';
import {Text,View} from 'react-native';
import Svg,{Rect,Path} from 'react-native-svg';
import Animated,{FadeIn,FadeInDown,ZoomIn} from 'react-native-reanimated';
import {C} from '../lib/theme';

export function BrandMark({size=92}:{size?:number}){
 return <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityLabel="IRONCLAD logo">
  <Rect x="1" y="1" width="118" height="118" rx="28" fill={C.surface} stroke={C.border} strokeWidth="1"/>
  <Rect x="28" y="26" width="64" height="14" rx="7" fill={C.accent}/>
  <Rect x="53" y="33" width="14" height="54" rx="6" fill={C.accent}/>
  <Rect x="28" y="80" width="64" height="14" rx="7" fill={C.accent}/>
  <Path d="M19 48 v24 M101 48 v24" stroke={C.text} strokeWidth="4" strokeLinecap="round" opacity=".72"/>
 </Svg>;
}
export function BrandSplash(){
 return <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',zIndex:100}}>
  <Animated.View entering={ZoomIn.springify().damping(14)}><BrandMark size={132}/></Animated.View>
  <Animated.Text entering={FadeInDown.delay(230).duration(550)} style={{fontSize:40,fontWeight:'900',color:C.text,letterSpacing:3,marginTop:23}}>IRONCLAD</Animated.Text>
  <Animated.Text entering={FadeIn.delay(560).duration(650)} style={{fontSize:13,color:C.muted,fontWeight:'600',letterSpacing:1.7,marginTop:9}}>BUILT BY CONSISTENCY</Animated.Text>
  <View style={{position:'absolute',bottom:52,alignItems:'center'}}>
   <Animated.Text entering={FadeIn.delay(800).duration(650)} style={{color:C.muted,fontSize:12,letterSpacing:0.4}}>Developed by <Text style={{color:C.accent,fontWeight:'800'}}>LowkeyLabib</Text></Animated.Text>
  </View>
 </View>;
}
