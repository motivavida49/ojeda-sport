const searchInput = document.getElementById('searchInput');
    const productCards = document.querySelectorAll('.product-card');
    const revealElements = document.querySelectorAll('.hero, .section, .promo, .guide-box');
    const scrollProgress = document.getElementById('scrollProgress');
    const navDots = document.querySelectorAll('.page-nav a');
    const navSections = document.querySelectorAll('#inicio, #categorias, #productos, #ropa, #balones, #videos, #accesorios, #info, #redes');
    const buttons = document.querySelectorAll('.add-btn');
    const ballsSlider = document.getElementById('ballsSlider');
    const prevBalls = document.getElementById('prevBalls');
    const nextBalls = document.getElementById('nextBalls');

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(function (element) {
      element.classList.add('reveal');
      revealObserver.observe(element);
    });

    function updateScrollExperience() {
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';

      let currentSection = 'inicio';
      navSections.forEach(function (section) {
        const sectionTop = section.offsetTop - 160;
        if (window.scrollY >= sectionTop) {
          currentSection = section.getAttribute('id');
        }
      });

      navDots.forEach(function (dot) {
        dot.classList.toggle('active', dot.getAttribute('href') === '#' + currentSection);
      });
    }

    window.addEventListener('scroll', updateScrollExperience);
    updateScrollExperience();

    searchInput.addEventListener('input', function () {
      const searchValue = searchInput.value.toLowerCase();

      productCards.forEach(function (card) {
        const productName = card.getAttribute('data-name');

        if (productName.includes(searchValue)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const productCard = button.closest('.product-card');
        const productName = productCard ? productCard.querySelector('h3').textContent : 'un producto de Ojeda Sport';
        const message = encodeURIComponent('Hola, quiero consultar por ' + productName + '.');
        window.open('https://wa.me/?text=' + message, '_blank');
      });
    });

    nextBalls.addEventListener('click', function () {
      ballsSlider.scrollBy({ left: 540, behavior: 'smooth' });
    });

    prevBalls.addEventListener('click', function () {
      ballsSlider.scrollBy({ left: -540, behavior: 'smooth' });
    });// Flechas de navegación para la vitrina de balones
const ballsSlider = document.getElementById("ballsSlider");
const prevBalls = document.getElementById("prevBalls");
const nextBalls = document.getElementById("nextBalls");

if (ballsSlider && prevBalls && nextBalls) {
  const moveBallsSlider = 360;

  prevBalls.addEventListener("click", () => {
    ballsSlider.scrollBy({
      left: -moveBallsSlider,
      behavior: "smooth"
    });
  });

  nextBalls.addEventListener("click", () => {
    ballsSlider.scrollBy({
      left: moveBallsSlider,
      behavior: "smooth"
    });
  });
}// Slider funcional de la vitrina de balones
document.addEventListener("DOMContentLoaded", () => {
  const ballsSlider = document.getElementById("ballsSlider");
  const ballsTrack = document.getElementById("ballsTrack");
  const prevBalls = document.getElementById("prevBalls");
  const nextBalls = document.getElementById("nextBalls");

  if (!ballsSlider || !ballsTrack || !prevBalls || !nextBalls) return;

  function getScrollAmount() {
    const firstCard = ballsTrack.querySelector(".ball-card-real");

    if (!firstCard) {
      return 360;
    }

    const cardWidth = firstCard.offsetWidth;
    const gap = 28;

    return cardWidth + gap;
  }

  prevBalls.addEventListener("click", () => {
    ballsSlider.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth"
    });
  });

  nextBalls.addEventListener("click", () => {
    ballsSlider.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth"
    });
  });
});// Modal para ver camisas mundialistas en grande
document.addEventListener("DOMContentLoaded", () => {
  const jerseyCards = document.querySelectorAll(".jersey-card");
  const jerseyModal = document.getElementById("jerseyVideoModal");
  const jerseyModalVideo = document.getElementById("jerseyModalVideo");
  const jerseyModalClose = document.querySelector(".jersey-modal-close");

  if (!jerseyCards.length || !jerseyModal || !jerseyModalVideo || !jerseyModalClose) return;

  jerseyCards.forEach((card) => {
    card.addEventListener("click", () => {
      const videoSource = card.querySelector("video source");

      if (!videoSource) return;

      jerseyModalVideo.src = videoSource.getAttribute("src");
      jerseyModal.classList.add("active");
      document.body.style.overflow = "hidden";

      jerseyModalVideo.currentTime = 0;
      jerseyModalVideo.play();
    });
  });

  function closeJerseyModal() {
    jerseyModal.classList.remove("active");
    jerseyModalVideo.pause();
    jerseyModalVideo.src = "";
    document.body.style.overflow = "";
  }

  jerseyModalClose.addEventListener("click", closeJerseyModal);

  jerseyModal.addEventListener("click", (event) => {
    if (event.target === jerseyModal) {
      closeJerseyModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && jerseyModal.classList.contains("active")) {
      closeJerseyModal();
    }
  });
});// Modal funcional independiente para camisas Zona Mundial
document.addEventListener("DOMContentLoaded", () => {
  const jerseyCards = document.querySelectorAll(".jersey-card");
  const jerseyModal = document.getElementById("jerseyVideoModal");
  const jerseyModalVideo = document.getElementById("jerseyModalVideo");
  const jerseyModalClose = document.querySelector(".jersey-modal-close");

  if (!jerseyCards.length || !jerseyModal || !jerseyModalVideo || !jerseyModalClose) return;

  // Crear botón "Ver en grande" dentro de cada tarjeta si no existe
  jerseyCards.forEach((card) => {
    if (!card.querySelector(".jersey-open-btn")) {
      const openBtn = document.createElement("button");
      openBtn.className = "jersey-open-btn";
      openBtn.type = "button";
      openBtn.textContent = "Ver en grande";
      card.appendChild(openBtn);
    }
  });

  function openModal(card) {
    const videoSource = card.querySelector("video source");
    if (!videoSource) return;

    const src = videoSource.getAttribute("src");
    jerseyModalVideo.src = src;
    jerseyModal.classList.add("active");
    document.body.style.overflow = "hidden";

    jerseyModalVideo.currentTime = 0;
    jerseyModalVideo.play().catch(() => {});
  }

  function closeModal() {
    jerseyModal.classList.remove("active");
    jerseyModalVideo.pause();
    jerseyModalVideo.src = "";
    document.body.style.overflow = "";
  }

  // Abrir modal al hacer clic en el botón o la tarjeta
  jerseyCards.forEach((card) => {
    const btn = card.querySelector(".jersey-open-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(card);
    });

    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("jersey-open-btn")) {
        openModal(card);
      }
    });
  });

  // Cerrar modal
  jerseyModalClose.addEventListener("click", closeModal);
  jerseyModal.addEventListener("click", (e) => {
    if (e.target === jerseyModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});// Modal funcional para camisas de Zona Mundial
document.addEventListener("DOMContentLoaded", () => {
  const jerseyCards = document.querySelectorAll(".jersey-card");
  const jerseyModal = document.getElementById("jerseyVideoModal");
  const jerseyModalVideo = document.getElementById("jerseyModalVideo");
  const jerseyModalClose = document.querySelector(".jersey-modal-close");

  if (!jerseyCards.length || !jerseyModal || !jerseyModalVideo || !jerseyModalClose) {
    return;
  }

  function openJerseyModal(card) {
    const videoSrc = card.getAttribute("data-video");
    if (!videoSrc) return;

    jerseyModalVideo.pause();
    jerseyModalVideo.src = videoSrc;
    jerseyModalVideo.load();

    jerseyModal.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      jerseyModalVideo.play().catch(() => {});
    }, 100);
  }

  function closeJerseyModal() {
    jerseyModal.classList.remove("active");
    jerseyModalVideo.pause();
    jerseyModalVideo.removeAttribute("src");
    jerseyModalVideo.load();
    document.body.style.overflow = "";
  }

  jerseyCards.forEach((card) => {
    const openBtn = card.querySelector(".jersey-open-btn");

    if (openBtn) {
      openBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openJerseyModal(card);
      });
    }

    card.addEventListener("click", (event) => {
      if (event.target.closest(".worldcup-btn")) return;
      openJerseyModal(card);
    });
  });

  jerseyModalClose.addEventListener("click", closeJerseyModal);

  jerseyModal.addEventListener("click", (event) => {
    if (event.target === jerseyModal) {
      closeJerseyModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && jerseyModal.classList.contains("active")) {
      closeJerseyModal();
    }
  });
});// ========================================
// FLOATING DOTS / PAGE NAV SCROLL
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  const navDots = document.querySelectorAll(".page-nav a");
  const sections = Array.from(navDots).map(dot => {
    const targetId = dot.getAttribute("href").replace("#", "");
    return document.getElementById(targetId);
  });

  function updateActiveDot() {
    const scrollPos = window.scrollY + window.innerHeight / 2;

    sections.forEach((section, idx) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPos >= top && scrollPos <= bottom) {
        navDots.forEach(dot => dot.classList.remove("active"));
        navDots[idx].classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveDot);
  updateActiveDot(); // inicializa al cargar
});document.addEventListener("DOMContentLoaded", () => {
  const navDots = document.querySelectorAll(".page-nav a");
  const sections = Array.from(navDots).map(dot => {
    const targetId = dot.getAttribute("href").replace("#", "");
    return document.getElementById(targetId);
  });

  function updateActiveDot() {
    const scrollPos = window.scrollY + window.innerHeight / 2;

    sections.forEach((section, idx) => {
      if (!section) return; // seguridad si falta sección
      const rect = section.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const bottom = top + rect.height;

      if (scrollPos >= top && scrollPos < bottom) {
        navDots.forEach(dot => dot.classList.remove("active"));
        navDots[idx].classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveDot);
  window.addEventListener("resize", updateActiveDot);
  updateActiveDot(); // inicializa al cargar
});/* =========================
   PAGE NAV ACTIVO POR SCROLL
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const dots = document.querySelectorAll(".page-nav a");

  if (!dots.length) return;

  const links = Array.from(dots).map((dot) => {
    const id = dot.getAttribute("href").replace("#", "");
    const section = document.getElementById(id);

    return {
      dot,
      id,
      section
    };
  }).filter(item => item.section);

  function setActiveDot(activeId) {
    dots.forEach(dot => dot.classList.remove("active"));

    const activeDot = document.querySelector(`.page-nav a[href="#${activeId}"]`);

    if (activeDot) {
      activeDot.classList.add("active");
    }
  }

  function updatePageNav() {
    let currentSection = "inicio";
    const scrollMiddle = window.scrollY + window.innerHeight * 0.45;

    links.forEach(({ id, section }) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollMiddle >= sectionTop && scrollMiddle < sectionBottom) {
        currentSection = id;
      }
    });

    setActiveDot(currentSection);
  }

  window.addEventListener("scroll", updatePageNav);
  window.addEventListener("resize", updatePageNav);
  window.addEventListener("load", updatePageNav);

  updatePageNav();

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const id = dot.getAttribute("href").replace("#", "");
      setTimeout(() => setActiveDot(id), 300);
    });
  });
});/* =========================
   FIX DEFINITIVO PAGE NAV / PUNTICOS
========================= */

(function () {
  const sectionIds = [
    "inicio",
    "categorias",
    "productos",
    "ropa",
    "balones",
    "videos",
    "accesorios",
    "info",
    "redes"
  ];

  const dots = Array.from(document.querySelectorAll(".page-nav a"));

  if (!dots.length) return;

  function getCurrentSectionId() {
    let currentId = "inicio";
    let closestDistance = Infinity;

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;

      const rect = section.getBoundingClientRect();

      /*
        180px compensa el header fijo.
        Mientras más cerca esté la sección de esa línea,
        más probable es que sea la sección activa.
      */
      const distance = Math.abs(rect.top - 180);

      if (rect.top <= window.innerHeight * 0.55 && rect.bottom >= 180) {
        if (distance < closestDistance) {
          closestDistance = distance;
          currentId = id;
        }
      }
    });

    return currentId;
  }

  function updateDots() {
    const currentId = getCurrentSectionId();

    dots.forEach((dot) => {
      const dotId = dot.getAttribute("href").replace("#", "");

      if (dotId === currentId) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", updateDots, { passive: true });
  window.addEventListener("resize", updateDots);
  window.addEventListener("load", updateDots);
  window.addEventListener("hashchange", updateDots);

  /*
    Esto fuerza actualización cada cierto tiempo.
    Sirve por si otro código viejo vuelve a marcar Inicio.
  */
  setInterval(updateDots, 250);

  updateDots();
})();