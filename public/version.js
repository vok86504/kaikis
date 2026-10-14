// Which version visitors get by default: "manga" or "prism". A visitor's own pick overrides it.
var KAIKIS_DEFAULT_VERSION = "prism";

(function () {
  var path = location.pathname;
  var inPrism = path.indexOf("/prism/") === 0;
  var pick = KAIKIS_DEFAULT_VERSION;
  try { pick = localStorage.getItem("kaikis-version") || pick; } catch (e) {}

  if (!inPrism && pick === "prism") {
    location.replace("/prism" + (path === "/" ? "/" : path) + location.search + location.hash);
    return;
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("[data-version]");
    if (!link) return;
    try { localStorage.setItem("kaikis-version", link.getAttribute("data-version")); } catch (x) {}
  });
})();
