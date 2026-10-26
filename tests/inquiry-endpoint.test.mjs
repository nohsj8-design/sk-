import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const code=stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/portfolio-inquiry/index.ts',import.meta.url),'utf8'));
const origin='https://nohsj8-design.github.io';
function endpoint(result='ok'){
  let handler,calls=[];
  new Function('Deno','fetch','crypto',code)({serve:h=>handler=h,env:{get:key=>key==='SUPABASE_URL'?'https://example.supabase.co':'test-server-only-secret'}},async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(result));},crypto);
  return {handler,calls};
}
const valid=()=>({requestId:crypto.randomUUID(),name:'TEST',email:'test@example.com',message:'테스트용 문의 내용입니다.',consent:true,privacyVersion:'2026-10-26-v1',source:'chatbot',topic:'admin',website:'',startedAt:Date.now()-5000});
const request=(body,from=origin)=>new Request('https://example.supabase.co/functions/v1/portfolio-inquiry',{method:'POST',headers:{Origin:from,'Content-Type':'application/json','x-forwarded-for':'192.0.2.1'},body:JSON.stringify(body)});
test('rejects foreign origin and invalid consent without database request',async()=>{
  const {handler,calls}=endpoint();
  assert.equal((await handler(request(valid(),'https://example.org'))).status,403);
  for(const patch of [{consent:false},{email:'invalid'},{message:'short'},{website:'spam'},{startedAt:Date.now()},{name:'x'.repeat(81)},{source:'unknown'},{requestId:'not-uuid'}])assert.equal((await handler(request({...valid(),...patch}))).status,400);
  assert.equal(calls.length,0);
});
test('valid submission uses privileged server RPC with hashed IP and email',async()=>{
  const {handler,calls}=endpoint();const response=await handler(request(valid()));assert.equal(response.status,200);assert.equal((await response.json()).ok,true);assert.equal(calls.length,1);
  const body=JSON.parse(calls[0].options.body);assert.equal(body.p_source,'portfolio-chatbot-admin');assert.match(body.p_ip_hash,/^[a-f0-9]{64}$/);assert.match(body.p_email_hash,/^[a-f0-9]{64}$/);assert.ok(!calls[0].options.body.includes('192.0.2.1'));
});
test('rate limit and invalid result cannot appear as success',async()=>{
  for(const [result,status] of [['limited',429],['invalid',400]]){const {handler}=endpoint(result);const response=await handler(request(valid()));assert.equal(response.status,status);assert.equal((await response.json()).ok,false);}
});
test('preflight allows only known origin and POST',async()=>{
  const {handler,calls}=endpoint();const response=await handler(new Request('https://example.supabase.co',{method:'OPTIONS',headers:{Origin:origin}}));assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-origin'),origin);assert.equal(calls.length,0);
});
