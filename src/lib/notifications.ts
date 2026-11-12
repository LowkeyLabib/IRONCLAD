import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import type {Preferences} from './types';
Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:false,shouldSetBadge:false})});
export async function requestNotifications(){
 const p=await Notifications.getPermissionsAsync();const status=p.granted?p:await Notifications.requestPermissionsAsync();
 if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('training',{name:'Training',importance:Notifications.AndroidImportance.DEFAULT});
 return status.granted;
}
export async function restNotification(date:number,sound:boolean){
 if(date<=Date.now())return undefined;
 const status=await Notifications.getPermissionsAsync();if(!status.granted)return undefined;
 try{return await Notifications.scheduleNotificationAsync({content:{title:'Rest complete',body:'Ready for your next set.',sound:sound?'default':false},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(date)}});}catch{return undefined;}
}
export async function cancelNotification(id?:string){if(id)try{await Notifications.cancelScheduledNotificationAsync(id);}catch{}}
export async function scheduleReminders(p:Preferences,schedule:number[]=[]){
 // Native scheduled reminders survive process restarts; inspect and cancel old ones by marker to avoid duplication.
 const existing=await Notifications.getAllScheduledNotificationsAsync();for(const item of existing){if(item.content.data?.ironcladReminder)await cancelNotification(item.identifier);}
 if(!p.notifications)return;
 const permission=await Notifications.getPermissionsAsync();if(!permission.granted)return;
 const weekdays=schedule.length?schedule:[1,3,5];
 async function add(title:string,body:string,weekday:number,hour:number,minute:number){
  const quiet=p.quietFrom!==p.quietUntil && (p.quietFrom<p.quietUntil?(hour>=p.quietFrom&&hour<p.quietUntil):(hour>=p.quietFrom||hour<p.quietUntil));
  const h=quiet?p.quietUntil:hour;
  try{await Notifications.scheduleNotificationAsync({content:{title,body,sound:p.sound?'default':false,data:{ironcladReminder:true}},trigger:{type:Notifications.SchedulableTriggerInputTypes.WEEKLY,weekday:weekday+1,hour:h,minute}});}catch{}
 }
 if(p.workoutReminder)for(const weekday of weekdays)await add('Train today','Your planned workout is ready.',weekday,p.reminderHour,p.reminderMinute);
 if(p.missedReminder)for(const weekday of weekdays)await add('Training check-in','If plans changed, you can reschedule instead of skipping recovery.',(weekday+1)%7,19,0);
 if(p.weighReminder)for(let weekday=0;weekday<7;weekday++)await add('Bodyweight check-in','Optional: add a weigh-in for your trend.',weekday,8,0);
 if(p.weeklySummary)await add('Weekly training summary','Review your completed workouts and progression.',0,18,0);
}
