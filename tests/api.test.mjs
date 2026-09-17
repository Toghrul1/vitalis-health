import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const data=mkdtempSync(join(process.env.JCODE_SCRATCH_DIR||tmpdir(),'vitalis-tests-'));
const base='http://127.0.0.1:3011';let server;
async function start(){server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3011'],{env:{...process.env,DATA_DIR:data},stdio:'ignore'});for(let i=0;i<100;i++){try{if((await fetch(base+'/api/doctors')).ok)return}catch{}await new Promise(r=>setTimeout(r,200))}throw Error('Server did not start')}
async function stop(){if(server&&server.exitCode===null){const exited=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await exited}}
before(start);after(async()=>{await stop();rmSync(data,{recursive:true,force:true})});
const date=new Date(Date.now()+86400000*3).toISOString().slice(0,10);
const appointment={doctorId:'sarah-chen',date,time:'09:00',name:'Demo Patient',email:'demo@example.com',visitType:'In-person'};
const post=(body,headers={})=>fetch(base+'/api/appointments',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('homepage and security headers',async()=>{const r=await fetch(base);assert.equal(r.status,200);assert.equal(r.headers.get('x-frame-options'),'DENY');assert.match(await r.text(),/Healthcare that/)});
test('doctor API filters specialties and keywords',async()=>{const r=await fetch(base+'/api/doctors?specialty=Cardiology&q=wilson');const d=await r.json();assert.equal(d.doctors.length,1);assert.equal(d.doctors[0].id,'james-wilson')});
test('unknown doctor has no availability',async()=>{assert.equal((await fetch(base+'/api/appointments?doctorId=invalid&date='+date)).status,400)});
test('rejects invalid fields and dates',async()=>{for(const update of [{email:'bad'},{doctorId:'missing'},{date:'2020-01-01'},{date:'2026-02-31'},{time:'25:00'},{name:''}])assert.equal((await post({...appointment,...update})).status,400)});
test('rejects cross-origin writes',async()=>{assert.equal((await post(appointment,{Origin:'https://example.com'})).status,403)});
test('booking persists across restart and prevents concurrent double booking',async()=>{const responses=await Promise.all([post(appointment),post(appointment)]);assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);const created=await responses.find(r=>r.status===201).json();assert.match(created.id,/^[a-f0-9-]{36}$/);await stop();await start();const result=await(await fetch(base+`/api/appointments?doctorId=sarah-chen&date=${date}`)).json();assert.ok(!result.slots.includes('09:00'));assert.ok(result.slots.includes('10:00'));assert.equal((await post(appointment)).status,409)});
test('prominent search form is rendered with an accessible label',async()=>{const html=await(await fetch(base)).text();assert.match(html,/role="search"/);assert.match(html,/id="site-search-input"/);assert.match(html,/Search doctors or specialties/)});
test('search matches names and specialties regardless of case or padding',async()=>{for(const q of ['  CHEN  ','primary care']){const data=await(await fetch(base+'/api/doctors?q='+encodeURIComponent(q))).json();assert.equal(data.doctors.length,1);assert.equal(data.doctors[0].id,'sarah-chen')}});
test('search handles no matches and blank queries',async()=>{const empty=await(await fetch(base+'/api/doctors?q=no-such-doctor')).json();assert.deepEqual(empty.doctors,[]);const all=await(await fetch(base+'/api/doctors?q=%20%20')).json();assert.equal(all.doctors.length,4)});
test('modern search provides all four specialty shortcuts',async()=>{const html=await(await fetch(base)).text();assert.match(html,/Great care starts with a search/);const chips=html.match(/<div class="search-chips">([\s\S]*?)<\/div>/)?.[1];assert.ok(chips);for(const specialty of ['Primary care','Cardiology','Mental wellness','Dermatology'])assert.ok(chips.includes(specialty));assert.equal((chips.match(/<button/g)||[]).length,4)});
