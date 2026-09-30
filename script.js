// North Star Bakery - Touchstone 4
// Favorites list (products.html) and pre-order form validation with pre-fill (contact.html)

// ---------- Data (objects and arrays) ----------

// Object 1: localStorage key names in one place
const STORAGE_KEYS = {
  favorites: "nsb-favorites",
  customer: "nsb-customer"
};

// Array 1: products a customer can save as favorites
const products = [
  { id: "signature-loaf", name: "Signature Loaf", category: "Bread" },
  { id: "sourdough", name: "Sourdough", category: "Bread" },
  { id: "whole-wheat", name: "Whole Wheat Loaf", category: "Bread" },
  { id: "rye", name: "Rye Loaf", category: "Bread" },
  { id: "croissant", name: "Butter Croissant", category: "Pastry" },
  { id: "danish", name: "Fruit Danish", category: "Pastry" },
  { id: "scone", name: "Scone", category: "Pastry" },
  { id: "morning-bun", name: "Cinnamon Morning Bun", category: "Pastry" },
  { id: "custom-cake", name: "Custom Cake", category: "Cake" }
];

// Object 2: validation rules for each form field
const validationRules = {
  name: {
    check: (value) => value.trim().length >= 2,
    message: "Please enter your full name (at least 2 characters)."
  },
  email: {
    check: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    message: "Please enter a valid email address, like name@example.com."
  },
  "pickup-date": {
    check: isValidPickupDate,
    message: "Choose a pickup date from today forward. We are closed on Mondays."
  },
  "item-details": {
    check: (value) => value.trim().length >= 10,
    message: "Please describe your order in at least 10 characters."
  }
};

// ---------- Storage helpers ----------

function readStorage(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Could not save to localStorage:", error);
  }
}

// ---------- Favorites feature (products.html) ----------

function loadFavorites() {
  const saved = readStorage(STORAGE_KEYS.favorites);
  return Array.isArray(saved) ? saved : [];
}

function getProductName(id) {
  const product = products.find((item) => item.id === id);
  return product ? product.name : id;
}

function toggleFavorite(id) {
  let favorites = loadFavorites();
  if (favorites.includes(id)) {
    favorites = favorites.filter((favId) => favId !== id);
  } else {
    favorites.push(id);
  }
  writeStorage(STORAGE_KEYS.favorites, favorites);
  renderFavorites();
}

function clearFavorites() {
  writeStorage(STORAGE_KEYS.favorites, []);
  renderFavorites();
}

function renderProductPicker() {
  const picker = document.getElementById("product-picker");
  const favorites = loadFavorites();
  picker.innerHTML = "";

  products.forEach((product) => {
    const button = document.createElement("button");
    const isFavorite = favorites.includes(product.id);
    button.type = "button";
    button.className = isFavorite ? "product-btn is-favorite" : "product-btn";
    button.setAttribute("aria-pressed", isFavorite);
    button.textContent = (isFavorite ? "★ " : "☆ ") + product.name + " (" + product.category + ")";
    button.addEventListener("click", () => toggleFavorite(product.id));
    picker.appendChild(button);
  });
}

function renderFavoritesList() {
  const list = document.getElementById("favorites-list");
  const count = document.getElementById("favorites-count");
  const favorites = loadFavorites();
  list.innerHTML = "";

  if (favorites.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No favorites yet. Tap an item above to add one.";
    list.appendChild(empty);
  } else {
    favorites.forEach((id) => {
      const item = document.createElement("li");
      item.textContent = getProductName(id);
      list.appendChild(item);
    });
  }
  count.textContent = favorites.length;
}

function renderFavorites() {
  renderProductPicker();
  renderFavoritesList();
}

function initFavorites() {
  if (!document.getElementById("product-picker")) return;
  document.getElementById("clear-favorites").addEventListener("click", clearFavorites);
  renderFavorites();
}

// ---------- Form validation (contact.html) ----------

function isValidPickupDate(value) {
  if (!value) return false;
  const picked = new Date(value + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isMonday = picked.getDay() === 1;
  return picked >= today && !isMonday;
}

function showError(fieldId, message) {
  document.getElementById(fieldId + "-error").textContent = message;
  const field = document.getElementById(fieldId);
  if (field) {
    field.setAttribute("aria-invalid", "true");
    field.classList.add("input-error");
  }
}

function clearError(fieldId) {
  document.getElementById(fieldId + "-error").textContent = "";
  const field = document.getElementById(fieldId);
  if (field) {
    field.removeAttribute("aria-invalid");
    field.classList.remove("input-error");
  }
}

function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  const rule = validationRules[fieldId];
  if (rule.check(field.value)) {
    clearError(fieldId);
    return true;
  }
  showError(fieldId, rule.message);
  return false;
}

function validateRequestType() {
  const selected = document.querySelector('input[name="request-type"]:checked');
  if (selected) {
    clearError("request-type");
    return true;
  }
  showError("request-type", "Please choose a request type.");
  return false;
}

function validateForm() {
  const fieldIds = Object.keys(validationRules);
  const results = fieldIds.map((id) => validateField(id));
  const requestTypeValid = validateRequestType();

  const firstInvalid = fieldIds.find((id, index) => !results[index]);
  if (firstInvalid) {
    document.getElementById(firstInvalid).focus();
  }
  return results.every(Boolean) && requestTypeValid;
}

// ---------- Pre-fill (contact.html) ----------

function prefillForm() {
  const note = document.getElementById("prefill-note");
  const customer = readStorage(STORAGE_KEYS.customer);
  const favorites = loadFavorites();
  const messages = [];

  if (customer) {
    document.getElementById("name").value = customer.name;
    document.getElementById("email").value = customer.email;
    messages.push("Welcome back, " + customer.name + ". We filled in your saved contact information.");
  }

  const details = document.getElementById("item-details");
  if (favorites.length > 0 && details.value.trim() === "") {
    details.value = "Favorites: " + favorites.map(getProductName).join(", ");
    messages.push("Your saved favorites were added to Item details.");
  }

  note.textContent = messages.join(" ");
}

function handleSubmit(event) {
  event.preventDefault();
  const success = document.getElementById("form-success");
  success.textContent = "";

  if (!validateForm()) return;

  const customer = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim()
  };
  writeStorage(STORAGE_KEYS.customer, customer);

  success.textContent = "Thank you, " + customer.name + "! Your request was received. We will confirm by email within one business day.";
  event.target.reset();
  prefillForm();
}

function initForm() {
  const form = document.getElementById("order-form");
  if (!form) return;

  prefillForm();
  form.addEventListener("submit", handleSubmit);

  // Re-check a field as the user fixes it, so errors clear without restarting
  Object.keys(validationRules).forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      if (document.getElementById(id).getAttribute("aria-invalid") === "true") {
        validateField(id);
      }
    });
  });
  document.querySelectorAll('input[name="request-type"]').forEach((radio) => {
    radio.addEventListener("change", validateRequestType);
  });
}

// ---------- Start ----------

initFavorites();
initForm();
