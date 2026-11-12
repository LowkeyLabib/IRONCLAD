export const C = {
 bg:'#0B0D10', surface:'#15191E', raised:'#1D2229', border:'#283039',
 text:'#F4F5F7', muted:'#9299A3', accent:'#C8F36B', green:'#62C49B', amber:'#D8AE64', red:'#E98686',
};
export const pad = 18;
export const kgToLb = (kg:number)=>kg*2.20462262;
export const lbToKg = (lb:number)=>lb/2.20462262;
export const fmt = (n:number,digits=1)=>Number.isFinite(n)?Number(n.toFixed(digits)).toString():'—';
export const dayKey=(t:number|string|Date)=>{
 const d=new Date(t); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
export const minutes=(ms:number)=>Math.max(0,Math.round(ms/60000));
export const timeLabel=(sec:number)=>`${Math.floor(Math.max(sec,0)/60).toString().padStart(2,'0')}:${Math.max(sec,0)%60|0}`.replace(/:(\d)$/,':0$1');
export const uuid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`;
