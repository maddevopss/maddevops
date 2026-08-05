const form = document.getElementById("contact-form");
const params = new URLSearchParams(window.location.search);
const needField = document.getElementById("need");

if (params.get("need") === "madsuite" && needField) {
  needField.value = "MADSuite";
}

if (params.get("project") === "fines-herbes") {
  const messageField = document.getElementById("message");
  if (messageField && !messageField.value) {
    messageField.value =
      "Je souhaite obtenir plus d'information sur le projet Au Royaume des Fines Herbes.";
  }
}

const formCard = document.querySelector(".form-card");

function appendText(parent, tagName, text) {
  const node = document.createElement(tagName);
  node.textContent = text;
  parent.appendChild(node);
  return node;
}

function buildMailto(data) {
  const lines = [
    `Nom: ${data.get("name")}`,
    `Courriel: ${data.get("email")}`,
    `Type de besoin: ${data.get("need")}`,
    `Message: ${data.get("message")}`,
  ];

  if (data.get("budget")) {
    lines.push(`Budget approximatif: ${data.get("budget")}`);
  }
  if (data.get("delay")) {
    lines.push(`Délai souhaité: ${data.get("delay")}`);
  }

  const subject = encodeURIComponent(
    `Demande de consultation MAD DevOps - ${data.get("need")}`,
  );
  const body = encodeURIComponent(lines.join("\n\n"));
  return `mailto:contact@maddevops.com?subject=${subject}&body=${body}`;
}

function showMessage(title, message, mailtoHref = null, isError = false) {
  document.getElementById("contact-status")?.remove();

  const status = document.createElement("div");
  status.id = "contact-status";
  status.className = isError ? "success-message error-message" : "success-message";
  status.setAttribute("role", isError ? "alert" : "status");
  status.setAttribute("aria-live", "polite");
  appendText(status, "h3", title);
  appendText(status, "p", message);

  if (mailtoHref) {
    const fallback = appendText(status, "p", "Si nécessaire, ");
    const link = document.createElement("a");
    link.href = mailtoHref;
    link.textContent = "ouvrir le courriel de secours";
    fallback.appendChild(link);
    fallback.append(" ou écrire directement à contact@maddevops.com.");
  }

  formCard.insertBefore(status, form);
  status.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const mailtoHref = buildMailto(data);
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/contact.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(Object.fromEntries(data.entries())),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Envoi impossible.");
    }

    showMessage(
      "✓ Merci pour votre demande!",
      "Votre message a été envoyé. Une réponse vous sera transmise dès que possible.",
    );
    form.reset();
  } catch {
    showMessage(
      "L’envoi automatique n’est pas disponible.",
      "Votre message est prêt à être envoyé avec l’application courriel.",
      mailtoHref,
      true,
    );
  } finally {
    submitButton.disabled = false;
  }
});
