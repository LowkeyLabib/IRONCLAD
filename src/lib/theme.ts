export const C = {
 bg:'#14213D', surface:'#1C2C4C', raised:'#273A5C', border:'#354765',
 text:'#F4EDE0', muted:'#AFB8C9', accent:'#FF6B5B', paper:'#F4EDE0', navy:'#14213D', coral:'#FF6B5B',
 green:'#6AD1AB', amber:'#E7B66B', red:'#FF8178',
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
