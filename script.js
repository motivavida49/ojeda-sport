(() => {
  "use strict";

  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(() => {
    const scrollProgress = document.getElementById("scrollProgress");
    const revealElements = document.querySelectorAll(
      ".hero, .section, .promo, .guide-box"
    );

    // Entrada ligera de secciones.
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("show");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.05, rootMargin: "90px 0px" }
      );

      revealElements.forEach((element) => {
        element.classList.add("reveal");
        revealObserver.observe(element);
      });
    } else {
      revealElements.forEach((element) => element.classList.add("show"));
    }

    // Barra superior de progreso.
    let scrollFrame = null;
    const updateScrollProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0;
      if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    };

    const requestScrollProgress = () => {
      if (scrollFrame !== null) return;
      scrollFrame = requestAnimationFrame(() => {
        updateScrollProgress();
        scrollFrame = null;
      });
    };

    window.addEventListener("scroll", requestScrollProgress, { passive: true });
    window.addEventListener("resize", requestScrollProgress, { passive: true });
    updateScrollProgress();

    // Slider de balones.
    const ballsSlider = document.getElementById("ballsSlider");
    const ballsTrack = document.getElementById("ballsTrack");
    const prevBalls = document.getElementById("prevBalls");
    const nextBalls = document.getElementById("nextBalls");

    const getBallScrollAmount = () => {
      const firstCard = ballsTrack?.querySelector(".ball-card-real");
      if (!firstCard) return 320;
      const style = getComputedStyle(ballsTrack);
      const gap = Number.parseFloat(style.columnGap || style.gap) || 14;
      return firstCard.getBoundingClientRect().width + gap;
    };

    if (ballsSlider && prevBalls && nextBalls) {
      prevBalls.removeAttribute("onclick");
      nextBalls.removeAttribute("onclick");
      prevBalls.addEventListener("click", () => {
        ballsSlider.scrollBy({ left: -getBallScrollAmount(), behavior: "smooth" });
      });
      nextBalls.addEventListener("click", () => {
        ballsSlider.scrollBy({ left: getBallScrollAmount(), behavior: "smooth" });
      });
    }

    // Búsqueda y consultas, solo cuando esos elementos existen.
    const searchInput = document.getElementById("searchInput");
    const productCards = document.querySelectorAll(".product-card");
    if (searchInput && productCards.length) {
      searchInput.addEventListener("input", () => {
        const value = searchInput.value.trim().toLowerCase();
        productCards.forEach((card) => {
          const name = (card.dataset.name || card.textContent).toLowerCase();
          card.classList.toggle("hidden", !name.includes(value));
        });
      });
    }

    document.querySelectorAll(".add-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".product-card");
        const name = card?.querySelector("h3")?.textContent?.trim() || "un producto de Ojeda Sport";
        const message = encodeURIComponent(`Hola, quiero consultar por ${name}.`);
        window.open(`https://wa.me/584121068677?text=${message}`, "_blank");
      });
    });

    // ---------------- VIDEO CONTROLLER ----------------
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const allVideos = Array.from(document.querySelectorAll("video"));
    const ballSection = document.getElementById("balones");
    const worldcupSection = document.getElementById("mundial");
    const ballVideos = ballSection ? Array.from(ballSection.querySelectorAll("video")) : [];

    const markVideoReady = (video) => {
      video.classList.add("is-ready");
      const card = video.closest(".jersey-card, .worldcup-center");
      if (card) card.classList.add("video-ready");
    };

    const loadVideoSources = (video) => {
      if (video.dataset.loaded === "true") return;
      let changed = false;
      video.querySelectorAll("source[data-src]").forEach((source) => {
        source.src = source.dataset.src;
        source.removeAttribute("data-src");
        changed = true;
      });
      video.dataset.loaded = "true";
      if (changed || video.readyState === 0) video.load();
      if (video.readyState >= 2) markVideoReady(video);
    };

    const playVideo = (video) => {
      if (document.hidden) return;
      const promise = video.play();
      if (promise && typeof promise.catch === "function") promise.catch(() => {});
    };

    const prepareAndPlay = (video) => {
      video.dataset.shouldPlay = "true";
      loadVideoSources(video);
      if (video.readyState >= 2) {
        markVideoReady(video);
        playVideo(video);
      }
    };

    const pauseVideo = (video) => {
      video.dataset.shouldPlay = "false";
      video.pause();
    };

    allVideos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      video.dataset.shouldPlay = "false";
      video.addEventListener("loadeddata", () => {
        markVideoReady(video);
        if (video.dataset.shouldPlay === "true") playVideo(video);
      });
      if (video.readyState >= 2) markVideoReady(video);
    });

    // Balones: siempre precargados para evitar el cuadro negro, pero se pausan fuera de su zona.
    ballVideos.forEach((video) => {
      video.preload = "auto";
      video.dataset.loaded = "true";
      video.load();
    });

    const genericSections = [
      document.getElementById("nuevos"),
      ballSection,
      document.getElementById("videos"),
      !mobileQuery.matches ? worldcupSection : null,
    ].filter(Boolean);

    // Precarga cada sección poco antes de llegar a ella.
    if ("IntersectionObserver" in window) {
      const preloadObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll("video").forEach(loadVideoSources);
          preloadObserver.unobserve(entry.target);
        });
      }, { rootMargin: "360px 0px", threshold: 0 });

      genericSections.forEach((section) => preloadObserver.observe(section));
    }

    let activeSection = null;
    let videoFrame = null;

    const getMostVisibleSection = () => {
      const viewportHeight = window.innerHeight;
      let best = null;
      let bestPixels = 0;
      genericSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visible = Math.max(0, Math.min(viewportHeight, rect.bottom) - Math.max(0, rect.top));
        if (visible > bestPixels) {
          bestPixels = visible;
          best = section;
        }
      });
      return bestPixels > 80 ? best : null;
    };

    const playSection = (section) => {
      section?.querySelectorAll("video").forEach(prepareAndPlay);
    };

    const pauseSection = (section) => {
      section?.querySelectorAll("video").forEach(pauseVideo);
    };

    const updateSectionVideos = () => {
      const next = document.hidden ? null : getMostVisibleSection();
      if (next !== activeSection) {
        genericSections.forEach((section) => {
          if (section !== next) pauseSection(section);
        });
        activeSection = next;
      }
      if (activeSection) playSection(activeSection);
    };

    const requestVideoUpdate = () => {
      if (videoFrame !== null) return;
      videoFrame = requestAnimationFrame(() => {
        updateSectionVideos();
        videoFrame = null;
      });
    };

    window.addEventListener("scroll", requestVideoUpdate, { passive: true });
    window.addEventListener("resize", requestVideoUpdate, { passive: true });

    // Zona Mundial en teléfono: carga la tarjeta visible y prepara sus vecinas.
    let worldcupPreloadObserver = null;
    let worldcupPlayObserver = null;

    const setupMobileWorldcup = () => {
      if (!worldcupSection || !mobileQuery.matches || !("IntersectionObserver" in window)) return;

      const cards = Array.from(worldcupSection.querySelectorAll(".jersey-card, .worldcup-center"));
      const getVideo = (card) => card.querySelector("video");
      const prepareCard = (index) => {
        if (index < 0 || index >= cards.length) return;
        const video = getVideo(cards[index]);
        if (video) loadVideoSources(video);
      };

      worldcupPreloadObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = cards.indexOf(entry.target);
          prepareCard(index);
          prepareCard(index - 1);
          prepareCard(index + 1);
        });
      }, { rootMargin: "420px 120px", threshold: 0.01 });

      worldcupPlayObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const card = entry.target;
          const video = getVideo(card);
          if (!video) return;
          const index = cards.indexOf(card);

          if (entry.isIntersecting && entry.intersectionRatio >= 0.38 && !document.hidden) {
            prepareCard(index);
            prepareCard(index + 1);
            prepareAndPlay(video);
          } else {
            pauseVideo(video);
          }
        });
      }, {
        threshold: [0, 0.2, 0.38, 0.65, 0.9],
        rootMargin: "-6% 0px -8% 0px",
      });

      cards.forEach((card) => {
        worldcupPreloadObserver.observe(card);
        worldcupPlayObserver.observe(card);
      });
    };

    setupMobileWorldcup();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        allVideos.forEach(pauseVideo);
      } else {
        requestVideoUpdate();
      }
    });

    // Si el usuario rota o cambia entre móvil y escritorio, recarga una vez para aplicar el modo correcto.
    mobileQuery.addEventListener?.("change", () => window.location.reload());

    updateSectionVideos();
  });
})();
