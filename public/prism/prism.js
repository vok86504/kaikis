(function () {
  var nav = document.querySelector(".nav");
  var menuBtn = document.querySelector(".menu-btn");
  var links = document.getElementById("nav-links");

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    links.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
  }
  menuBtn.addEventListener("click", function () {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  var box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Image preview");
  box.innerHTML = '<button class="btn btn--ghost btn--sm lightbox-close" type="button">Close ✕</button><div class="lightbox-inner"><img alt=""></div>';
  document.body.appendChild(box);
  var boxImg = box.querySelector("img");
  var closeBtn = box.querySelector(".lightbox-close");
  var opener = null;

  function closeBox() {
    box.hidden = true;
    boxImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (opener) opener.focus();
  }
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-full]");
    if (!trigger) return;
    opener = trigger;
    var thumb = trigger.querySelector("img");
    boxImg.alt = thumb ? thumb.alt : "";
    boxImg.src = trigger.getAttribute("data-full");
    box.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  });
  closeBtn.addEventListener("click", closeBox);
  box.addEventListener("click", function (e) { if (e.target === box) closeBox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) closeBox(); });

  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
