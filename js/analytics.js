/* IRIS Biopsy: analytics
   Loads Google Analytics, the LinkedIn Insight Tag and (once connected) HubSpot's
   tracking code. All IDs live in js/config.js.
   Early access form submissions are recorded in Google Analytics as a "generate_lead"
   event, and as a LinkedIn conversion if a conversion ID is set. */
(function () {
  "use strict";

  var CONFIG = window.IRIS_CONFIG || {};
  var GA_MEASUREMENT_ID = CONFIG.googleAnalyticsId || "";
  var LINKEDIN_PARTNER_ID = CONFIG.linkedInPartnerId || "";
  var LINKEDIN_CONVERSION_ID = CONFIG.linkedInConversionId || "";
  var HUBSPOT = CONFIG.hubspot || {};

  function loadScript(src, id) {
    var s = document.createElement("script");
    s.async = true;
    s.defer = true;
    s.src = src;
    if (id) s.id = id;
    var first = document.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(s, first);
  }

  /* ---------- Google Analytics 4 ---------- */
  if (GA_MEASUREMENT_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID);
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID);
  }

  window.irisTrackConversion = function () {
    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", { form: "early_access" });
    }
    if (LINKEDIN_CONVERSION_ID && typeof window.lintrk === "function") {
      window.lintrk("track", { conversion_id: Number(LINKEDIN_CONVERSION_ID) });
    }
  };

  /* ---------- HubSpot tracking code (page views, lead source) ---------- */
  if (HUBSPOT.portalId && HUBSPOT.trackingCode !== false) {
    var hsHost = HUBSPOT.region === "eu1" ? "js-eu1.hs-scripts.com"
      : HUBSPOT.region === "na2" ? "js-na2.hs-scripts.com"
      : "js.hs-scripts.com";
    loadScript("https://" + hsHost + "/" + encodeURIComponent(HUBSPOT.portalId) + ".js", "hs-script-loader");
  }

  /* ---------- LinkedIn Insight Tag ---------- */
  if (LINKEDIN_PARTNER_ID) {
    window._linkedin_partner_id = LINKEDIN_PARTNER_ID;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
    if (!window.lintrk) {
      window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
      window.lintrk.q = [];
    }
    loadScript("https://snap.licdn.com/li.lms-analytics/insight.min.js");
  }
})();
