/**
 * Shared nav, footer, and home project grid.
 * Resolves /myrepo/... when the site is hosted as a GitHub Project Page.
 */
(function () {
  "use strict";

  function getSiteRoot() {
    try {
      const el = document.querySelector('script[src*="site.js"]');
      const src = el && el.src;
      if (!src) return "";
      const pathname = new URL(src).pathname;
      return pathname.replace(/\/assets\/site\.js$/i, "") || "";
    } catch {
      return "";
    }
  }

  function prefixPath(path, root) {
    if (!path || path.startsWith("http")) return path;
    if (path.startsWith("/")) return root + path;
    return root + "/" + path;
  }

  function currentPath() {
    return window.location.pathname.replace(/\/$/, "") || "/";
  }

  function pathIsActive(href, root) {
    try {
      const target = new URL(href, window.location.origin).pathname.replace(/\/$/, "") || "/";
      const cur = currentPath();
      if (target === cur) return true;
      if (target.endsWith("/index.html")) {
        const dir = target.replace(/\/index\.html$/, "") || "/";
        if (cur === dir) return true;
      }
      const rootNorm = (root || "").replace(/\/$/, "") || "";
      if (rootNorm && cur === rootNorm && (target === rootNorm + "/index.html" || target === rootNorm)) return true;
      if (!rootNorm && (cur === "/" || cur === "/index.html") && (target === "/index.html" || target === "/")) return true;
      return false;
    } catch {
      return false;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildProjectLinks(projects, root) {
    return projects
      .map(function (p) {
        const href = prefixPath(p.href, root);
        const cur = pathIsActive(href, root) ? ' aria-current="page"' : "";
        return (
          '<a href="' +
          escapeHtml(href) +
          '"' +
          cur +
          ">" +
          escapeHtml(p.title) +
          "</a>"
        );
      })
      .join("");
  }

  function renderNav(data, root) {
    const site = data.site || {};
    const projects = data.projects || [];
    const homeHref = prefixPath("/index.html", root);
    const projectsIndexHref = prefixPath("/projects/index.html", root);
    const cur = currentPath();
    const rootNorm = root.replace(/\/$/, "") || "";
    const homeMatch =
      pathIsActive(homeHref, root) ||
      (!rootNorm && (cur === "/" || cur === "/index.html")) ||
      (rootNorm && (cur === rootNorm || cur === rootNorm + "/index.html"));

    const linksHtml =
      '<ul class="site-nav__links">' +
      '<li><a href="' +
      escapeHtml(homeHref) +
      '"' +
      (homeMatch ? ' aria-current="page"' : "") +
      ">Home</a></li>" +
      '<li><a href="' +
      escapeHtml(projectsIndexHref) +
      '"' +
      (pathIsActive(projectsIndexHref, root) ? ' aria-current="page"' : "") +
      ">All projects</a></li>" +
      '<li class="nav-dd">' +
      '<button type="button" class="nav-dd__btn" id="nav-dd-btn" aria-expanded="false" aria-haspopup="true" aria-controls="nav-dd-panel">' +
      "Projects <span aria-hidden=\"true\">▾</span></button>" +
      '<div class="nav-dd__panel" id="nav-dd-panel" role="menu">' +
      buildProjectLinks(projects, root) +
      "</div></li></ul>";

    return (
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<header class="site-nav" role="banner">' +
      '<a class="site-nav__brand" href="' +
      escapeHtml(homeHref) +
      '">' +
      escapeHtml(site.name || "Portfolio") +
      "</a>" +
      '<div class="site-nav__inner">' +
      '<button type="button" class="site-nav__toggle" id="nav-menu-btn" aria-expanded="false" aria-controls="nav-drawer" aria-label="Open menu">' +
      "☰</button>" +
      '<div class="site-nav__drawer" id="nav-drawer">' +
      linksHtml +
      "</div></div></header>"
    );
  }

  function renderFooter(data) {
    const site = data.site || {};
    const year = new Date().getFullYear();
    const gh = site.github ? '<a href="' + escapeHtml(site.github) + '" rel="noopener noreferrer">GitHub</a>' : "";
    const li = site.linkedin
      ? '<a href="' + escapeHtml(site.linkedin) + '" rel="noopener noreferrer">LinkedIn</a>'
      : "";
    const social = [gh, li].filter(Boolean).join("");
    const email = site.email ? '<a href="mailto:' + escapeHtml(site.email) + '">' + escapeHtml(site.email) + "</a>" : "";
    const phone = site.phone ? '<a href="tel:' + escapeHtml(site.phone) + '">' + escapeHtml(site.phone) + "</a>" : "";
    const contact = [email, phone].filter(Boolean).join(" · ");
    return (
      '<footer class="site-footer" role="contentinfo">' +
      (social ? '<div class="site-footer__social">' + social + "</div>" : "") +
      (contact ? '<p style="margin-bottom: 0.5rem;">' + contact + "</p>" : "") +
      "<p>© " +
      year +
      " " +
      escapeHtml(site.name || "") +
      "</p></footer>"
    );
  }

  function wireNav() {
    const drawer = document.getElementById("nav-drawer");
    const menuBtn = document.getElementById("nav-menu-btn");
    const ddBtn = document.getElementById("nav-dd-btn");
    const ddPanel = document.getElementById("nav-dd-panel");

    if (menuBtn && drawer) {
      menuBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = drawer.classList.toggle("is-open");
        menuBtn.setAttribute("aria-expanded", open);
        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      document.addEventListener("click", function (e) {
        if (!drawer.contains(e.target) && e.target !== menuBtn && drawer.classList.contains("is-open")) {
          drawer.classList.remove("is-open");
          menuBtn.setAttribute("aria-expanded", "false");
          menuBtn.setAttribute("aria-label", "Open menu");
        }
      });
      drawer.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          if (window.matchMedia("(max-width: 768px)").matches) {
            drawer.classList.remove("is-open");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.setAttribute("aria-label", "Open menu");
          }
        });
      });
    }

    if (ddBtn && ddPanel) {
      ddBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = ddPanel.classList.toggle("is-open");
        ddBtn.setAttribute("aria-expanded", open);
      });
      document.addEventListener("click", function () {
        ddPanel.classList.remove("is-open");
        ddBtn.setAttribute("aria-expanded", "false");
      });
      ddPanel.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }
  }

  function fillProjectGrid(projects, root) {
    const grid = document.getElementById("project-grid");
    if (!grid) return;
    const featured = projects.filter(function (p) {
      return p.featured !== false;
    });
    grid.innerHTML = featured
      .map(function (p) {
        const href = prefixPath(p.href, root);
        const tags = (p.tags || [])
          .map(function (t) {
            return '<span class="tag">' + escapeHtml(t) + "</span>";
          })
          .join("");
        return (
          "<li>" +
          '<a class="project-card" href="' +
          escapeHtml(href) +
          '">' +
          "<h3>" +
          escapeHtml(p.title) +
          "</h3>" +
          "<p>" +
          escapeHtml(p.summary || "") +
          "</p>" +
          '<div class="project-card__tags">' +
          tags +
          "</div></a></li>"
        );
      })
      .join("");
  }

  function fillProjectIndexList(projects, root) {
    const list = document.getElementById("project-index-list");
    if (!list) return;
    list.innerHTML = (projects || [])
      .map(function (p) {
        const href = prefixPath(p.href, root);
        return (
          "<li><a href=\"" +
          escapeHtml(href) +
          "\"><h3>" +
          escapeHtml(p.title) +
          "</h3><p>" +
          escapeHtml(p.summary || "") +
          "</p></a></li>"
        );
      })
      .join("");
  }

  function mount() {
    const navMount = document.getElementById("site-nav");
    const footMount = document.getElementById("site-footer");
    if (!navMount && !footMount && !document.getElementById("project-grid") && !document.getElementById("project-index-list")) return;

    const root = getSiteRoot();
    const jsonUrl = prefixPath("/assets/projects.json", root);
    fetch(jsonUrl)
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(function (data) {
        if (navMount) {
          navMount.outerHTML = renderNav(data, root);
          wireNav();
        }
        if (footMount) {
          footMount.outerHTML = renderFooter(data);
        }
        fillProjectGrid(data.projects || [], root);
        fillProjectIndexList(data.projects || [], root);
      })
      .catch(function () {
        if (navMount) {
          navMount.outerHTML =
            '<header class="site-nav" role="banner"><span class="site-nav__brand">Tyler Weber</span></header>';
        }
        if (footMount) {
          footMount.outerHTML = "<footer class=\"site-footer\"><p>Portfolio</p></footer>";
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
