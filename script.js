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

    // Animación de entrada.
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
        { threshold: 0.08 }
      );

      revealElements.forEach((element) => {
        element.classList.add("reveal");
        revealObserver.observe(element);
      });
    } else {
      revealElements.forEach((element) => element.classList.add("show"));
    }

    // Barra de progreso y punto activo.
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

      if (!navItems.length) return;

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
    window.addEventListener("resize", requestScrollUpdate);
    window.addEventListener("load", updateScrollUI);
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
      // Elimina el onclick escrito en el HTML para evitar doble movimiento.
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

    // Reduce consumo en teléfonos: reproduce videos únicamente cerca de la pantalla.
    const videos = document.querySelectorAll("video");

    videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
    });

    if ("IntersectionObserver" in window && videos.length) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        {
          rootMargin: "160px 0px",
          threshold: 0.01,
        }
      );

      videos.forEach((video) => videoObserver.observe(video));
    }
  });
})();
