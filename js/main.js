document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".site-nav a");
  const year = document.querySelector("[data-current-year]");

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "메뉴 열기");
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "메뉴 열기" : "메뉴 닫기");
      nav.classList.toggle("open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 800) closeMenu();
    });
  }

  if (year) year.textContent = new Date().getFullYear();

  const filterButtons = document.querySelectorAll("[data-filter]");
  const filterItems = document.querySelectorAll("[data-category]");
  const visibleCount = document.querySelector("[data-visible-count]");

  if (filterButtons.length && filterItems.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selected = button.dataset.filter;
        let count = 0;

        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        filterItems.forEach((item) => {
          const show = selected === "all" || item.dataset.category === selected;
          item.classList.toggle("is-hidden", !show);
          if (show) count += 1;
        });

        if (visibleCount) visibleCount.textContent = count;
      });
    });
  }

  const resourceData = {
    f1963: {
      index: "01",
      title: "F1963",
      heroImage: "assets/images/reports/place-f1963.png",
      heroAlt: "재생 문화공간 F1963 외관",
      type: "역사·문화 / 산업유산 재생",
      summary: "재생건축·공장 흔적·전시가 한 화면에 잡혀 시각성과 전환 스토리가 모두 강함",
      location: "수영구 망미동",
      experience: "전시 관람 · 공간 탐방 · 서점 · 카페 · 정원 산책",
      season: "사계절 / 오후~저녁",
      programs: [
        ["SPACE WALK", "공장 흔적 탐방", "와이어 공장의 구조와 재생된 건축 요소를 따라 공간의 전환 과정을 관찰합니다.", "assets/images/reports/watercolor-f1963-factory.png", "F1963 공장 흔적 탐방 수채화"],
        ["ART & BOOK", "전시·서점 큐레이션", "기획 전시와 서점을 함께 둘러보며 공간이 제안하는 문화적 시선을 경험합니다.", "assets/images/reports/watercolor-f1963-art-book.png", "F1963 전시와 서점 수채화"],
        ["SLOW MOMENT", "정원 산책", "카페와 정원을 천천히 걸으며 산업 공간에 더해진 자연의 분위기를 기록합니다.", "assets/images/reports/watercolor-f1963-garden.png", "F1963 정원 산책 수채화"]
      ],
      quote: "방문자 후기를 준비하고 있습니다.",
      reviews: []
    },
    kkangkkaengi: {
      index: "02",
      title: "깡깡이예술마을",
      heroImage: "assets/images/reports/place-kkangkkaengi.png",
      heroAlt: "깡깡이예술마을 안내센터 외관",
      type: "역사·문화 / 산업·마을 관광",
      summary: "‘깡깡’ 소리와 실제 선박수리 현장이 있어 소리·산업·생활사를 동시에 콘텐츠화 가능",
      location: "영도구 대평동",
      experience: "마을 골목 탐방 · 조선소 경관 관람 · 공공예술 감상 · 사진 촬영",
      season: "봄·가을 / 낮~오후",
      programs: [
        ["VILLAGE WALK", "골목 이야기 탐방", "마을 골목을 걸으며 선박수리 산업과 주민들의 생활사를 발견합니다.", "assets/images/reports/watercolor-kkangkkaengi-alley.png", "깡깡이예술마을 골목 탐방 수채화"],
        ["SOUND SCAPE", "깡깡 소리 기록", "현장에서 들리는 작업 소리를 채집해 마을만의 독특한 리듬을 경험합니다.", "assets/images/reports/watercolor-kkangkkaengi-sound.png", "깡깡이예술마을 선박수리 소리 기록 수채화"],
        ["PUBLIC ART", "공공예술 산책", "골목 곳곳의 작품과 조선소 경관을 함께 감상하며 사진으로 기록합니다.", "assets/images/reports/watercolor-kkangkkaengi-art.png", "깡깡이예술마을 공공예술 산책 수채화"]
      ],
      quote: "방문자 후기를 준비하고 있습니다.",
      reviews: []
    },
    "modern-history": {
      index: "03",
      title: "부산근현대역사관",
      heroImage: "assets/images/reports/place-modern-history.png",
      heroAlt: "부산근현대역사관 외관",
      type: "역사·문화 / 박물관·근현대유산",
      summary: "건물 자체의 역사와 전시가 결합되어 근현대 부산을 설명하기 쉬움",
      location: "중구 대청동",
      experience: "상설·기획전시 관람 · 근현대사 탐방 · 건축 공간 관람",
      season: "사계절 / 오전~오후",
      programs: [
        ["EXHIBITION", "상설전시 관람", "부산의 근현대 변화와 시민의 삶을 자료와 이야기로 차근차근 살펴봅니다.", "assets/images/reports/watercolor-history-exhibition.png", "부산근현대역사관 상설전시 수채화"],
        ["HISTORY WALK", "원도심 역사 탐방", "역사관을 시작점으로 대청동과 원도심의 근현대 장소를 연결해 걷습니다.", "assets/images/reports/watercolor-history-walk.png", "부산 원도심 역사 탐방 수채화"],
        ["ARCHITECTURE", "건축 공간 관찰", "건물에 남아 있는 시대의 흔적과 새로운 공간 활용 방식을 함께 관찰합니다.", "assets/images/reports/watercolor-history-architecture.png", "부산근현대역사관 건축 관찰 수채화"]
      ],
      quote: "방문자 후기를 준비하고 있습니다.",
      reviews: []
    },
    gugak: {
      index: "04",
      title: "국립부산국악원 국악체험관",
      heroImage: "assets/images/reports/place-gugak-center.png",
      heroAlt: "국립부산국악원 전경",
      type: "전통문화·체험 관광 / 음악 체험",
      summary: "영남의 민요와 국악기를 직접 듣고 연주하며 부산에서 지역의 소리를 체험할 수 있는 음악 관광자원",
      location: "부산진구 국악로 2",
      experience: "악가무 디지털 전시 · 영남춤 실감형 전시 · 영남민요 인터랙티브 악기 체험",
      season: "사계절 / 공연·체험 프로그램 운영일 중심",
      programs: [
        ["DIGITAL ARCHIVE", "영남의 악가무 디지털 전시", "영남의 음악과 노래, 춤을 디지털 자료로 살펴보며 지역별 전통문화를 쉽게 이해하는 전시입니다.", "assets/images/reports/watercolor-gugak-digital-archive.png", "영남의 악가무 디지털 전시 수채화"],
        ["IMMERSIVE DANCE", "영남춤 실감형 전시", "실감형 영상으로 영남 전통춤의 움직임과 공간감을 생생하게 감상하는 콘텐츠입니다."],
        ["INTERACTIVE MUSIC", "영남민요 인터랙티브 악기 체험", "영남민요를 들으며 전통악기를 직접 조작해보는 참여형 국악 체험입니다."]
      ],
      quote: "디지털 전시와 음악, 전통춤을 다양한 방식으로 경험할 수 있어 오래 머물게 되는 공간이었어요.",
      reviews: [
        ["사용자 1", "무료로 즐길 수 있는 아름다운 전시 공간입니다. 옛 문화와 LP 체험, 사진 촬영까지 시간 가는 줄 모르고 둘러봤어요."],
        ["사용자 2", "조선시대 작품과 음악을 취향에 맞게 조절해 감상할 수 있어 몰입감이 좋았고 깊은 감동을 받았습니다."],
        ["사용자 3", "별신굿 참여 안내와 준비가 충분하지 않아 아쉬웠습니다. 참여 대상과 진행 방식을 더 명확히 안내해주면 좋겠어요."]
      ]
    }
  };

  const resourceCards = document.querySelectorAll("[data-resource]");
  const resourceModal = document.querySelector("#resource-modal");

  if (resourceCards.length && resourceModal) {
    const modalContent = resourceModal.querySelector("[data-modal-scroll]");
    const categoryButtons = resourceModal.querySelectorAll("[data-modal-target]");
    const closeButtons = resourceModal.querySelectorAll("[data-modal-close]");
    const programList = resourceModal.querySelector("[data-modal-program-list]");
    const reviewList = resourceModal.querySelector("[data-modal-review-list]");
    const reviewSummary = resourceModal.querySelector(".review-summary");
    const placeImage = resourceModal.querySelector("[data-modal-place-image]");
    let previouslyFocused = null;
    let scrollFrame = null;

    const setText = (selector, value) => {
      const element = resourceModal.querySelector(selector);
      if (element) element.textContent = value;
    };

    const renderPrograms = (programs) => {
      programList.innerHTML = programs.map((program, index) => `
        <article class="experience-card">
          ${program[3]
            ? `<div class="experience-card-image"><img src="${program[3]}" alt="${program[4] || ""}"></div>`
            : `<div class="experience-card-mark pending" aria-label="이미지 준비중">이미지 준비중</div>`}
          <small>${program[0]}</small>
          <h4>${program[1]}</h4>
          <p>${program[2]}</p>
        </article>
      `).join("");
    };

    const renderReviews = (reviews) => {
      reviewSummary.hidden = reviews.length === 0;
      if (!reviews.length) {
        reviewList.innerHTML = `<div class="review-pending"><strong>방문자 후기 준비중</strong><p>이 장소의 실제 방문 후기를 정리하고 있습니다.</p></div>`;
        return;
      }
      reviewList.innerHTML = reviews.map((review, index) => `
        <article class="review-card">
          <div class="review-card-head">
            <span class="review-avatar" aria-hidden="true">${index + 1}</span>
            <div><strong>사용자 ${index + 1}</strong><span aria-label="별점 5점">★★★★★</span></div>
          </div>
          <p>${review[1]}</p>
        </article>
      `).join("");
    };

    const setActiveCategory = (targetId) => {
      categoryButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.modalTarget === targetId);
      });
    };

    const openModal = (resourceKey, trigger) => {
      const data = resourceData[resourceKey];
      if (!data) return;

      previouslyFocused = trigger;
      setText("[data-modal-index]", `BUSAN · ${data.index}`);
      setText("[data-modal-title]", data.title);
      setText("[data-modal-side-title]", data.title);
      setText("[data-modal-visual-title]", data.title);
      setText("[data-modal-type]", data.type);
      setText("[data-modal-summary]", data.summary);
      setText("[data-modal-location]", data.location);
      setText("[data-modal-fact-location]", data.location);
      setText("[data-modal-experience]", data.experience);
      setText("[data-modal-season]", data.season);
      setText("[data-modal-review-quote]", `“${data.quote}”`);
      placeImage.src = data.heroImage;
      placeImage.alt = data.heroAlt;
      renderPrograms(data.programs);
      renderReviews(data.reviews);

      resourceModal.hidden = false;
      resourceModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      modalContent.scrollTop = 0;
      setActiveCategory("modal-overview");
      resourceModal.querySelector(".modal-close").focus();
    };

    const closeModal = () => {
      resourceModal.setAttribute("aria-hidden", "true");
      resourceModal.hidden = true;
      document.body.classList.remove("modal-open");
      if (previouslyFocused) previouslyFocused.focus();
    };

    resourceCards.forEach((card) => {
      card.addEventListener("click", () => openModal(card.dataset.resource, card));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal(card.dataset.resource, card);
        }
      });
    });

    closeButtons.forEach((button) => button.addEventListener("click", closeModal));

    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const section = resourceModal.querySelector(`#${button.dataset.modalTarget}`);
        if (!section) return;
        setActiveCategory(button.dataset.modalTarget);
        modalContent.scrollTo({ top: section.offsetTop, behavior: "smooth" });
      });
    });

    modalContent.addEventListener("scroll", () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const sections = [...resourceModal.querySelectorAll("[data-modal-section]")];
        const current = sections.reduce((selected, section) => {
          return section.offsetTop <= modalContent.scrollTop + 100 ? section : selected;
        }, sections[0]);
        if (current) setActiveCategory(current.id);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (resourceModal.hidden) return;

      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key === "Tab") {
        const focusable = [...resourceModal.querySelectorAll("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }
});
