/**
 * Помечает внешние http(s) ссылки классом external-link для иконки в CSS.
 * Пропускает относительные, mailto/tel, якоря, ссылки на тот же host и ссылки только с <img>.
 * Абсолютные URL на хост из <meta name="site-internal-host"> (baseURL сайта) — тоже внутренние
 * (нужно для hugo ref при просмотре на localhost).
 */
(function () {
  function normalizedHost(hostname) {
    var h = String(hostname || "").toLowerCase();
    if (h.indexOf("www.") === 0) return h.slice(4);
    return h;
  }

  function publishedSiteHost() {
    var meta = document.querySelector('meta[name="site-internal-host"]');
    if (!meta || !meta.content) return null;
    return meta.content.trim().toLowerCase();
  }

  function isInternalHttpUrl(url) {
    if (normalizedHost(url.hostname) === normalizedHost(location.hostname)) return true;
    var published = publishedSiteHost();
    if (!published) return false;
    return normalizedHost(url.hostname) === normalizedHost(published);
  }

  function markExternalLinks() {
    document.querySelectorAll("a[href]").forEach(function (a) {
      if (a.classList.contains("no-external-link-icon")) return;
      if (a.closest(".no-external-link-icon")) return;

      var href = a.getAttribute("href");
      if (!href) return;
      var h = href.trim();
      if (h === "" || h.charAt(0) === "#") return;
      if (h.charAt(0) === "?" ) return;
      if (h.charAt(0) === "/" && h.indexOf("//") !== 0) return;

      if (/^(mailto:|tel:)/i.test(h)) return;

      var url;
      try {
        url = new URL(h, location.href);
      } catch (e) {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (isInternalHttpUrl(url)) return;

      var text = (a.textContent || "").replace(/\s/g, "");
      if (a.querySelector("img") && text === "") return;

      a.classList.add("external-link");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markExternalLinks);
  } else {
    markExternalLinks();
  }
})();
