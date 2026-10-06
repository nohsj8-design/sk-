(() => {
  const backTop = document.querySelector('.ls-back-top');
  if (backTop) {
    const updateBackTop = () => { backTop.hidden = window.scrollY < 400; };
    window.addEventListener('scroll', updateBackTop, {passive:true});
    updateBackTop();
    backTop.addEventListener('click', () => {
      document.querySelector('#main-content').focus({preventScroll:true});
      window.scrollTo({top:0, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    });
  }
  const panel = document.querySelector('.ls-lens-layout');
  if (!panel) return;
  const lenses = {
    history: {label:'첫 번째 창 · HISTORY',title:'그 시절 인물이<br>숨죽여 걷던 길',description:'역사적 인물의 AI 페르소나를 통해 장소의 기억을 새롭게 해석합니다. 산복도로의 계단과 부산항을 시간과 공간이라는 관점으로 읽습니다.',example:'아인슈타인이 바라본 산복도로의 굽어진 시공간',note:'역사 인물의 실제 기록이나 발언이 아닌, AI 페르소나를 활용한 에디토리얼 해석입니다.',caption:'역사적 인물의 시선 · 실제 서비스 화면'},
    editor: {label:'두 번째 창 · EDITOR',title:'골목의 온기와<br>토박이의 진짜 시선',description:'로컬 에디터의 일상에서 도시를 만납니다. 노포와 카페, 바이닐의 소리처럼 그곳을 살아가는 사람이 발견한 부산의 장면을 따라갑니다.',example:'바이닐의 홈을 걷는 골목의 오후',note:'장소의 이름뿐 아니라 소리와 취향, 생활의 이야기를 함께 읽습니다.',caption:'로컬 에디터의 시선 · 실제 서비스 화면'},
    artist: {label:'세 번째 창 · ARTIST',title:'도시의 캔버스,<br>공간과 예술의 미학',description:'건축과 시각예술의 관점으로 익숙한 풍경을 다시 봅니다. 산복도로의 입체적인 구조와 골목에 깃든 공간의 이야기를 발견합니다.',example:'동구 산복도로, 시간이 멈춘 골목의 기록',note:'예술가의 시선으로 도시의 형태와 공간에 남은 감각을 탐색합니다.',caption:'아티스트의 시선 · 실제 서비스 화면'}
  };
  document.querySelectorAll('.ls-lens-buttons button').forEach(button => {
    button.addEventListener('click', () => {
      const key=button.dataset.lens, lens=lenses[key];
      panel.dataset.lens=key;
      document.querySelectorAll('.ls-lens-buttons button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      document.getElementById('ls-lens-label').textContent=lens.label;
      document.getElementById('ls-lens-title').innerHTML=lens.title;
      document.getElementById('ls-lens-description').textContent=lens.description;
      document.getElementById('ls-lens-example').textContent=lens.example;
      document.getElementById('ls-lens-note').textContent=lens.note;
      const image=document.getElementById('ls-lens-image');
      image.src='assets/images/locatorial/screens-v24/'+key+'.png';
      image.alt=lens.caption+'의 추천 에디션 화면';
      document.getElementById('ls-lens-caption').textContent=lens.caption;
    });
  });
  ['editor','artist'].forEach(key=>{const image=new Image();image.src='assets/images/locatorial/screens-v24/'+key+'.png';});
})();
