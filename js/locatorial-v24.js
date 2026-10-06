(() => {
  const root = document.querySelector('.lv-page');
  if (!root) return;
  const themes = [
    ['선셋 로즈 & 핑크','선셋 로즈','#E11D48','#881337','#FECDD3','#FFE4E6','#881337, #be185d, #e11d48','다대포·해운대 노을빛 바다의 화사하고 다정한 여행 감성.'],
    ['포레스트 세이지 & 그린','포레스트 세이지','#059669','#064E3B','#D1FAE5','#ECFDF5','#064e3b, #059669, #10b981','범어사 숲길과 동백섬의 싱그러운 상록 숨결. 정갈한 휴식과 회복.'],
    ['미드나잇 네이비 & 블루','미드나잇 네이비','#1D4ED8','#1E3A8A','#DBEAFE','#EFF6FF','#1e3a8a, #1d4ed8, #2563eb','심야 부산 앞바다의 지성적인 고요와 달빛 물결. 매거진의 신뢰감.'],
    ['심플 모노크롬 & 블랙','심플 모노크롬','#1C231E','#000000','#E5E5E5','#F4F4F4','#09090b, #1c231e, #3f3f46','종이에 번지는 먹의 묵직한 농담과 독립 출판의 담백한 절제미.'],
    ['역사적 인물의 시선','역사적 인물','#9333EA','#581C87','#E9D5FF','#FAF5FF','#581c87, #7e22ce, #a855f7','영도 철강 골목과 피란 시절의 세월을 비추는 찬연한 보석빛.'],
    ['로컬 에디터의 시선','로컬 에디터','#FDFD8B','#5A2E12','#FDFD8B','#FFFEED','#5a2e12, #c27803, #fdfd8b','자갈치 난전 백열등과 전포의 짙은 에스프레소 크레마. 버터의 온기.'],
    ['아티스트의 시선','아티스트','#0284C7','#0369A1','#BAE6FD','#F0F9FF','#0369a1, #0284c7, #38bdf8','흰여울마을 절벽 수평선의 반짝이는 윤슬과 청사포 맑은 파도의 감각적 영감.']
  ];
  const buttons = [];
  function select(index) {
    const t = themes[index];
    ['primary','dark','badge','tint'].forEach((key,i)=>root.style.setProperty('--lv-'+key,t[i+2]));
    root.style.setProperty('--lv-gradient','linear-gradient(to right, '+t[6]+')');
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    document.getElementById('lv-active-kind').textContent=index<4?'계절 에디토리얼':'도시를 바라보는 시선';
    document.getElementById('lv-active-title').textContent=t[0];
    document.getElementById('lv-active-story').textContent=t[7];
    document.getElementById('lv-color-values').textContent='PRIMARY '+t[2]+' / DARK '+t[3]+(index===5?' / CREMA #C27803':index===6?' / LIGHT #38BDF8':'');
    document.getElementById('lv-selection-status').textContent=t[0]+' 테마 선택됨';
  }
  themes.forEach((t,i)=>{
    const button=document.createElement('button');
    button.type='button';button.className='lv-option';button.setAttribute('aria-pressed','false');
    const swatch=document.createElement('span');swatch.className='lv-swatch';swatch.style.background=t[2];swatch.setAttribute('aria-hidden','true');
    button.append(swatch,document.createTextNode(t[1]));button.addEventListener('click',()=>select(i));buttons.push(button);
    document.getElementById(i<4?'lv-season':'lv-perspectives').append(button);
    const article=document.createElement('article'),bar=document.createElement('div'),title=document.createElement('h3'),story=document.createElement('p');
    bar.className='lv-mood-bar';bar.style.background='linear-gradient(to right, '+t[6]+')';bar.setAttribute('aria-hidden','true');
    title.textContent=t[0];story.textContent=t[7];article.append(bar,title,story);document.getElementById('lv-philosophy').append(article);
  });
  select(2);
})();
