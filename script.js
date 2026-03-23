document.addEventListener("DOMContentLoaded", function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");
  var navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));

  function syncHeader() {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  function closeNav() {
    if (!navToggle || !navMenu) {
      return;
    }

    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navMenu.classList.toggle("is-open", !isOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        closeNav();
      }
    });
  }

  var revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!reducedMotion && revealItems.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18
      }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  function animateCount(node) {
    var target = Number(node.getAttribute("data-count")) || 0;
    var suffix = node.getAttribute("data-suffix") || "";
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) {
        startTime = timestamp;
      }

      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = Math.round(target * progress);
      node.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  var counters = Array.from(document.querySelectorAll("[data-count]"));

  if (!reducedMotion && counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = "true";
            animateCount(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.6
      }
    );

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach(function (counter) {
      counter.textContent =
        (Number(counter.getAttribute("data-count")) || 0).toLocaleString() +
        (counter.getAttribute("data-suffix") || "");
    });
  }

  var sections = Array.from(document.querySelectorAll("main section[id]"));

  function syncActiveLink() {
    if (!sections.length) {
      return;
    }

    var currentId = sections[0].id;

    sections.forEach(function (section) {
      var top = section.getBoundingClientRect().top;
      if (top <= 140) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      link.classList.toggle("is-active", href === "#" + currentId);
    });
  }

  syncActiveLink();
  window.addEventListener("scroll", syncActiveLink, { passive: true });

  var lightbox = document.querySelector("[data-lightbox]");
  var lightboxImage = document.querySelector("[data-lightbox-image]");
  var lightboxTitle = document.querySelector("[data-lightbox-title]");
  var lightboxClose = document.querySelector(".lightbox-close");
  var galleryButtons = Array.from(document.querySelectorAll("[data-lightbox-src]"));

  function closeLightbox() {
    if (!lightbox) {
      return;
    }

    lightbox.hidden = true;
    document.body.classList.remove("no-scroll");
  }

  if (lightbox && lightboxImage && lightboxTitle && galleryButtons.length) {
    galleryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        lightboxImage.src = button.getAttribute("data-lightbox-src") || "";
        lightboxImage.alt = button.getAttribute("data-lightbox-caption") || "";
        lightboxTitle.textContent =
          button.getAttribute("data-lightbox-caption") || "Gallery image";
        lightbox.hidden = false;
        document.body.classList.add("no-scroll");
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
      }
    });
  }

  var form = document.querySelector("[data-quote-form]");

  if (form) {
    var status = form.querySelector("[data-form-status]");

    function setStatus(message, isError) {
      if (!status) {
        return;
      }

      status.textContent = message;
      status.classList.toggle("is-error", Boolean(isError));
      status.classList.toggle("is-success", !isError && message.length > 0);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var formData = new FormData(form);
      var name = String(formData.get("name") || "").trim();
      var company = String(formData.get("company") || "").trim();
      var email = String(formData.get("email") || "").trim();
      var product = String(formData.get("product") || "").trim();
      var volume = String(formData.get("volume") || "").trim();
      var message = String(formData.get("message") || "").trim();

      if (name.length < 2) {
        setStatus("Enter your full name before sending.", true);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus("Enter a valid email address.", true);
        return;
      }

      if (message.length < 12) {
        setStatus("Add a little more detail to the message.", true);
        return;
      }

      // Static site fallback: compose a prefilled email instead of posting to a backend.
      var subject = encodeURIComponent(
        (product || "Palm oil inquiry") + " from " + name
      );
      var body = encodeURIComponent(
        [
          "Name: " + name,
          "Company: " + (company || "Not provided"),
          "Email: " + email,
          "Product: " + (product || "Not specified"),
          "Expected volume: " + (volume || "Not provided"),
          "",
          "Message:",
          message
        ].join("\n")
      );

      setStatus("Opening your email app with a prefilled draft.", false);
      window.location.href =
        "mailto:info@goldenpalmoil.com?subject=" + subject + "&body=" + body;
      form.reset();
    });
  }

  Array.from(document.querySelectorAll("[data-year]")).forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
});
