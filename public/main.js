// Kaikis — theme switch, EXP bar, nav, reveal-on-scroll, lightbox
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Day / night switch (day is the default; a visitor's choice is remembered) ----
  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  var themeBtn = document.querySelector(".theme-btn");
  function syncThemeBtn() {
    if (!themeBtn) return;
    var dark = currentTheme() === "dark";
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    themeBtn.setAttribute("aria-label", dark ? "Switch to day mode" : "Switch to night mode");
    themeBtn.title = dark ? "Day mode" : "Night mode";
  }
  syncThemeBtn();

  var impact = document.createElement("div");
  impact.className = "impact";
  impact.setAttribute("aria-hidden", "true");
  impact.innerHTML = "<b></b>";
  document.body.appendChild(impact);

  function flash(next) {
    if (reduceMotion) return;
    impact.querySelector("b").textContent = next === "dark" ? "ゴゴゴ…" : "シャキーン!";
    impact.classList.toggle("night", next === "dark");
    impact.classList.remove("go");
    void impact.offsetWidth; // restart the animation
    impact.classList.add("go");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      function apply() {
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("kaikis-theme", next); } catch (e) {}
        syncThemeBtn();
      }
      if (document.startViewTransition && !reduceMotion) {
        var r = themeBtn.getBoundingClientRect();
        var x = r.left + r.width / 2, y = r.top + r.height / 2;
        var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        var vt = document.startViewTransition(apply);
        vt.ready.then(function () {
          root.animate(
            { clipPath: ["circle(0 at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
            { duration: 650, easing: "cubic-bezier(.6,0,.3,1)", pseudoElement: "::view-transition-new(root)" }
          );
        }).catch(function () {});
      } else {
        apply();
      }
      flash(next);
    });
  }

  // ---- Power aura: hover does it with a mouse; on touch screens a tap powers up for a moment ----
  var heroArt = document.querySelector(".hero-art");
  if (heroArt && window.matchMedia && window.matchMedia("(hover: none)").matches) {
    var powerTimer;
    heroArt.addEventListener("click", function () {
      heroArt.classList.add("powered");
      clearTimeout(powerTimer);
      powerTimer = setTimeout(function () { heroArt.classList.remove("powered"); }, 2600);
    });
  }

  // ---- EXP bar: fills as you scroll ----
  var nav = document.querySelector(".nav");
  if (nav) {
    var exp = document.createElement("div");
    exp.className = "exp";
    exp.setAttribute("aria-hidden", "true");
    exp.innerHTML = "<span></span><i>LEVEL UP!</i>";
    nav.appendChild(exp);
    var bar = exp.querySelector("span");
    var ticking = false;
    function updateExp() {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      bar.style.transform = "scaleX(" + p + ")";
      exp.classList.toggle("full", p > 0.985);
    }
    addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateExp); }
    }, { passive: true });
    addEventListener("resize", updateExp);
    updateExp();
  }

  // Mobile menu
  var btn = document.querySelector(".menu-btn");
  var links = document.getElementById("nav-links");
  if (btn && links) {
    btn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Lightbox: any element with [data-full] opens its image full size
  var box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Image preview");
  box.innerHTML =
    '<button class="btn btn--white lightbox-close" type="button">Close ✕</button>' +
    '<div class="lightbox-inner"><img alt=""></div>';
  document.body.appendChild(box);
  var img = box.querySelector("img");
  var closeBtn = box.querySelector(".lightbox-close");
  var lastFocus = null;

  function close() {
    box.classList.remove("open");
    document.body.style.overflow = "";
    img.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-full]");
    if (!trigger) return;
    e.preventDefault();
    lastFocus = trigger;
    var thumb = trigger.querySelector("img");
    img.src = trigger.getAttribute("data-full");
    img.alt = thumb ? thumb.alt : "";
    box.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  });
  closeBtn.addEventListener("click", close);
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && box.classList.contains("open")) close();
  });
})();
