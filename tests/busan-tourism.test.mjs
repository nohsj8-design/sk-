import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {clean,safeUrl,transform} from '../scripts/fetch-busan-tourism.mjs';
test('API fields become public tourism content without invented values',()=>{
  const p=transform({UC_SEQ:12,MAIN_TITLE:'범어사(한,영,중간,중번,일)',GUGUN_NM:'금정구',ITEMCNTNTS:'<p>산사의 이야기입니다.</p>',LAT:'35.28',LNG:'129.06',MAIN_IMG_NORMAL:'/uploadImgs/test.jpg'});
  assert.equal(p.name,'범어사');assert.equal(p.theme,'문화·역사');assert.equal(p.description,'산사의 이야기입니다.');assert.equal(p.fee,'');assert.equal(p.hours,'');assert.equal(p.image,'https://www.visitbusan.net/uploadImgs/test.jpg');assert.deepEqual(p.coordinates,{lat:35.28,lng:129.06});
});
test('unsafe URLs, secret query parameters and invalid IDs are rejected',()=>{
  for(const value of ['javascript:alert(1)','data:text/html,test','https://user:password@example.com','https://example.com/?serviceKey=secret','https://example.com/?access_token=secret'])assert.equal(safeUrl(value),'');
  assert.equal(safeUrl('https://www.busan.go.kr'),'https://www.busan.go.kr/');assert.throws(()=>transform({UC_SEQ:'bad',MAIN_TITLE:'장소'}));assert.equal(clean('<b>부산</b> &amp; 여행'),'부산 & 여행');
});
test('actual collection is complete and does not contain the local service key',()=>{
  const text=fs.readFileSync(new URL('../assets/data/busan-attractions.json',import.meta.url),'utf8');const data=JSON.parse(text);
  assert.equal(data.items.length,data.totalCount);assert.ok(data.totalCount>0);assert.equal(new Set(data.items.map(p=>p.id)).size,data.totalCount);assert.equal(new Set(data.items.map(p=>p.district)).size,16);
  const envPath=new URL('../.env',import.meta.url);if(fs.existsSync(envPath)){let key=fs.readFileSync(envPath,'utf8').match(/^BUSAN_TOURISM_SERVICE_KEY=(.+)$/m)?.[1].trim();assert.ok(key);assert.equal(text.includes(key),false);try{key=decodeURIComponent(key);}catch{}assert.equal(text.includes(key),false);assert.equal(text.includes(encodeURIComponent(key)),false);}
});
