// Dependency-free brand asset generator: creates PNG app icons and native splash imagery.
// Runs on npm install so Android and iOS always use the same navy/coral identity.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const W=1024,H=1024;
const colors={navy:[20,33,61],card:[28,44,76],coral:[255,107,91],cream:[244,237,224]};
function crc32(data){let c=0xffffffff;for(const b of data){c^=b;for(let j=0;j<8;j++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);}return (c^0xffffffff)>>>0;}
function chunk(name,body){const type=Buffer.from(name),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(body.length);crc.writeUInt32BE(crc32(Buffer.concat([type,body])));return Buffer.concat([length,type,body,crc]);}
function rect(x,y,a,b,r){const cx=Math.max(a+r,Math.min(x,b-r)),cy=Math.max(a+r,Math.min(y,1024-r));return Math.hypot(x-cx,y-cy)<=r;}
function inside(x,y,l,t,r,b,rad){const cx=Math.max(l+rad,Math.min(x,r-rad)),cy=Math.max(t+rad,Math.min(y,b-rad));return Math.hypot(x-cx,y-cy)<=rad;}
function render(file,transparent=false,splash=false){
 const raw=Buffer.alloc(H*(W*4+1));
 for(let y=0;y<H;y++){
  const row=y*(W*4+1);
  for(let x=0;x<W;x++){
   let [r,g,b]=colors.navy,a=transparent?0:255;
   if(!splash&&!transparent&&inside(x,y,122,122,902,902,160)){[r,g,b]=colors.card;}
   const top=inside(x,y,310,290,714,370,35);
   const middle=inside(x,y,472,324,552,704,30);
   const bottom=inside(x,y,310,650,714,730,35);
   const left=inside(x,y,250,410,267,610,8);
   const right=inside(x,y,757,410,774,610,8);
   if(top||middle||bottom){[r,g,b]=colors.coral;a=255;}
   else if(left||right){[r,g,b]=colors.cream;a=255;}
   const i=row+1+x*4;raw[i]=r;raw[i+1]=g;raw[i+2]=b;raw[i+3]=a;
  }
 }
 const header=Buffer.alloc(13);header.writeUInt32BE(W,0);header.writeUInt32BE(H,4);header[8]=8;header[9]=6;
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
 fs.writeFileSync(path.join(__dirname,'..','assets',file),png);
 console.log('Generated',file,png.length,'bytes');
}
render('icon.png');
render('adaptive-icon.png',true);
render('splash-icon.png',true,true);
