const form = document.getElementById("contact-form");
const formCard = document.querySelector(".form-card");

function appendText(parent, tagName, text) {
  const node = document.createElement(tagName);
  node.textContent = text;
  parent.appendChild(node);
  return node;
}

function showSuccessMessage(mailtoHref) {
  const existingMessage = document.getElementById("contact-success-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const successMessage = document.createElement("div");
  successMessage.id = "contact-success-message";
  successMessage.className = "success-message";
  successMessage.setAttribute("role", "status");
  successMessage.setAttribute("aria-live", "polite");

  appendText(successMessage, "h3", "✓ Merci pour votre demande!");
  appendText(
    successMessage,
    "p",
    "Votre message est prêt à être envoyé à contact@maddevops.com. Vous recevrez une réponse dans les 24 heures.",
  );

  const fallback = appendText(
    successMessage,
    "p",
    "Si le client email ne s'ouvre pas, vous pouvez aussi ",
  );
  const fallbackLink = document.createElement("a");
  fallbackLink.href = mailtoHref;
  fallbackLink.textContent = "cliquer ici";
  fallback.appendChild(fallbackLink);
  fallback.append(" ou écrire directement à contact@maddevops.com.");

  formCard.insertBefore(successMessage, form);
  successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const lines = [
    `Nom: ${data.get("name")}`,
    `Courriel: ${data.get("email")}`,
    `Type de besoin: ${data.get("need")}`,
    `Message: ${data.get("message")}`,
  ];

  const budget = data.get("budget");
  const delay = data.get("delay");

  if (budget) {
    lines.push(`Budget approximatif: ${budget}`);
  }

  if (delay) {
    lines.push(`Délai souhaité: ${delay}`);
  }

  const subject = encodeURIComponent(
    `Demande de consultation MAD DevOps - ${data.get("need")}`,
  );
  const body = encodeURIComponent(lines.join("\n\n"));
  const mailtoHref = `mailto:contact@maddevops.com?subject=${subject}&body=${body}`;

  showSuccessMessage(mailtoHref);

  setTimeout(() => {
    window.location.href = mailtoHref;
  }, 500);
});
