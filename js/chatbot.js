import {findNode,restoreSession} from './chatbot-rules.mjs';
import {loadInquiryConfig,createInquiryForm} from './inquiry.js';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const root=el('aside',null,'chatbot');root.setAttribute('aria-label','771 채팅 안내');
const launch=el('button','문의 · 안내 ↗','chatbot-launch');launch.type='button';launch.setAttribute('aria-controls','chatbot-panel');launch.setAttribute('aria-expanded','false');root.append(launch);document.body.append(root);
async function start(){
  const response=await fetch(new URL('../assets/chatbot/flow.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw new Error('flow');const flow=await response.json();
  const config=await loadInquiryConfig();const key='771-chatbot-v1';let storageOK=true;
  const fresh=()=>({version:flow.version,node:flow.start,path:[flow.start],messages:[{role:'bot',text:flow.welcome}],open:false});
  let state=fresh();try{state=restoreSession(sessionStorage.getItem(key),flow)||state;}catch{storageOK=false;}
  launch.setAttribute('aria-label',flow.labels.open);
  const panel=el('section',null,'chatbot-panel');panel.id='chatbot-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','chatbot-title');
  const header=el('header',null,'chatbot-header');const heading=el('div');const title=el('h2',flow.title);title.id='chatbot-title';heading.append(title,el('p',flow.subtitle));
  const close=el('button','×');close.type='button';close.setAttribute('aria-label',flow.labels.close);header.append(heading,close);
  const scroll=el('div',null,'chatbot-scroll');const log=el('div',null,'chatbot-log');log.setAttribute('role','log');log.setAttribute('aria-live','polite');log.setAttribute('aria-relevant','additions');
  const choices=el('div',null,'chatbot-choices');choices.setAttribute('aria-label','다음 선택지');const formSlot=el('div');scroll.append(log,choices,formSlot);
  const controls=el('nav',null,'chatbot-controls');controls.setAttribute('aria-label','대화 이동');
  const status=el('p',null,'chatbot-status');status.setAttribute('role','status');
  const inputForm=el('form',null,'chatbot-input');const input=el('input');input.type='text';input.maxLength=300;input.required=true;input.autocomplete='off';input.setAttribute('aria-label',flow.labels.input);input.placeholder=flow.labels.placeholder;
  const send=el('button',flow.labels.send);send.type='submit';inputForm.append(input,send);
  const privacy=el('p','질문에 개인정보를 입력하지 마세요. 문의 양식은 별도로 제공됩니다.','chatbot-footnote');panel.append(header,scroll,controls,status,inputForm,privacy);root.append(panel);
  function save(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch{storageOK=false;status.textContent=flow.labels.storageUnavailable;}}
  function show(open,persist=true){state.open=open;panel.hidden=!open;launch.setAttribute('aria-expanded',String(open));if(persist)save();if(open){close.focus();scroll.scrollTop=scroll.scrollHeight;}else launch.focus();}
  function bubble(message){const n=el('p',message.text,'chatbot-message '+message.role);log.append(n);}
  function add(role,text){state.messages.push({role,text});if(state.messages.length>160){state.messages.splice(0,state.messages.length-160);log.replaceChildren();state.messages.forEach(bubble);}else bubble({role,text});}
  function renderChoices(custom){
    choices.replaceChildren();formSlot.replaceChildren();
    const node=flow.nodes[state.node];
    for(const button of custom||node.buttons||[]){
      if(button.next){const b=el('button',button.label);b.type='button';b.addEventListener('click',()=>go(button.next,button.label));choices.append(b);}
      else if(button.href){const url=new URL(button.href,location.href);if(url.origin!==location.origin)continue;const a=el('a',button.label);a.href=url.href;choices.append(a);}
    }
    if(!custom&&node.form)formSlot.append(createInquiryForm(config,node.form,'chatbot',()=>{add('bot',flow.labels.inquirySent);save();scroll.scrollTop=scroll.scrollHeight;}));
  }
  function go(id,label){if(!Object.hasOwn(flow.nodes,id))return;if(label)add('user',label);state.node=id;state.path.push(id);if(state.path.length>80)state.path.splice(1,state.path.length-80);add('bot',flow.nodes[id].answer);renderChoices();save();scroll.scrollTop=scroll.scrollHeight;}
  for(const action of ['previous','home','reset']){
    const b=el('button',flow.labels[action]);b.type='button';controls.append(b);
    b.addEventListener('click',()=>{
      status.textContent='';
      if(action==='reset'){try{sessionStorage.removeItem(key);}catch{}state=fresh();state.open=true;log.replaceChildren();state.messages.forEach(bubble);input.value='';renderChoices();status.textContent=flow.labels.resetDone;scroll.scrollTop=0;return;}
      if(action==='previous'){if(state.path.length<2){status.textContent=flow.labels.noPrevious;return;}state.path.pop();state.node=state.path.at(-1);}
      else{state.node=flow.start;state.path=[flow.start];}
      add('bot',flow.nodes[state.node].answer);renderChoices();save();scroll.scrollTop=scroll.scrollHeight;
    });
  }
  inputForm.addEventListener('submit',event=>{event.preventDefault();const text=input.value.trim();if(!text)return;input.value='';add('user',text);const id=findNode(text,flow);if(id)go(id);else{add('bot',flow.fallback);renderChoices([...flow.nodes.home.buttons,{label:'제작 문의',next:'production'}]);save();scroll.scrollTop=scroll.scrollHeight;}});
  launch.addEventListener('click',()=>show(!state.open));close.addEventListener('click',()=>show(false));panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();show(false);}});
  state.messages.forEach(bubble);renderChoices();panel.hidden=!state.open;launch.setAttribute('aria-expanded',String(state.open));if(!storageOK)status.textContent=flow.labels.storageUnavailable;
}
start().catch(()=>{launch.textContent='문의 페이지 →';launch.addEventListener('click',()=>{location.href='contact.html';});});
