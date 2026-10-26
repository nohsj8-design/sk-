import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {findNode,restoreSession} from '../js/chatbot-rules.mjs';
const flow=JSON.parse(readFileSync(new URL('../assets/chatbot/flow.json',import.meta.url)));
test('registered keyword priority and unknown input',()=>{
  for(const [text,id] of [['오늘 조회수 알려줘','today'],['이번 주 인사이트','week'],['제작 문의 남길게요','production'],['관리자 문의','admin'],['OPENAI 사용하나요','aboutBot'],['버츄얼 부산 소개','channel'],['미수집은 0인가','missing'],['누적 기준일','period'],['비가 올까?',null],['   ',null]])assert.equal(findNode(text,flow),id,text);
});
test('all menu transitions and internal links are valid',()=>{
  for(const node of Object.values(flow.nodes))for(const button of node.buttons||[]){assert.ok(button.label);if(button.next)assert.ok(Object.hasOwn(flow.nodes,button.next));else assert.match(button.href,/^[a-z-]+\.html(?:#[-a-z]+)?$/);}
  assert.equal(flow.fallback,'등록된 안내를 찾지 못했어요. 아래 메뉴를 선택하거나 제작문의를 남겨주세요');
});
test('valid session restores only intended fields',()=>{
  const s={version:1,node:'today',path:['home','today'],messages:[{role:'bot',text:'안내입니다.'}],open:true,extra:'ignored'};
  assert.deepEqual(restoreSession(JSON.stringify(s),flow),{version:1,node:s.node,path:s.path,messages:s.messages,open:true});
});
test('invalid or oversized session is discarded',()=>{
  const base={version:1,node:'home',path:['home'],messages:[{role:'bot',text:'안내입니다.'}],open:false};
  for(const patch of [{version:2},{node:'unknown'},{path:['today']},{path:['home','invalid','home']},{messages:[{role:'system',text:'x'}]},{messages:[{role:'bot',text:'x'.repeat(2501)}]},{messages:[]}])assert.equal(restoreSession(JSON.stringify({...base,...patch}),flow),null);
  assert.equal(restoreSession('{broken',flow),null);
});
