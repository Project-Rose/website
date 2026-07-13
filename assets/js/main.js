(function () {
  "use strict";

  // Theme

  const toggle = document.querySelector(".theme-toggle");
  let sun, moon;

  if (toggle) {
    sun = toggle.querySelector(".theme-sun");
    moon = toggle.querySelector(".theme-moon");

    function updateThemeUI() {
      const isDark = document.documentElement.classList.contains("dark");
      if (sun) sun.style.display = isDark ? null : "none";
      if (moon) moon.style.display = isDark ? "none" : null;
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    updateThemeUI();

    toggle.addEventListener("click", function () {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem(
        "rose-theme",
        document.documentElement.classList.contains("dark")
          ? "dark"
          : "light"
      );
      updateThemeUI();
    });
  }

  // Mobile Nav

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // close nav on link click
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Staff card click: open miiverse by default

  document.querySelectorAll(".staff-card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      const miiverseLink = card.querySelector(".miiverse-btn");
      if (miiverseLink && miiverseLink.href) {
        window.open(miiverseLink.href, "_blank", "noopener");
      }
    });
  });
})();
