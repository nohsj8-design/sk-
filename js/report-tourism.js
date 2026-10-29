(() => {
  const grid=document.getElementById('tourism-grid');if(!grid)return;
  const search=document.getElementById('tourism-search'),district=document.getElementById('tourism-district'),status=document.getElementById('tourism-status');
  const dialog=document.getElementById('tourism-detail'),content=document.getElementById('tourism-detail-content');
  const previous=document.getElementById('tourism-previous'),next=document.getElementById('tourism-next'),pageLabel=document.getElementById('tourism-page');
  const themes=[...document.querySelectorAll('[data-tourism-theme]')];let places=[],theme='',page=1,lastFocus=null;const size=9;
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
  function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password&&![...u.searchParams.keys()].some(k=>/key|token|secret|password/i.test(k))?u.href:null;}catch{return null;}}
  function image(place,cls){const img=el('img',null,cls);img.src=safeUrl(place.image);img.alt=place.name+' · 부산광역시 제공 이미지';img.loading='lazy';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{if(cls){img.remove();}else{img.parentElement.replaceChildren(el('span','BUSAN / '+place.district));}},{once:true});return img;}
  function detail(place){
    lastFocus=document.activeElement;content.replaceChildren();
    content.append(el('p',place.district+' / '+place.theme),el('h2',place.name));content.querySelector('h2').id='tourism-detail-title';
    if(place.subtitle)content.append(el('p',place.subtitle));
    if(safeUrl(place.image))content.append(image(place,'tourism-detail-image'));
    content.append(el('h3','장소 이야기'),el('p',place.description||'상세 설명이 제공되지 않았습니다.'));
    const facts=el('dl',null,'tourism-facts');
    for(const [title,value] of [['주소',place.address],['운영시간',place.hours],['운영일',place.openDays],['휴무일',place.closedDays],['이용요금',place.fee],['문의',place.telephone],['교통',place.transport],['편의시설',place.facilities]]){const row=el('div');row.append(el('dt',title),el('dd',value||'제공 정보 없음'));facts.append(row);}content.append(facts);
    const links=el('div',null,'tourism-detail-links');
    const addLink=(text,url)=>{const a=el('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);};
    if(safeUrl(place.website))addLink('공식 홈페이지 ↗',safeUrl(place.website));
    const c=place.coordinates;if(c&&Number.isFinite(c.lat)&&Number.isFinite(c.lng))addLink('지도에서 위치 보기 ↗',`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=16/${c.lat}/${c.lng}`);
    addLink('공공데이터 출처 ↗','https://www.data.go.kr/data/15063481/openapi.do');content.append(links,el('p','운영시간·요금 등은 제공기관 자료입니다. 방문 전 해당 시설의 공식 안내를 확인해 주세요.','tourism-note'));
    dialog.showModal();dialog.scrollTop=0;dialog.querySelector('button').focus();
  }
  function render(){
    const q=search.value.trim().toLocaleLowerCase('ko');const filtered=places.filter(p=>(!district.value||p.district===district.value)&&(!theme||p.theme===theme)&&(!q||[p.name,p.district,p.address,p.subtitle,p.description].join(' ').toLocaleLowerCase('ko').includes(q)));
    const count=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,count);grid.replaceChildren();
    for(const p of filtered.slice((page-1)*size,page*size)){
      const article=el('article',null,'tourism-place'),photo=el('div',null,'tourism-image');
      if(safeUrl(p.image))photo.append(image(p));else photo.append(el('span','BUSAN / '+p.district));
      const body=el('div',null,'tourism-card-body'),label=el('div',null,'tourism-card-label');label.append(el('span',p.district),el('span',p.theme));
      const button=el('button','장소 정보 살펴보기 ↗');button.type='button';button.setAttribute('aria-label',p.name+' 장소 정보 살펴보기');button.setAttribute('aria-haspopup','dialog');button.addEventListener('click',()=>detail(p));
      body.append(label,el('h3',p.name),el('p',p.summary||p.subtitle||'공식 관광정보에서 장소의 이야기를 확인하세요.'),el('p',p.address||'주소 정보 미제공','tourism-address'),button);article.append(photo,body);grid.append(article);
    }
    if(!filtered.length)grid.append(el('p','조건에 맞는 장소가 없습니다. 검색어나 지역을 바꿔보세요.','tourism-empty'));
    status.textContent=`전체 ${places.length}곳 중 ${filtered.length}곳 · ${filtered.length?((page-1)*size+1)+'–'+Math.min(page*size,filtered.length)+'번째 장소':'검색 결과 없음'}`;
    pageLabel.textContent=page+' / '+count;previous.disabled=page===1;next.disabled=page===count;
  }
  search.addEventListener('input',()=>{page=1;render();});district.addEventListener('change',()=>{page=1;render();});
  themes.forEach(b=>b.addEventListener('click',()=>{theme=b.dataset.tourismTheme;themes.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));page=1;render();}));
  for(const [button,delta] of [[previous,-1],[next,1]])button.addEventListener('click',()=>{page+=delta;render();document.getElementById('tourism-library-title').scrollIntoView({behavior:'instant',block:'start'});grid.querySelector('button')?.focus({preventScroll:true});});
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>lastFocus?.focus());
  fetch('assets/data/busan-attractions.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('data');return r.json();}).then(data=>{
    if(data.schemaVersion!==1||!Array.isArray(data.items)||!data.items.length||data.totalCount!==data.items.length)throw new Error('schema');
    places=data.items;const fragment=document.createDocumentFragment();[...new Set(places.map(p=>p.district))].sort((a,b)=>a.localeCompare(b,'ko')).forEach(name=>{const option=el('option',name);option.value=name;fragment.append(option);});district.append(fragment);
    const date=new Date(data.collectedAt);document.getElementById('tourism-updated').textContent=Number.isFinite(date.getTime())?'자료 수집 · '+new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium'}).format(date):'부산광역시 제공 자료';render();
  }).catch(()=>{status.textContent='관광정보를 불러오지 못했습니다. 잠시 후 페이지를 새로고침해 주세요.';grid.replaceChildren(el('p','공공데이터 관광정보를 준비 중입니다.','tourism-empty'));previous.disabled=true;next.disabled=true;pageLabel.textContent='—';});
})();
