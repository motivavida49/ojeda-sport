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
    const navDots = Array.from(document.querySelectorAll(".page-nav a"));
    const revealElements = document.querySelectorAll(
      ".hero, .section, .promo, .guide-box"
    );

    // Animaciones de entrada: se ejecutan una sola vez.
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: "80px 0px" }
      );

      revealElements.forEach((element) => {
        element.classList.add("reveal");
        revealObserver.observe(element);
      });
    } else {
      revealElements.forEach((element) => element.classList.add("show"));
    }

    // Barra de progreso y navegación lateral usando un solo ciclo por frame.
    const navItems = navDots
      .map((dot) => {
        const selector = dot.getAttribute("href");
        const section = selector ? document.querySelector(selector) : null;
        return section ? { dot, section } : null;
      })
      .filter(Boolean);

    const updateScrollUI = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0;

      if (scrollProgress) {
        scrollProgress.style.width = `${progress}%`;
      }

      if (!navItems.length || window.matchMedia("(max-width: 768px)").matches) {
        return;
      }

      const detectionLine = window.innerHeight * 0.42;
      let activeItem = navItems[0];
      let smallestDistance = Number.POSITIVE_INFINITY;

      navItems.forEach((item) => {
        const rect = item.section.getBoundingClientRect();
        const visible = rect.top < window.innerHeight * 0.85 && rect.bottom > 80;
        const distance = Math.abs(rect.top + rect.height / 2 - detectionLine);

        if (visible && distance < smallestDistance) {
          smallestDistance = distance;
          activeItem = item;
        }
      });

      navDots.forEach((dot) => dot.classList.remove("active"));
      activeItem.dot.classList.add("active");
    };

    let scrollFrame = null;
    const requestScrollUpdate = () => {
      if (scrollFrame !== null) return;

      scrollFrame = window.requestAnimationFrame(() => {
        updateScrollUI();
        scrollFrame = null;
      });
    };

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate, { passive: true });
    window.addEventListener("load", updateScrollUI, { once: true });
    updateScrollUI();

    // Slider de balones: un solo controlador.
    const ballsSlider = document.getElementById("ballsSlider");
    const ballsTrack = document.getElementById("ballsTrack");
    const prevBalls = document.getElementById("prevBalls");
    const nextBalls = document.getElementById("nextBalls");

    const getBallScrollAmount = () => {
      const firstCard = ballsTrack?.querySelector(".ball-card-real");
      if (!firstCard) return 320;

      const trackStyle = window.getComputedStyle(ballsTrack);
      const gap = Number.parseFloat(trackStyle.columnGap || trackStyle.gap) || 14;
      return firstCard.getBoundingClientRect().width + gap;
    };

    if (ballsSlider && prevBalls && nextBalls) {
      prevBalls.removeAttribute("onclick");
      nextBalls.removeAttribute("onclick");

      prevBalls.addEventListener("click", () => {
        ballsSlider.scrollBy({
          left: -getBallScrollAmount(),
          behavior: "smooth",
        });
      });

      nextBalls.addEventListener("click", () => {
        ballsSlider.scrollBy({
          left: getBallScrollAmount(),
          behavior: "smooth",
        });
      });
    }

    // Búsqueda de productos, solo si esos elementos existen.
    const searchInput = document.getElementById("searchInput");
    const productCards = document.querySelectorAll(".product-card");

    if (searchInput && productCards.length) {
      searchInput.addEventListener("input", () => {
        const value = searchInput.value.trim().toLowerCase();

        productCards.forEach((card) => {
          const productName = (card.dataset.name || card.textContent).toLowerCase();
          card.classList.toggle("hidden", !productName.includes(value));
        });
      });
    }

    // Botones de consulta.
    document.querySelectorAll(".add-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const productCard = button.closest(".product-card");
        const productName =
          productCard?.querySelector("h3")?.textContent?.trim() ||
          "un producto de Ojeda Sport";
        const message = encodeURIComponent(
          `Hola, quiero consultar por ${productName}.`
        );
        window.open(`https://wa.me/584121068677?text=${message}`, "_blank");
      });
    });

    // Carga diferida real de videos.
    // El navegador no descarga cada MP4 al abrir la página; los carga cuando se acercan.
    const videos = Array.from(document.querySelectorAll("video"));
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection?.saveData);

    const loadVideoSources = (video) => {
      if (video.dataset.loaded === "true") return;

      video.querySelectorAll("source[data-src]").forEach((source) => {
        source.src = source.dataset.src;
        source.removeAttribute("data-src");
      });

      video.dataset.loaded = "true";
      video.load();
    };

    const playVideo = (video) => {
      if (document.hidden) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      video.preload = "none";
    });

    if ("IntersectionObserver" in window && videos.length) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
              loadVideoSources(video);

              if (!saveData) {
                if (video.readyState >= 2) {
                  playVideo(video);
                } else {
                  video.addEventListener("canplay", () => playVideo(video), {
                    once: true,
                  });
                }
              }
            } else {
              video.pause();
            }
          });
        },
        {
          rootMargin: isMobile ? "140px 0px" : "320px 0px",
          threshold: 0.01,
        }
      );

      videos.forEach((video) => videoObserver.observe(video));
    } else {
      // Respaldo para navegadores antiguos: carga los videos, pero sin forzar todos a reproducirse.
      videos.forEach(loadVideoSources);
    }

    // Al cambiar de pestaña, detiene decodificación y consumo de batería.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        videos.forEach((video) => video.pause());
      } else {
        videos.forEach((video) => {
          const rect = video.getBoundingClientRect();
          const visible = rect.top < window.innerHeight && rect.bottom > 0;
          if (visible && video.dataset.loaded === "true" && !saveData) {
            playVideo(video);
          }
        });
      }
    });
  });
})();
