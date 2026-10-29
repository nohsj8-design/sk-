import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const endpoint='https://apis.data.go.kr/6260000/AttractionService/getAttractionKr';
export const clean=value=>String(value??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
export function safeUrl(value,base){
  if(!value)return '';
  try{const u=new URL(String(value).trim(),base);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||[...u.searchParams.keys()].some(k=>/key|token|secret|password/i.test(k)))return '';return u.href;}catch{return '';}
}
export function transform(item){
  const name=clean(item.MAIN_TITLE||item.PLACE||item.TITLE).replace(/\s*\((?:한|영|일|중간|중번|국문|영문|일문|중문|[,·/\s])+\)\s*$/,'').trim(),id=String(item.UC_SEQ??'');
  if(!/^\d+$/.test(id)||!name)throw new Error('INVALID_ITEM');
  const description=clean(item.ITEMCNTNTS);
  const context=[name,clean(item.TITLE),clean(item.PLACE)].join(' ');
  const theme=/사찰|사(寺)|범어사|용궁사|홍법사|국악|박물관|미술관|문화|역사|전시|기념관|향교|서원|책방/.test(context)?'문화·역사':/공원|숲|수목|산책|계곡|금정산|생태|갈맷길|수원지|연대봉|등산|습지/.test(context)?'자연·산책':/해수욕|해변|바다|해안|항구|등대|오륙도|태종대|광안|송도|해운대|가덕도|다대포|청사포|송정|이기대/.test(context)?'바다·풍경':'도시·골목';
  const lat=Number(item.LAT),lng=Number(item.LNG);
  return {id,name,district:clean(item.GUGUN_NM)||'지역 미제공',theme,subtitle:clean(item.SUBTITLE),summary:(description.match(/^.{1,150}?[.!?。](?:\s|$)/)?.[0]||description.slice(0,140)).trim()+(description.length>140&&!description.slice(0,140).match(/[.!?。]$/)&&!description.match(/^.{1,150}?[.!?。](?:\s|$)/)?'…':''),description,address:clean(item.ADDR1),telephone:clean(item.CNTCT_TEL),hours:clean(item.USAGE_DAY_WEEK_AND_TIME),openDays:clean(item.USAGE_DAY),closedDays:clean(item.HLDY_INFO),fee:clean(item.USAGE_AMOUNT),transport:clean(item.TRFC_INFO),facilities:clean(item.MIDDLE_SIZE_RM1),website:safeUrl(item.HOMEPAGE_URL),image:safeUrl(item.MAIN_IMG_NORMAL||item.MAIN_IMG_THUMB,'https://www.visitbusan.net'),coordinates:Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=34&&lat<=36&&lng>=128&&lng<=130?{lat,lng}:null};
}
async function collect(){
  let env='';try{env=await fs.readFile(path.join(root,'.env'),'utf8');}catch{}
  let key=env.match(/^\s*BUSAN_TOURISM_SERVICE_KEY\s*=\s*([^\r\n]+)\s*$/m)?.[1]?.trim().replace(/^(['"])(.*)\1$/,'$2');
  if(!key)throw new Error('MISSING_KEY');
  if(/%[0-9a-f]{2}/i.test(key)){try{key=decodeURIComponent(key);}catch{throw new Error('INVALID_KEY_ENCODING');}}
  const items=[];let total=null;
  for(let page=1;page<=100;page++){
    const url=new URL(endpoint);url.search=new URLSearchParams({serviceKey:key,numOfRows:'100',pageNo:String(page),resultType:'json'}).toString();
    let response;try{response=await fetch(url,{headers:{Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(30000)});}catch{throw new Error('NETWORK_ERROR');}
    if(!response.ok)throw new Error('HTTP_'+response.status);
    const text=await response.text();let json;try{json=JSON.parse(text);}catch{const code=text.match(/<(?:returnReasonCode|resultCode)>([A-Z0-9_]+)<\//i)?.[1];throw new Error(code?'API_'+code:'NON_JSON_RESPONSE');}
    const result=json.getAttractionKr||json.response||json;
    const header=result.header||json.header||{};
    if(header.resultCode!=null&&!['00','0','0000'].includes(String(header.resultCode)))throw new Error('API_'+String(header.resultCode).replace(/[^a-z0-9_]/gi,'').slice(0,30));
    const body=result.body||result;
    const count=Number(body.totalCount);if(!Number.isInteger(count)||count<1||count>10000)throw new Error('INVALID_TOTAL');
    if(total!==null&&count!==total)throw new Error('TOTAL_CHANGED');total=count;
    let batch=body.item||body.items?.item||body.items;
    if(batch&&!Array.isArray(batch))batch=[batch];if(!Array.isArray(batch)||!batch.length)throw new Error('EMPTY_PAGE');
    items.push(...batch.map(transform));
    if(items.length>=total)break;
  }
  if(items.length!==total||new Set(items.map(x=>x.id)).size!==total)throw new Error('INCOMPLETE_COLLECTION');
  items.sort((a,b)=>a.district.localeCompare(b.district,'ko')||a.name.localeCompare(b.name,'ko'));
  const output={schemaVersion:1,collectedAt:new Date().toISOString(),source:{name:'부산광역시_부산명소정보 서비스',url:'https://www.data.go.kr/data/15063481/openapi.do',endpoint},totalCount:items.length,items};
  const publicJson=JSON.stringify(output,null,2)+'\n';
  if(publicJson.includes(key)||publicJson.includes(encodeURIComponent(key))||/serviceKey\s*[:=]/i.test(publicJson))throw new Error('SECRET_IN_OUTPUT');
  const dir=path.join(root,'assets/data');await fs.mkdir(dir,{recursive:true});
  const target=path.join(dir,'busan-attractions.json');const temp=target+'.local';
  await fs.writeFile(temp,publicJson,'utf8');await fs.rename(temp,target);
  console.log(`Busan API collection succeeded: ${items.length} places. Saved public-only tourism data.`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  collect().catch(error=>{const code=/^[A-Z0-9_]+$/.test(error.message)?error.message:'COLLECTION_FAILED';console.error(`Busan API collection failed (${code}). Existing public data was preserved. Check the local key and API approval; credentials are never printed.`);process.exitCode=1;});
}
