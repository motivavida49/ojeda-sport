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

    // Reproducción de videos por sección.
    // Al entrar en una zona, todos los videos de esa zona se cargan y reproducen juntos.
    // Al salir, se pausan para ahorrar CPU, batería y datos.
    const videoSectionSelectors = ["#nuevos", "#balones", "#mundial", "#videos"];
    const videoSections = videoSectionSelectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean);
    const allVideos = Array.from(document.querySelectorAll("video"));
    const ballSection = document.getElementById("balones");
    const ballVideos = ballSection
      ? Array.from(ballSection.querySelectorAll("video"))
      : [];
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const saveData = Boolean(connection?.saveData);

    const loadVideoSources = (video) => {
      if (video.dataset.loaded === "true") return;

      let changed = false;
      video.querySelectorAll("source[data-src]").forEach((source) => {
        source.src = source.dataset.src;
        source.removeAttribute("data-src");
        changed = true;
      });

      video.dataset.loaded = "true";

      if (changed || video.readyState === 0) {
        video.load();
      }
    };

    const playVideo = (video) => {
      if (document.hidden || saveData) return;

      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    };

    const playSectionVideos = (section) => {
      if (!section) return;

      section.querySelectorAll("video").forEach((video) => {
        loadVideoSources(video);

        if (video.readyState >= 2) {
          playVideo(video);
        } else {
          video.addEventListener(
            "canplay",
            () => {
              if (activeVideoSection === section) {
                playVideo(video);
              }
            },
            { once: true }
          );
        }
      });
    };

    const pauseSectionVideos = (section) => {
      section?.querySelectorAll("video").forEach((video) => video.pause());
    };

    // Los balones se cargan desde el comienzo para evitar cuadros negros al deslizar.
    // Fuera de su sección pueden pausarse, pero ya quedan listos para mostrarse.
    ballVideos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      loadVideoSources(video);
    });

    // El resto de los videos se mantiene liviano hasta acercarse a su sección.
    allVideos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;

      if (!ballVideos.includes(video)) {
        video.preload = "none";
      }
    });

    // Precarga la sección completa un poco antes de que entre en pantalla.
    if ("IntersectionObserver" in window) {
      const preloadSectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.querySelectorAll("video").forEach(loadVideoSources);
            preloadSectionObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "420px 0px", threshold: 0 }
      );

      videoSections.forEach((section) => preloadSectionObserver.observe(section));
    }

    let activeVideoSection = null;
    let videoFrame = null;

    const getActiveVideoSection = () => {
      const viewportHeight = window.innerHeight;
      let bestSection = null;
      let bestVisiblePixels = 0;
      let bestCenterDistance = Number.POSITIVE_INFINITY;

      videoSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visiblePixels = Math.max(0, visibleBottom - visibleTop);

        if (visiblePixels <= 0) return;

        const centerDistance = Math.abs(
          rect.top + rect.height / 2 - viewportHeight / 2
        );

        if (
          visiblePixels > bestVisiblePixels ||
          (visiblePixels === bestVisiblePixels &&
            centerDistance < bestCenterDistance)
        ) {
          bestVisiblePixels = visiblePixels;
          bestCenterDistance = centerDistance;
          bestSection = section;
        }
      });

      return bestSection;
    };

    const updateVideoSections = () => {
      const nextSection = document.hidden ? null : getActiveVideoSection();

      if (nextSection === activeVideoSection) {
        if (nextSection) {
          playSectionVideos(nextSection);
        }
        return;
      }

      videoSections.forEach((section) => {
        if (section !== nextSection) {
          pauseSectionVideos(section);
        }
      });

      activeVideoSection = nextSection;

      if (activeVideoSection) {
        playSectionVideos(activeVideoSection);
      }
    };

    const requestVideoUpdate = () => {
      if (videoFrame !== null) return;

      videoFrame = window.requestAnimationFrame(() => {
        updateVideoSections();
        videoFrame = null;
      });
    };

    window.addEventListener("scroll", requestVideoUpdate, { passive: true });
    window.addEventListener("resize", requestVideoUpdate, { passive: true });
    window.addEventListener("load", updateVideoSections, { once: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        allVideos.forEach((video) => video.pause());
      }

      requestVideoUpdate();
    });

    updateVideoSections();
  });
})();
