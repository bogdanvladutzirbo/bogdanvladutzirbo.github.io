/* ==========================================================================
   Codru Lemne — site behaviour
   ========================================================================== */

(function () {
  "use strict";

  /* Change these two values and the whole site follows. */
  var CONTACT = {
    orderEmail: "comenzi@codrulemne.ro",
    whatsapp: "40741000000" // international format, digits only
  };

  var STORAGE_KEY = "codru-lang";
  var dict = window.TRANSLATIONS || {};
  var lang = "ro";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function t(key) {
    var pack = dict[lang] || {};
    return pack[key] !== undefined ? pack[key] : key;
  }

  /* ------------------------------------------------------------------ i18n */
  function applyLanguage(next) {
    lang = dict[next] ? next : "ro";
    document.documentElement.lang = lang;

    $$("[data-i18n]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n"));
      if (value) el.textContent = value;
    });

    $$("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });

    $$("[data-i18n-content]").forEach(function (el) {
      el.setAttribute("content", t(el.getAttribute("data-i18n-content")));
    });

    $$(".lang-switch button").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  function initialLanguage() {
    var stored;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }
    if (stored && dict[stored]) return stored;
    var nav = (navigator.language || "ro").toLowerCase();
    return nav.indexOf("ro") === 0 ? "ro" : "en";
  }

  $$(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLanguage(btn.getAttribute("data-lang"));
    });
  });

  applyLanguage(initialLanguage());

  /* ---------------------------------------------------------------- header */
  var header = $("#siteHeader");
  var toTop = $("#toTop");

  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------ mobile nav */
  var navToggle = $("#navToggle");
  var primaryNav = $("#primaryNav");

  function closeNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", primaryNav).forEach(function (a) { a.addEventListener("click", closeNav); });
  }

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ----------------------------------------------------- active nav marker */
  var navLinks = $$('.nav a[href^="#"]');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* -------------------------------------------------------- reveal on scroll */
  var revealables = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        window.setTimeout(function () { el.classList.add("is-visible"); }, i * 70);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    revealables.forEach(function (el) { revealer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* -------------------------------------------------------------- lightbox */
  var lightbox = $("#lightbox");
  var lightboxImg = $("#lightboxImg");
  var lightboxCap = $("#lightboxCap");
  var items = $$(".gallery-item");
  var current = 0;
  var lastFocused = null;

  function showItem(index) {
    if (!items.length) return;
    current = (index + items.length) % items.length;
    var item = items[current];
    lightboxImg.src = item.getAttribute("data-src");
    lightboxCap.textContent = t(item.getAttribute("data-caption-key"));
    lightboxImg.alt = lightboxCap.textContent;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    showItem(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    $(".lightbox-close", lightbox).focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { openLightbox(i); });
  });

  if (lightbox) {
    $(".lightbox-close", lightbox).addEventListener("click", closeLightbox);
    $(".lightbox-nav.prev", lightbox).addEventListener("click", function () { showItem(current - 1); });
    $(".lightbox-nav.next", lightbox).addEventListener("click", function () { showItem(current + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    window.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showItem(current - 1);
      if (e.key === "ArrowRight") showItem(current + 1);
    });
  }

  /* ------------------------------------------------------------ order form */
  var form = $("#orderForm");
  var status = $("#formStatus");

  function setError(field, message) {
    var id = field.id || field.name;
    var slot = $('[data-error-for="' + id + '"]');
    if (slot) slot.textContent = message || "";
    field.classList.toggle("is-invalid", Boolean(message));
  }

  function validate() {
    if (!form) return null;

    var name = form.elements.name;
    var phone = form.elements.phone;
    var email = form.elements.email;
    var product = form.elements.product;
    var qty = form.elements.qty;
    var city = form.elements.city;
    var consent = form.elements.consent;

    var errors = 0;

    function require(field) {
      var ok = String(field.value || "").trim().length > 0;
      setError(field, ok ? "" : t("validate.required"));
      if (!ok) errors++;
      return ok;
    }

    require(name);
    require(city);
    require(product);

    if (require(phone)) {
      var digits = phone.value.replace(/[^\d]/g, "");
      if (digits.length < 9) {
        setError(phone, t("validate.phone"));
        errors++;
      }
    }

    if (String(email.value).trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      setError(email, t("validate.email"));
      errors++;
    } else {
      setError(email, "");
    }

    if (!(Number(qty.value) > 0)) {
      setError(qty, t("validate.qty"));
      errors++;
    } else {
      setError(qty, "");
    }

    var consentSlot = $('[data-error-for="consent"]');
    if (!consent.checked) {
      if (consentSlot) consentSlot.textContent = t("validate.consent");
      errors++;
    } else if (consentSlot) {
      consentSlot.textContent = "";
    }

    return errors === 0;
  }

  function selectedLabel(select) {
    var option = select.options[select.selectedIndex];
    return option ? option.textContent.trim() : "";
  }

  function buildMessage() {
    var f = form.elements;
    var lengthInput = form.querySelector('input[name="length"]:checked');
    var lines = [
      t("mail.intro"),
      "",
      t("mail.product") + ": " + selectedLabel(f.product),
      t("mail.qty") + ": " + f.qty.value + " " + selectedLabel(f.unit),
      t("mail.length") + ": " + (lengthInput ? lengthInput.value : "-"),
      t("mail.city") + ": " + f.city.value.trim(),
      t("mail.name") + ": " + f.name.value.trim(),
      t("mail.phone") + ": " + f.phone.value.trim()
    ];

    if (String(f.email.value).trim()) lines.push(t("mail.email") + ": " + f.email.value.trim());
    if (f.date.value) lines.push(t("mail.date") + ": " + f.date.value);
    if (String(f.notes.value).trim()) lines.push(t("mail.notes") + ": " + f.notes.value.trim());

    return lines.join("\n");
  }

  function showStatus(kind, message) {
    if (!status) return;
    status.textContent = message;
    status.className = "form-status is-visible " + (kind === "ok" ? "is-ok" : "is-err");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validate()) {
        showStatus("err", t("status.err"));
        var firstBad = form.querySelector(".is-invalid");
        if (firstBad) firstBad.focus();
        return;
      }

      var subject = t("mail.subject") + " — " + form.elements.name.value.trim();
      var href = "mailto:" + CONTACT.orderEmail +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(buildMessage());

      window.location.href = href;
      showStatus("ok", t("status.ok"));
    });

    // Clear a field's error as soon as the visitor starts fixing it.
    $$("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) setError(field, "");
      });
    });

    var waButton = $("#waSend");
    if (waButton) {
      waButton.addEventListener("click", function () {
        if (!validate()) {
          showStatus("err", t("status.err"));
          return;
        }
        var url = "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(buildMessage());
        window.open(url, "_blank", "noopener");
      });
    }
  }

  /* ------------------------------------------------------------------ misc */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
