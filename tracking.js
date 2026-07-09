/**
 * MAD DevOps — Tracking léger et respectueux de la vie privée
 *
 * Fonction centralisée pour tracker les événements utilisateur
 * sans service externe obligatoire et sans données personnelles.
 *
 * Les événements sont stockés dans window.dataLayer pour une
 * intégration future optionnelle.
 */

function trackEvent(eventName, payload = {}) {
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    viewport: window.innerWidth < 768 ? "mobile" : "desktop",
    ...payload,
  };

  if (window.MADDEVOPS_TRACKING_DEBUG === true) {
    console.info("[MAD Tracking]", event);
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

/**
 * Tracker les clics sur les CTA principaux.
 *
 * Ne capture pas le texte visible du lien afin de garder le payload minimal
 * et stable. Le type de CTA doit être défini explicitement dans
 * data-tracking-cta.
 */
function initCTATracking() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-tracking-cta]");
    if (!link) return;

    const ctaType = link.getAttribute("data-tracking-cta");
    if (!ctaType) return;

    trackEvent("cta_clicked", {
      cta_type: ctaType,
    });
  });
}

function initContactPageTracking() {
  if (window.location.pathname === "/contact.html" || window.location.pathname.endsWith("contact.html")) {
    trackEvent("contact_page_viewed");
  }
}

function initNeedSelectionTracking() {
  const needSelect = document.getElementById("need");
  if (!needSelect) return;

  needSelect.addEventListener("change", (event) => {
    const selectedNeed = event.target.value;
    if (!selectedNeed) return;

    trackEvent("contact_need_selected", {
      need_type: selectedNeed,
    });
  });
}

/**
 * Tracker la soumission du formulaire contact.
 * Ne capture que le type de besoin, pas les données personnelles.
 */
function initFormSubmissionTracking() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", () => {
    const needSelect = document.getElementById("need");
    const selectedNeed = needSelect ? needSelect.value : "unknown";

    trackEvent("contact_form_submitted", {
      need_type: selectedNeed,
    });
  });
}

function initTracking() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initCTATracking();
      initContactPageTracking();
      initNeedSelectionTracking();
      initFormSubmissionTracking();
    });
    return;
  }

  initCTATracking();
  initContactPageTracking();
  initNeedSelectionTracking();
  initFormSubmissionTracking();
}

initTracking();
