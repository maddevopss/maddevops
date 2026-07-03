/**
 * MAD DevOps — Tracking léger et respectueux de la vie privée
 * 
 * Fonction centralisée pour tracker les événements utilisateur
 * sans service externe obligatoire et sans données personnelles.
 * 
 * Les événements sont stockés dans window.dataLayer pour une
 * intégration future facile avec Google Analytics ou autre.
 */

function trackEvent(eventName, payload = {}) {
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    viewport: window.innerWidth < 768 ? "mobile" : "desktop",
    ...payload,
  };

  // Mode debug : affiche les événements dans la console
  if (window.MADDEVOPS_TRACKING_DEBUG === true) {
    console.info("[MAD Tracking]", event);
  }

  // Initialise la dataLayer si elle n'existe pas
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

/**
 * Tracker les clics sur les CTA principaux
 * Ajoute un data-tracking-cta sur les liens pour identifier le type de CTA
 */
function initCTATracking() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-tracking-cta]");
    if (link) {
      const ctaType = link.getAttribute("data-tracking-cta");
      trackEvent("cta_clicked", {
        cta_type: ctaType,
        cta_text: link.textContent.trim(),
      });
    }
  });
}

/**
 * Tracker l'ouverture/chargement de la page contact
 */
function initContactPageTracking() {
  if (window.location.pathname === "/contact.html" || window.location.pathname.endsWith("contact.html")) {
    trackEvent("contact_page_viewed");
  }
}

/**
 * Tracker la sélection du type de besoin dans le formulaire
 */
function initNeedSelectionTracking() {
  const needSelect = document.getElementById("need");
  if (needSelect) {
    needSelect.addEventListener("change", (event) => {
      const selectedNeed = event.target.value;
      if (selectedNeed) {
        trackEvent("contact_need_selected", {
          need_type: selectedNeed,
        });
      }
    });
  }
}

/**
 * Tracker la soumission du formulaire contact
 * Ne capture que le type de besoin, pas les données personnelles
 */
function initFormSubmissionTracking() {
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      // Récupère le type de besoin avant la soumission
      const needSelect = document.getElementById("need");
      const selectedNeed = needSelect ? needSelect.value : "unknown";

      trackEvent("contact_form_submitted", {
        need_type: selectedNeed,
      });
    });
  }
}

/**
 * Initialise tous les trackers au chargement du DOM
 */
function initTracking() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initCTATracking();
      initContactPageTracking();
      initNeedSelectionTracking();
      initFormSubmissionTracking();
    });
  } else {
    initCTATracking();
    initContactPageTracking();
    initNeedSelectionTracking();
    initFormSubmissionTracking();
  }
}

// Lance l'initialisation
initTracking();
