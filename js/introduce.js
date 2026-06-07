const districts = [
  {
    chapter: "Chapter 1",
    title: "상명대 상가",
    desc: "가파른 경사를 따라 형성된 독특한 지형만큼이나, 그 상권을 이용하는 이들의 개성 있는 라이프스타일이 고스란히 묻어나는 파편들을 채집했다.",
    image: "./assets/images/상명대상가.png",
    alt: "상명대 상가 지도",
  },
  {
    chapter: "Chapter 2",
    title: "호서대 상가",
    desc: "호서대 주변 상권에서 발견되는 쓰레기와 이동 흔적을 통해, 학생들의 소비 동선과 생활 리듬을 살펴본 구역이다.",
    image: "./assets/images/호서대상가.png",
    alt: "호서대 상가 지도",
  },
  {
    chapter: "Chapter 3",
    title: "백석대 상가",
    desc: "백석대 앞 대학가를 중심으로 형성된 거리의 쓰레기 분포를 통해, 유동 인구와 상권의 특징을 관찰한 구역이다.",
    image: "./assets/images/백석대상가.png",
    alt: "백석대 상가 지도",
  },
  {
    chapter: "Chapter 4",
    title: "상명대",
    desc: "상명대 주변의 통학 동선과 머무름의 흔적을 바탕으로, 캠퍼스 인근 공간의 사용 방식을 기록한 구역이다.",
    image: "./assets/images/상명대.png",
    alt: "상명대 지도",
  },
  {
    chapter: "Chapter 5",
    title: "천호지",
    desc: "천호지 주변 산책로와 휴식 공간에 남겨진 흔적을 통해, 이동과 체류가 겹치는 장소성을 살펴본 구역이다.",
    image: "./assets/images/천호지.png",
    alt: "천호지 지도",
  },
];

let currentIndex = 0;

const districtImage = document.getElementById("districtImage");
const districtChapter = document.getElementById("districtChapter");
const districtTitle = document.getElementById("districtTitle");
const districtDesc = document.getElementById("districtDesc");
const prevButton = document.querySelector(".carousel-prev");
const nextButton = document.querySelector(".carousel-next");
const dotsWrap = document.getElementById("carouselDots");

function renderDots() {
  dotsWrap.innerHTML = "";

  districts.forEach((district, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";

    if (index === currentIndex) {
      dot.classList.add("active");
    }

    dot.setAttribute("aria-label", `${district.chapter} 보기`);

    dot.addEventListener("click", () => {
      currentIndex = index;
      updateCarousel();
    });

    dotsWrap.appendChild(dot);
  });
}

function updateCarousel() {
  const currentDistrict = districts[currentIndex];

  districtImage.src = currentDistrict.image;
  districtImage.alt = currentDistrict.alt;
  districtChapter.textContent = currentDistrict.chapter;
  districtTitle.textContent = currentDistrict.title;
  districtDesc.textContent = currentDistrict.desc;

  renderDots();
}

prevButton.addEventListener("click", () => {
  currentIndex = currentIndex - 1;

  if (currentIndex < 0) {
    currentIndex = districts.length - 1;
  }

  updateCarousel();
});

nextButton.addEventListener("click", () => {
  currentIndex = currentIndex + 1;

  if (currentIndex >= districts.length) {
    currentIndex = 0;
  }

  updateCarousel();
});

updateCarousel();

// 사진스크롤 애니메이션
const scrollPhotoSections = document.querySelectorAll(
  ".photo-scatter-section, .photo-stack-section",
);

const photoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
  },
);

scrollPhotoSections.forEach((section) => {
  photoObserver.observe(section);
});

// 파티클 첫 화면 → 01 소개 섹션으로 부드럽게 이동
let isIntroAutoScrolling = false;

//애니메이션 시간 조절 600 = 0.6초
function smoothScrollTo(targetY, duration = 600) {
  const startY = window.scrollY || document.documentElement.scrollTop;
  const distance = targetY - startY;
  const startTime = performance.now();

  function easeInOutCubic(t) {
    if (t < 0.5) {
      return 4 * t * t * t;
    } else {
      return 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  }

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isIntroAutoScrolling = false;
    }
  }

  requestAnimationFrame(animate);
}

function moveToIntroStart() {
  const introStart = document.getElementById("intro-start");
  const navbar = document.querySelector(".navbar");

  if (!introStart) {
    console.log("intro-start를 찾을 수 없음");
    return;
  }

  if (isIntroAutoScrolling) return;

  isIntroAutoScrolling = true;

  const navbarHeight = navbar ? navbar.offsetHeight : 0;

  const targetY =
    introStart.getBoundingClientRect().top +
    window.pageYOffset -
    navbarHeight;
//스크롤 속도 조절
  smoothScrollTo(targetY, 600);
}

// 메뉴바 '소개' 버튼 클릭 시 부드럽게 이동
const introNavLinks = document.querySelectorAll('a[href="#intro-start"]');

introNavLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    moveToIntroStart();
  });
});

// 첫 파티클 화면에서 휠 살짝 내리면 01 소개로 이동
window.addEventListener(
  "wheel",
  (event) => {
    const currentScrollTop =
      window.scrollY || document.documentElement.scrollTop;

    if (isIntroAutoScrolling) return;

    if (currentScrollTop < 50 && event.deltaY > 0) {
      event.preventDefault();
      moveToIntroStart();
    }
  },
  { passive: false }
);

// 책 미리보기 페이지 넘기기
const bookPreviewPages = [
  "./assets/images/preview01.jpg",
  "./assets/images/preview02.jpg",
  "./assets/images/preview03.jpg",
  "./assets/images/preview04.jpg",
  "./assets/images/preview05.jpg",
  "./assets/images/preview06.jpg",
];

let bookPreviewIndex = 0;

const bookPreviewImage = document.getElementById("bookPreviewImage");
const bookPreviewPrev = document.querySelector(".book-preview-prev");
const bookPreviewNext = document.querySelector(".book-preview-next");

function changeBookPreviewPage(direction) {
  if (!bookPreviewImage) return;

  bookPreviewIndex += direction;

  if (bookPreviewIndex < 0) {
    bookPreviewIndex = bookPreviewPages.length - 1;
  } else if (bookPreviewIndex >= bookPreviewPages.length) {
    bookPreviewIndex = 0;
  }

  bookPreviewImage.style.opacity = 0;

  setTimeout(() => {
    bookPreviewImage.src = bookPreviewPages[bookPreviewIndex];
    bookPreviewImage.style.opacity = 1;
  }, 150);
}

if (bookPreviewPrev) {
  bookPreviewPrev.addEventListener("click", () => {
    changeBookPreviewPage(-1);
  });
}

if (bookPreviewNext) {
  bookPreviewNext.addEventListener("click", () => {
    changeBookPreviewPage(1);
  });
}