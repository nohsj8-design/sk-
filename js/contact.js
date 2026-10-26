import {loadInquiryConfig,createInquiryForm} from './inquiry.js';
const slot=document.getElementById('contact-form');
const topic=document.getElementById('inquiry-topic');
try{const config=await loadInquiryConfig();const render=()=>slot.replaceChildren(createInquiryForm(config,topic.value,'contact'));render();topic.addEventListener('change',render);}catch{slot.textContent='문의 양식을 불러오지 못했습니다. 잠시 후 다시 이용해 주세요.';}
