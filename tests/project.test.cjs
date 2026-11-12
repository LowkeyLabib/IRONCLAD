const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
let ts;
try {ts=require('typescript');}catch{
 const globalRoot=execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim();
 ts=require(path.join(globalRoot,'typescript'));
}
const list=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{
 const file=path.join(dir,d.name);
 if(d.isDirectory())return list(file);
 return /\.tsx?$/.test(file)?[file]:[];
});
const files=[...list(path.join(root,'app')),...list(path.join(root,'src'))];
let checkedImports=0;
for(const file of files){
 const src=fs.readFileSync(file,'utf8');
 const source=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(source.parseDiagnostics.length,0,`TypeScript parse errors in ${file}`);
 const imports=src.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g);
 for(const [,relative] of imports){
  const base=path.resolve(path.dirname(file),relative);
  const candidates=[base,`${base}.ts`,`${base}.tsx`,path.join(base,'index.ts'),path.join(base,'index.tsx')];
  assert(candidates.some(x=>fs.existsSync(x)),`Missing relative import ${relative} from ${file}`);
  checkedImports++;
 }
}
const expo=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo;
const eas=JSON.parse(fs.readFileSync(path.join(root,'eas.json'),'utf8'));
assert.equal(expo.android.package,'com.lowkeylabib.ironclad');
assert.equal(expo.ios.bundleIdentifier,'com.lowkeylabib.ironclad');
assert.equal(eas.build.preview.android.buildType,'apk');
assert.equal(eas.build['ios-simulator'].ios.simulator,true);
for(const item of ['icon','android.adaptiveIcon.foregroundImage']){
 const relative=item==='icon'?expo.icon:expo.android.adaptiveIcon.foregroundImage;
 const bytes=fs.readFileSync(path.join(root,relative));
 assert.equal(bytes.subarray(1,4).toString('utf8'),'PNG');
 assert.equal(bytes.readUInt32BE(16),1024);
 assert.equal(bytes.readUInt32BE(20),1024);
}
assert(fs.existsSync(path.join(root,'.github/workflows/android-apk.yml')));
console.log(`PASS project audit: ${files.length} TS/TSX files parse, ${checkedImports} local imports resolve, Android APK & iOS build config and icon assets present`);
