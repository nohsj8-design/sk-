export async function loadInquiryConfig() {
  const response = await fetch(new URL('../assets/chatbot/inquiry-config.json', import.meta.url), { cache:'no-store' });
  if (!response.ok) throw new Error('config');
  const config = await response.json();
  if (config.enabled) {
    const endpoint = new URL(config.endpoint);
    if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'xbxozzwccjpwuxcdzrup.supabase.co' || endpoint.pathname !== '/functions/v1/portfolio-inquiry') throw new Error('endpoint');
    const key = config.publicKey;
    if (typeof key !== 'string' || key.startsWith('sb_secret_')) throw new Error('key');
    if (!key.startsWith('sb_publishable_')) {
      const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
      if (payload.role !== 'anon') throw new Error('key');
    }
  }
  return config;
}
export function createInquiryForm(config, topic='admin', source='contact', onSuccess=()=>{}) {
  const el = (tag, text, cls) => { const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n; };
  const form=el('form',null,'inquiry-form');
  const labels=config.labels;
  const fields={};
  for(const [key,type,max] of [['name','text',80],['email','email',254],['message','textarea',2000]]) {
    const label=el('label',labels[key]);
    const input=el(type==='textarea'?'textarea':'input');
    if(type!=='textarea')input.type=type;
    input.name=key;input.required=true;input.maxLength=max;
    input.minLength=key==='message'?10:1;input.autocomplete=key==='message'?'off':key;
    if(key==='message')input.rows=4;
    label.append(input);form.append(label);fields[key]=input;
  }
  const honey=el('input');honey.name='website';honey.tabIndex=-1;honey.autocomplete='off';honey.className='inquiry-honey';honey.setAttribute('aria-hidden','true');form.append(honey);
  const notice=el('p',config.privacyNotice,'inquiry-notice');form.append(notice);
  const consentLabel=el('label',null,'inquiry-consent');const consent=el('input');consent.type='checkbox';consent.required=true;consent.name='consent';consentLabel.append(consent,el('span',labels.consent));form.append(consentLabel);
  const status=el('p',config.enabled?'':labels.unavailable,'inquiry-status');status.setAttribute('role','status');
  const submit=el('button',labels.submit,'inquiry-submit');submit.type='submit';submit.disabled=!config.enabled;form.append(submit,status);
  let busy=false,requestId=crypto.randomUUID(),startedAt=Date.now();
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!config.enabled||!form.reportValidity()||!consent.checked)return;
    busy=true;submit.disabled=true;submit.textContent=labels.submitting;status.textContent='';
    try {
      const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publicKey},body:JSON.stringify({requestId,name:fields.name.value.trim(),email:fields.email.value.trim(),message:fields.message.value.trim(),consent:true,privacyVersion:config.privacyVersion,topic,source,website:honey.value,startedAt}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok||result.ok!==true){status.textContent=response.status===429?labels.limited:response.status===400?labels.invalid:labels.failed;return;}
      form.reset();requestId=crypto.randomUUID();startedAt=Date.now();status.textContent=labels.success;onSuccess();
    }catch{status.textContent=labels.failed;}finally{busy=false;submit.disabled=false;submit.textContent=labels.submit;}
  });
  return form;
}
