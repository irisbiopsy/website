/* IRIS Biopsy: site behavior (no dependencies) */
(function () {
  "use strict";

  // Settings live in js/config.js
  var CONFIG = window.IRIS_CONFIG || {};
  var HUBSPOT = CONFIG.hubspot || {};
  // Where leads go if HubSpot isn't configured or can't be reached.
  var CONTACT_EMAIL = CONFIG.contactEmail || "info@irisbiopsy.com";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) setNav(false);
    });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]:not(.btn)'));
  if ("IntersectionObserver" in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = byId[entry.target.id];
        navLinks.forEach(function (l) { l.classList.remove("is-active"); });
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) {
      sectionObserver.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var start = null;
    var dur = 1200;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Team photo fallback (shows initials if a photo is missing) ---------- */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    function missing() { img.classList.add("is-missing"); }
    if (img.complete && img.naturalWidth === 0) missing();
    img.addEventListener("error", missing);
  });

  /* ---------- Early access form ---------- */
  var form = document.getElementById("access-form");
  var card = document.getElementById("access-card");
  if (!form || !card) return;

  var statusEl = form.querySelector(".form-status");
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.querySelector(".btn-label") : null;

  // Capture campaign attribution so outreach can be tracked in submissions.
  try {
    var params = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign"].forEach(function (key) {
      var field = form.elements[key];
      if (!field) return;
      var value = params.get(key);
      try {
        if (value) window.sessionStorage.setItem("iris_" + key, value);
        else value = window.sessionStorage.getItem("iris_" + key);
      } catch (e) { /* storage unavailable */ }
      if (value) field.value = value;
    });
    if (form.elements.referrer) form.elements.referrer.value = document.referrer || "";
  } catch (e) { /* URLSearchParams unavailable */ }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Phone is optional; if given, allow digits, spaces, + ( ) . - and "ext", 7 to 15 digits.
  function validPhone(value) {
    if (!/^[\d\s()+.\-xXextEXT#]+$/.test(value)) return false;
    var digits = value.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15;
  }

  function validateField(input) {
    var wrap = input.closest(".field");
    if (!wrap) return true;
    var value = String(input.value || "").trim();
    var ok = true;
    if (input.required && !value) ok = false;
    if (ok && input.type === "email" && value && !emailRe.test(value)) ok = false;
    if (ok && input.type === "tel" && value && !validPhone(value)) ok = false;
    wrap.classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    return ok;
  }

  var requiredFields = Array.prototype.slice.call(form.querySelectorAll('[required], input[type="tel"]'));
  requiredFields.forEach(function (input) {
    var evt = input.tagName === "SELECT" ? "change" : "blur";
    input.addEventListener(evt, function () { validateField(input); });
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("has-error")) validateField(input);
    });
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function showError(html) {
    statusEl.innerHTML = html;
    statusEl.className = "form-status is-error";
  }
  function clearError() {
    statusEl.innerHTML = "";
    statusEl.className = "form-status";
  }
  function setBusy(busy) {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    if (submitLabel) submitLabel.textContent = busy ? "Sending…" : "Request early access";
  }

  function readForm() {
    var d = new FormData(form);
    function val(name) { return String(d.get(name) || "").trim(); }
    return {
      firstname: val("firstname"),
      lastname: val("lastname"),
      email: val("email"),
      phone: val("phone"),
      company: val("institution"),
      jobtitle: val("role"),
      volume: val("monthly_volume"),
      interests: d.getAll("interest"),
      message: val("message"),
      utm: [val("utm_source"), val("utm_medium"), val("utm_campaign")].filter(Boolean),
      referrer: val("referrer")
    };
  }

  // Everything that isn't a field on the HubSpot form goes into its Message field.
  // Role goes there too unless the HubSpot form has a Job title field (see js/config.js).
  function composeMessage(v, includeRole) {
    var lines = [];
    if (includeRole && v.jobtitle) lines.push("Role: " + v.jobtitle);
    if (v.volume) lines.push("CT-guided cases per month: " + v.volume);
    if (v.interests.length) lines.push("Interested in: " + v.interests.join(", "));
    if (v.message) lines.push("", v.message);
    if (v.utm.length || v.referrer) lines.push("");
    if (v.utm.length) lines.push("Campaign: " + v.utm.join(" / "));
    if (v.referrer) lines.push("Referrer: " + v.referrer);
    return lines.join("\n").trim();
  }

  function mailtoFallback() {
    var v = readForm();
    var lines = [
      "Name: " + (v.firstname + " " + v.lastname).trim(),
      "Email: " + v.email,
      "Phone: " + v.phone,
      "Institution: " + v.company,
      "",
      composeMessage(v, true)
    ];
    return "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent("IRIS early access request") +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }

  function hubspotEndpoint() {
    if (!HUBSPOT.portalId || !HUBSPOT.formId) return "";
    var host = HUBSPOT.region === "eu1" ? "api-eu1.hsforms.com" : "api.hsforms.com";
    return "https://" + host + "/submissions/v3/integration/submit/" +
      encodeURIComponent(HUBSPOT.portalId) + "/" + encodeURIComponent(HUBSPOT.formId);
  }

  function hubspotPayload(v) {
    var fields = [];
    function add(name, value) {
      if (value) fields.push({ objectTypeId: "0-1", name: name, value: value });
    }
    // These names must match fields on the HubSpot form, or HubSpot rejects the submission.
    var sendJobTitle = HUBSPOT.sendJobTitle === true;
    add("firstname", v.firstname);
    add("lastname", v.lastname);
    add("email", v.email);
    add("phone", v.phone);
    add("company", v.company);
    if (sendJobTitle) add("jobtitle", v.jobtitle);
    add("message", composeMessage(v, !sendJobTitle));

    var context = { pageName: document.title };
    if (/^https?:$/.test(window.location.protocol)) context.pageUri = window.location.href;
    var hutk = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
    if (hutk) context.hutk = hutk[1];

    return { submittedAt: Date.now(), fields: fields, context: context };
  }

  // Turn HubSpot's error codes into something a visitor can act on.
  function friendlyError(data) {
    var errors = (data && data.errors) || [];
    for (var i = 0; i < errors.length; i++) {
      var type = errors[i].errorType;
      if (type === "INVALID_EMAIL" || type === "BLOCKED_EMAIL") {
        return "That email address wasn't accepted. Please check it, or use your work email.";
      }
      if (/phone/i.test(errors[i].message || "")) {
        return "That phone number wasn't accepted. Please check it, or leave it blank.";
      }
    }
    return "Something went wrong sending your request.";
  }

  function success() {
    card.classList.add("is-done");
    var done = card.querySelector(".form-success");
    if (done) done.focus({ preventScroll: true });
    card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    // Records the lead in Google Analytics (and LinkedIn, if a conversion ID is set)
    if (typeof window.irisTrackConversion === "function") window.irisTrackConversion();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var firstBad = null;
    requiredFields.forEach(function (input) {
      if (!validateField(input) && !firstBad) firstBad = input;
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }

    // Spam honeypot: real people never fill this in.
    if (form.elements.website && form.elements.website.value) {
      success();
      return;
    }

    var endpoint = hubspotEndpoint();
    if (!endpoint) {
      if (window.console) console.warn("[IRIS] HubSpot isn't connected yet. Add portalId and formId in js/config.js.");
      showError('Our form is being set up. Please <a href="' + mailtoFallback() + '">send your request by email</a> instead and we\'ll be in touch.');
      return;
    }

    setBusy(true);
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(hubspotPayload(readForm()))
    })
      .then(function (res) {
        if (res.ok) return success();
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (window.console) console.error("[IRIS] HubSpot rejected the submission:", res.status, data);
          throw { friendly: friendlyError(data) };
        });
      })
      .catch(function (err) {
        if (err && !err.friendly && window.console) console.error("[IRIS] Couldn't reach HubSpot:", err);
        var msg = err && err.friendly ? err.friendly : "We couldn't reach our form service.";
        showError(escapeHtml(msg) + ' Please try again, or <a href="' + mailtoFallback() +
          '">email your request</a> to ' + CONTACT_EMAIL + ".");
      })
      .then(function () { setBusy(false); });
  });
})();
