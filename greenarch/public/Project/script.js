const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const navbar = document.querySelector(".navbar-main");
const serviceSelect = document.getElementById("serviceSelect");
const AUTH_STORAGE_KEY = "greenarch_user";
const AUTH_TOKEN_KEY = "greenarch_auth_token";
const BOOKINGS_STORAGE_KEY = "greenarch_bookings";
const SAVED_SERVICES_STORAGE_KEY = "greenarch_saved_services";
const PLANT_STORE_PAGE = "plant-store.html";
const NURSERY_LOGIN_PAGE = "nursery-login.html";
const NURSERY_DASHBOARD_PAGE = "nursery-dashboard.html";

function normalizeApiBase(value) {
  const base = String(value || "").trim().replace(/\/+$/, "");
  return base && base !== "null" ? base : "";
}

function buildApiBaseCandidates() {
  const candidates = [];
  const seen = new Set();

  function addCandidate(value) {
    const base = normalizeApiBase(value);
    if (!base || seen.has(base)) {
      return;
    }
    seen.add(base);
    candidates.push(base);
  }

  addCandidate(window.GREENARCH_API_BASE_URL);
  addCandidate(localStorage.getItem("greenarch_api_base_url"));

  if (window.location && window.location.origin && window.location.origin !== "null") {
    addCandidate(window.location.origin);
  }

  ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:4000", "http://127.0.0.1:4000", "http://localhost:5000", "http://127.0.0.1:5000"].forEach(addCandidate);

  return candidates;
}

const API_BASE_CANDIDATES = buildApiBaseCandidates();
const API_BASE_URL = API_BASE_CANDIDATES[0] || "http://localhost:3000";

// Navbar scroll hide/show logic
let lastScrollTop = 0;
let isNavbarHidden = false;
const scrollThreshold = 50;
let scrollTimeout;

window.addEventListener("scroll", () => {
  clearTimeout(scrollTimeout);
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > scrollThreshold) {
    if (scrollTop > lastScrollTop + 5) {
      // Scrolling DOWN - hide navbar
      if (!isNavbarHidden && navbar) {
        navbar.classList.add("navbar-hidden");
        isNavbarHidden = true;
      }
    } else if (scrollTop < lastScrollTop - 5) {
      // Scrolling UP - show navbar
      if (isNavbarHidden && navbar) {
        navbar.classList.remove("navbar-hidden");
        isNavbarHidden = false;
      }
    }
  } else {
    // Near top - always show navbar
    if (isNavbarHidden && navbar) {
      navbar.classList.remove("navbar-hidden");
      isNavbarHidden = false;
    }
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

if (document.body) {
  document.body.classList.add("auth-ui-pending");
}

function normalizeUserPayload(user) {
  if (!user) {
    return null;
  }
  return {
    ...user,
    name: user.name || user.displayName || "GreenArch User",
    email: user.email || "",
    phone: user.phone || user.phoneNumber || "",
    photoURL: user.photoURL || ""
  };
}

function markAuthUiReady() {
  if (!document.body) {
    return;
  }
  document.body.classList.remove("auth-ui-pending");
  document.body.classList.add("auth-ui-ready");
}

function getCurrentUser() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    const firebaseStored = localStorage.getItem("user");
    return firebaseStored ? JSON.parse(firebaseStored) : null;
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  const normalized = normalizeUserPayload(user);
  if (!normalized) {
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  localStorage.setItem("user", JSON.stringify(normalized));
}

function setAuthSession(user, token) {
  setCurrentUser(user);
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

function clearCurrentUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function getApiUrl(pathname) {
  const cleanedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${API_BASE_URL}${cleanedPath}`;
}

async function requestJson(pathname, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestOptions = {
    ...options,
    headers,
    body:
      options.body instanceof FormData || typeof options.body === "string"
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined
  };

  let lastError = null;
  const cleanedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  for (let i = 0; i < API_BASE_CANDIDATES.length; i += 1) {
    const base = API_BASE_CANDIDATES[i];
    try {
      const response = await fetch(`${base}${cleanedPath}`, requestOptions);
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : await response.text();

      if (!response.ok) {
        lastError = new Error(payload && typeof payload === "object" && payload.error ? payload.error : `Request failed (${response.status})`);
        continue;
      }

      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to reach GreenArch API");
}

function resetNavbarToLoggedOut() {
  // Remove profile menu if it exists
  const profileMenu = document.querySelector(".profile-menu");
  if (profileMenu) {
    profileMenu.remove();
  }

  // Show Get Started button
  const startButton = document.querySelector(".btn-start");
  if (startButton) {
    startButton.style.removeProperty("display");
    startButton.setAttribute("onclick", "window.location.href='login.html?tab=login'");
  }

  // Show Login link
  const navListLoginLink = document.querySelector('a[href*="login.html?tab=login"]');
  if (navListLoginLink) {
    const navLoginContainer = navListLoginLink.closest("li") || navListLoginLink;
    navLoginContainer.style.removeProperty("display");
  }

  markAuthUiReady();
}

function getUserInitials(name) {
  if (!name) {
    return "G";
  }
  return name.trim().charAt(0).toUpperCase() || "G";
}

function ensureMarketplaceNavLinks() {
  // Main navbar links are authored directly in HTML to preserve information hierarchy.
  return;
}

function getCurrentRouteFile() {
  const path = (window.location.pathname || "").toLowerCase();
  const rawFile = path.split("/").pop() || "index.html";

  const aliasByFile = {
    "": "index.html",
    "booking.html": "services.html",
    "gardening.html": "services.html",
    "solar.html": "services.html",
    "vendors.html": "services.html",
    "my-bookings.html": "services.html",
    "saved-services.html": "services.html",
    "profile.html": "services.html",
    "settings.html": "services.html",
    "support.html": "services.html",
    "nursery-dashboard.html": "nursery-login.html"
  };

  if (path.endsWith("/")) {
    return "index.html";
  }

  return aliasByFile[rawFile] || rawFile;
}

function getHrefRouteFile(hrefValue) {
  if (!hrefValue) {
    return "";
  }

  const hrefWithoutQuery = hrefValue.split("?")[0].split("#")[0];
  const segments = hrefWithoutQuery.split("/").filter(Boolean);
  return (segments.pop() || "").toLowerCase();
}

function updateActiveNavbarLink() {
  if (!navMenu) {
    return;
  }

  const routeFile = getCurrentRouteFile();
  const menuLinks = navMenu.querySelectorAll("a[href]");

  menuLinks.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  const activeLink = Array.from(menuLinks).find((link) => {
    const routeFromHref = getHrefRouteFile(link.getAttribute("href") || "");
    return routeFromHref && routeFromHref === routeFile;
  });

  if (activeLink) {
    activeLink.classList.add("is-active");
    activeLink.setAttribute("aria-current", "page");
  }

  const navDropdownToggleEl = navMenu.querySelector(".nav-dropdown-toggle");
  const dropdownHasActiveLink = Boolean(navMenu.querySelector(".nav-dropdown-menu a.is-active"));
  if (navDropdownToggleEl) {
    navDropdownToggleEl.classList.toggle("is-active", dropdownHasActiveLink);
  }
}

function getStoredBookings() {
  try {
    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getStoredSavedServices() {
  try {
    const stored = localStorage.getItem(SAVED_SERVICES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredSavedServices(services) {
  localStorage.setItem(SAVED_SERVICES_STORAGE_KEY, JSON.stringify(services));
}

function ensureServiceSaved(serviceValue) {
  if (!serviceValue) {
    return;
  }
  const existing = getStoredSavedServices();
  if (!existing.includes(serviceValue)) {
    existing.push(serviceValue);
    saveStoredSavedServices(existing);
  }
}

function renderNavbarAuthState() {
  if (!navMenu) {
    return;
  }

  ensureMarketplaceNavLinks();

  const user = getCurrentUser();
  const navListLoginLink = navMenu.querySelector('a[href*="login.html?tab=login"]');
  const startButton = navMenu.querySelector(".btn-start");
  const existingProfileMenu = navMenu.querySelector(".profile-menu");

  if (!user) {
    if (navListLoginLink) {
      const navLoginContainer = navListLoginLink.closest("li") || navListLoginLink;
      navLoginContainer.style.removeProperty("display");
    }

    if (existingProfileMenu) {
      existingProfileMenu.remove();
    }

    if (startButton) {
      startButton.style.removeProperty("display");
    }
    markAuthUiReady();
    return;
  }

  if (navListLoginLink) {
    const navLoginContainer = navListLoginLink.closest("li") || navListLoginLink;
    navLoginContainer.style.display = "none";
  }

  if (!startButton) {
    markAuthUiReady();
    return;
  }

  startButton.style.display = "none";

  if (existingProfileMenu) {
    const triggerInitials = existingProfileMenu.querySelector(".profile-trigger-initials");
    const fileName = window.location.pathname.split("/").pop() || "index.html";
    const activeItem = existingProfileMenu.querySelector(`[data-file="${fileName}"]`);

    existingProfileMenu.querySelectorAll(".profile-dropdown-item").forEach((item) => {
      item.classList.remove("is-active");
    });

    if (activeItem) {
      activeItem.classList.add("is-active");
    }

    if (triggerInitials) {
      triggerInitials.textContent = getUserInitials(user.name);
    }
    markAuthUiReady();
    return;
  }

  const fileName = window.location.pathname.split("/").pop() || "index.html";

  const profileMenu = document.createElement("div");
  profileMenu.className = "profile-menu";
  profileMenu.innerHTML = `
    <button class="profile-trigger" type="button" aria-label="Open profile menu" aria-expanded="false">
      <span class="profile-trigger-initials">${getUserInitials(user.name)}</span>
    </button>
    <div class="profile-dropdown" role="menu" aria-label="Profile menu">
      <a href="profile.html" class="profile-dropdown-item" data-file="profile.html" role="menuitem">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5Z" fill="currentColor"/></svg>
        <span>My Profile</span>
      </a>
      <a href="my-bookings.html" class="profile-dropdown-item is-spotlight" data-file="my-bookings.html" role="menuitem">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v2H5a2 2 0 0 0-2 2v2h18V7a2 2 0 0 0-2-2h-2V3h-2v2H9V3Zm14 8H3v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" fill="currentColor"/></svg>
        <span>My Bookings</span>
      </a>
      <a href="saved-services.html" class="profile-dropdown-item" data-file="saved-services.html" role="menuitem">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 8l10 5 8.5-4.25V15h1.5V8L12 3Zm-6.5 9.5V16L12 20l6.5-4v-3.5L12 16Z" fill="currentColor"/></svg>
        <span>My Services / Projects</span>
      </a>
      ${user.role === "partner" ? `<a href="${NURSERY_DASHBOARD_PAGE}" class="profile-dropdown-item is-spotlight" data-file="${NURSERY_DASHBOARD_PAGE}" role="menuitem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v4H4V5Zm0 6h10v8H4v-8Zm12 0h4v8h-4v-8Z" fill="currentColor"/></svg><span>Partner Dashboard</span></a>` : ""}
      <a href="settings.html" class="profile-dropdown-item" data-file="settings.html" role="menuitem">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.43 7.43 0 0 0 .05-.94 7.43 7.43 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.17 7.17 0 0 0-1.63-.94L14.4 2.5a.5.5 0 0 0-.49-.4h-3.82a.5.5 0 0 0-.49.4l-.35 2.82a7.17 7.17 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.43 7.43 0 0 0-.05.94 7.43 7.43 0 0 0 .05.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96a7.17 7.17 0 0 0 1.63.94l.35 2.82a.5.5 0 0 0 .49.4h3.82a.5.5 0 0 0 .49-.4l.35-2.82a7.17 7.17 0 0 0 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z" fill="currentColor"/></svg>
        <span>Settings</span>
      </a>
      <a href="support.html" class="profile-dropdown-item" data-file="support.html" role="menuitem">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a8 8 0 0 0-8 8v3a3 3 0 0 0 3 3h1v-7H6a6 6 0 0 1 12 0h-2v10h-4v2h4a2 2 0 0 0 2-2v-2h1a3 3 0 0 0 3-3v-3a8 8 0 0 0-8-8Z" fill="currentColor"/></svg>
        <span>Support / Help</span>
      </a>
      <a href="settings.html#billing" class="profile-dropdown-item" data-file="settings.html" role="menuitem">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 3h18v2H3Zm3 6h4v2H6Z" fill="currentColor"/></svg>
        <span>Payments & Billing</span>
      </a>
      <div class="profile-dropdown-divider" role="separator" aria-hidden="true"></div>
      <button class="profile-logout" type="button" role="menuitem">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6v-2H4V5h6Zm8.59 3.59L20 8l-4 4 4 4-1.41 1.41L13.17 12ZM7 11h10v2H7Z" fill="currentColor"/></svg>
        <span>Logout</span>
      </button>
    </div>
  `;

  navMenu.appendChild(profileMenu);

  const trigger = profileMenu.querySelector(".profile-trigger");
  const dropdownItems = profileMenu.querySelectorAll(".profile-dropdown-item");
  const activeItem = profileMenu.querySelector(`[data-file="${fileName}"]`);
  const logoutButton = profileMenu.querySelector(".profile-logout");

  if (activeItem) {
    activeItem.classList.add("is-active");
  }

  if (trigger) {
    trigger.addEventListener("click", () => {
      const isOpen = profileMenu.classList.toggle("open");
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      profileMenu.classList.remove("open");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      clearCurrentUser();
      resetNavbarToLoggedOut();
      window.location.href = "login.html?tab=login&logout=1";
    });
  }

  document.addEventListener("click", (event) => {
    if (!profileMenu.contains(event.target)) {
      profileMenu.classList.remove("open");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }
    }
  });

  markAuthUiReady();
}

window.renderNavbarAuthState = renderNavbarAuthState;
window.resetNavbarToLoggedOut = resetNavbarToLoggedOut;

window.addEventListener("greenarch-auth-changed", (event) => {
  const authUser = event?.detail?.user || null;
  if (authUser) {
    setCurrentUser(authUser);
  } else {
    clearCurrentUser();
  }
  renderNavbarAuthState();
  updateActiveNavbarLink();
});

window.addEventListener("storage", (event) => {
  if (event.key === AUTH_STORAGE_KEY || event.key === "user") {
    renderNavbarAuthState();
    updateActiveNavbarLink();
  }
});

function enforceProtectedRoute() {
  const protectedPages = [
    "profile.html",
    "my-bookings.html",
    "saved-services.html",
    "support.html",
    "settings.html",
    NURSERY_DASHBOARD_PAGE
  ];
  const fileName = window.location.pathname.split("/").pop();
  const isProtectedPage = protectedPages.includes(fileName);
  const user = getCurrentUser();

  if (fileName === NURSERY_DASHBOARD_PAGE && user && user.role !== "partner") {
    window.location.href = `${NURSERY_LOGIN_PAGE}?tab=login&redirect=${encodeURIComponent(fileName)}`;
    return;
  }

  if (isProtectedPage && !user) {
    const targetLogin = fileName === NURSERY_DASHBOARD_PAGE ? `${NURSERY_LOGIN_PAGE}?tab=login&redirect=${encodeURIComponent(fileName)}` : `login.html?tab=login&redirect=${encodeURIComponent(fileName)}`;
    window.location.href = targetLogin;
  }
}

async function hydrateUserPages() {
  const user = getCurrentUser();
  if (!user) {
    return;
  }

  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = user.name || "GreenArch User";
  });
  document.querySelectorAll("[data-user-email]").forEach((el) => {
    el.textContent = user.email || "-";
  });
  document.querySelectorAll("[data-user-phone]").forEach((el) => {
    el.textContent = user.phone || "-";
  });

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    const nameInput = document.getElementById("profileName");
    const emailInput = document.getElementById("profileEmail");
    const phoneInput = document.getElementById("profilePhone");

    if (nameInput) nameInput.value = user.name || "";
    if (emailInput) emailInput.value = user.email || "";
    if (phoneInput) phoneInput.value = user.phone || "";

    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const updatedUser = {
        ...user,
        name: nameInput?.value.trim() || user.name,
        email: emailInput?.value.trim() || user.email,
        phone: phoneInput?.value.trim() || user.phone
      };
      try {
        const response = await requestJson("/api/profile", {
          method: "PUT",
          body: updatedUser
        });
        setCurrentUser(response.user);
      } catch {
        setCurrentUser(updatedUser);
      }
      window.location.reload();
    });
  }

  const settingsForm = document.getElementById("settingsAccountForm");
  if (settingsForm) {
    const settingsName = document.getElementById("settingsName");
    const settingsEmail = document.getElementById("settingsEmail");
    const settingsPhone = document.getElementById("settingsPhone");
    if (settingsName) settingsName.value = user.name || "";
    if (settingsEmail) settingsEmail.value = user.email || "";
    if (settingsPhone) settingsPhone.value = user.phone || "";

    settingsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const updatedUser = {
        ...user,
        name: settingsName?.value.trim() || user.name,
        email: settingsEmail?.value.trim() || user.email,
        phone: settingsPhone?.value.trim() || user.phone
      };
      try {
        const response = await requestJson("/api/profile", {
          method: "PUT",
          body: updatedUser
        });
        setCurrentUser(response.user);
      } catch {
        setCurrentUser(updatedUser);
      }
      alert("Account info updated.");
      window.location.reload();
    });
  }

  const settingsPanel = document.getElementById("settingsSaasPanel");
  if (settingsPanel) {
    const SETTINGS_STORAGE_KEY = "greenarch_settings";
    const settingsState = {
      whatsApp: document.getElementById("settingsNotifWhatsapp"),
      email: document.getElementById("settingsNotifEmail"),
      address: document.getElementById("settingsAddress"),
      addAddress: document.getElementById("settingsAddAddress"),
      prefGardening: document.getElementById("prefGardening"),
      prefSolar: document.getElementById("prefSolar"),
      prefBoth: document.getElementById("prefBoth"),
      logoutAll: document.getElementById("settingsLogoutAll")
    };

    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    };

    const saveSettings = () => {
      const payload = {
        whatsApp: Boolean(settingsState.whatsApp?.checked),
        email: Boolean(settingsState.email?.checked),
        address: settingsState.address?.value.trim() || "",
        preference: settingsState.prefBoth?.checked
          ? "both"
          : settingsState.prefSolar?.checked
            ? "solar"
            : "gardening"
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
    };

    const savedState = loadSettings();
    if (savedState) {
      if (settingsState.whatsApp) settingsState.whatsApp.checked = Boolean(savedState.whatsApp);
      if (settingsState.email) settingsState.email.checked = Boolean(savedState.email);
      if (settingsState.address) settingsState.address.value = savedState.address || "";
      if (savedState.preference === "solar" && settingsState.prefSolar) settingsState.prefSolar.checked = true;
      if (savedState.preference === "both" && settingsState.prefBoth) settingsState.prefBoth.checked = true;
      if (savedState.preference === "gardening" && settingsState.prefGardening) settingsState.prefGardening.checked = true;
    }

    [
      settingsState.whatsApp,
      settingsState.email,
      settingsState.address,
      settingsState.prefGardening,
      settingsState.prefSolar,
      settingsState.prefBoth
    ].forEach((input) => {
      if (!input) {
        return;
      }
      const eventName = input.tagName === "TEXTAREA" ? "input" : "change";
      input.addEventListener(eventName, saveSettings);
    });

    if (settingsState.addAddress && settingsState.address) {
      settingsState.addAddress.addEventListener("click", () => {
        const separator = settingsState.address.value.trim() ? "\n" : "";
        settingsState.address.value += `${separator}Address line `;
        settingsState.address.focus();
        saveSettings();
      });
    }

    if (settingsState.logoutAll) {
      settingsState.logoutAll.addEventListener("click", async () => {
        try {
          await requestJson("/api/auth/logout", {
            method: "POST",
            body: { token: getAuthToken() }
          });
        } catch {
          // Ignore logout API failures and clear local state anyway.
        }
        clearCurrentUser();
        alert("You have been logged out from this browser session.");
        window.location.href = "login.html?tab=login&logout=1";
      });
    }
  }

  const bookingsContainer = document.getElementById("bookingsList");
  const renderBookingsList = async () => {
    if (!bookingsContainer) {
      return;
    }

    let bookings = getStoredBookings();
    if (getAuthToken()) {
      try {
        const response = await requestJson("/api/bookings/me", { method: "GET" });
        if (Array.isArray(response.bookings) && response.bookings.length) {
          bookings = response.bookings;
        }
      } catch {
        // Keep the local fallback.
      }
    }

    if (!bookings.length) {
      bookingsContainer.innerHTML = '<p class="account-empty">No bookings yet. Book your first inspection.</p>';
    } else {
      bookingsContainer.innerHTML = bookings
        .slice()
        .reverse()
        .map((booking) => {
          const statusClass = (booking.status || "Pending").toLowerCase();
          const bookingLabel = booking.serviceLabel || booking.service || "Gardening Consultation";
          const bookingRequirements = booking.requirements || [booking.plantSize, booking.timeSlot].filter(Boolean).join(" | ") || "Inspection booking submitted.";
          const bookingDate = booking.dateLabel || booking.preferredDay || "Date not selected";
          return `
            <article class="account-list-card">
              <div>
                <h3>${bookingLabel}</h3>
                <p>${bookingRequirements}</p>
                <small>${bookingDate}</small>
              </div>
              <span class="status-badge status-${statusClass}">${booking.status || "Pending"}</span>
            </article>
          `;
        })
        .join("");
    }
  };

  renderBookingsList();

  const savedServicesContainer = document.getElementById("savedServicesList");
  if (savedServicesContainer) {
    const serviceNameMap = {
      balcony: "Balcony Gardening",
      vertical: "Vertical Gardening",
      indoor: "Indoor Plants",
      terrace: "Terrace Garden",
      maintenance: "Maintenance Plan"
    };
    let saved = getStoredSavedServices();
    if (getAuthToken()) {
      try {
        const response = await requestJson("/api/saved-services", { method: "GET" });
        if (Array.isArray(response.savedServices) && response.savedServices.length) {
          saved = response.savedServices.map((item) => item.serviceId || item.title || item.id).filter(Boolean);
        }
      } catch {
        // Keep the local fallback.
      }
    }

    if (!saved.length) {
      savedServicesContainer.innerHTML = '<p class="account-empty">No saved services yet.</p>';
    } else {
      savedServicesContainer.innerHTML = saved
        .map((serviceKey) => {
          const label = serviceNameMap[serviceKey] || serviceKey;
          return `
            <article class="service-save-card">
              <h3>${label}</h3>
              <p>Recommended package and booking assistance available.</p>
              <a class="btn btn-solid" href="booking.html">Book Free Inspection</a>
            </article>
          `;
        })
        .join("");
    }
  }

  const logoutButtons = document.querySelectorAll("[data-logout]");
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await requestJson("/api/auth/logout", {
          method: "POST",
          body: { token: getAuthToken() }
        });
      } catch {
        // Ignore logout API failures and clear local state anyway.
      }
      clearCurrentUser();
      resetNavbarToLoggedOut();
      // Call resetUI if it exists (on login.html)
      if (typeof resetUI === "function") {
        resetUI();
      } else {
        // Redirect to login on other pages
        window.location.href = "login.html?tab=login&logout=1";
      }
    });
  });

  const supportForm = document.getElementById("supportForm");
  if (supportForm) {
    supportForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = supportForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
      }

      const currentUser = getCurrentUser();
      const subject = document.getElementById("supportSubject")?.value.trim() || "";
      const message = document.getElementById("supportMessage")?.value.trim() || "";

      try {
        await requestJson("/api/support", {
          method: "POST",
          body: {
            name: currentUser?.name || "",
            email: currentUser?.email || "",
            subject,
            message
          }
        });

        alert("Your support query has been raised. Our team will contact you within 24 hours.");
        supportForm.reset();
      } catch {
        alert("Failed to submit your support request. Please try again.");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }

  const deleteAccountButton = document.querySelector("[data-delete-account]");
  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", () => {
      const shouldDelete = window.confirm("Delete your account data from this browser?");
      if (!shouldDelete) {
        return;
      }
      clearCurrentUser();
      localStorage.removeItem(BOOKINGS_STORAGE_KEY);
      localStorage.removeItem(SAVED_SERVICES_STORAGE_KEY);
      window.location.href = "index.html";
    });
  }
}

enforceProtectedRoute();
renderNavbarAuthState();
updateActiveNavbarLink();
hydrateUserPages();

function injectTrustStrip() {
  const path = window.location.pathname.toLowerCase();
  const isHomePage = path.endsWith("/index.html") || path.endsWith("/") || path === "";
  if (isHomePage) {
    return;
  }

  const main = document.querySelector("main");
  if (!main || main.querySelector(".global-trust-strip")) {
    return;
  }

  const currentFile = window.location.pathname.split("/").pop() || "";
  if (["login.html", "admin.html", "about.html"].includes(currentFile)) {
    return;
  }

  const trustSection = document.createElement("section");
  trustSection.className = "global-trust-strip";
  trustSection.innerHTML = `
    <div class="container trust-strip-wrap">
      <article><h3>Verified Gardening Experts</h3><p>Our professionals are carefully selected to ensure quality service.</p></article>
      <article><h3>Free At-Home Inspection</h3><p>We understand your space before suggesting any solution.</p></article>
      <article><h3>Transparent Process</h3><p>Clear steps from inspection to setup, no hidden confusion.</p></article>
      <article><h3>Fast Response</h3><p>Our team connects with you within 24 hours.</p></article>
      <article><h3>Customized Solutions</h3><p>Every home gets a tailored green setup based on space and needs.</p></article>
    </div>
  `;

  const footer = document.querySelector("footer");
  if (footer) {
    footer.insertAdjacentElement("beforebegin", trustSection);
  } else {
    main.appendChild(trustSection);
  }
}

injectTrustStrip();

const autoRevealSelectors = [
  ".hero-content",
  ".section-head",
  ".split-media",
  ".split-copy",
  ".service-lite-card",
  ".impact-panel",
  ".process-node",
  ".final-focus-card",
  ".service-focus-card",
  ".showcase-card",
  ".blog-card",
  ".step-card",
  ".simple-card",
  ".panel-card",
  ".value-grid article"
];

autoRevealSelectors.forEach((selector) => {
  document.querySelectorAll(selector).forEach((node) => {
    if (!node.classList.contains("reveal")) {
      node.classList.add("reveal", "slide-up");
    }
  });
});

const staggerSelectors = [
  ".stagger-group",
  ".interactive-services",
  ".value-grid",
  ".showcase-grid",
  ".blog-grid-home",
  ".blog-grid-all",
  ".conversion-steps",
  ".simple-grid",
  ".pricing-plan-grid"
];

staggerSelectors.forEach((selector) => {
  document.querySelectorAll(selector).forEach((group) => {
    group.classList.add("stagger-group");
  });
});

const revealItems = document.querySelectorAll(".reveal");
const staggerGroups = document.querySelectorAll(".stagger-group");
const tiltItems = document.querySelectorAll(".tilt-3d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canUsePointerTilt = window.matchMedia("(pointer: fine)").matches;
let lastScrollY = window.scrollY;
let isNavbarTicking = false;
let navbarHiddenState = false;
let navbarScrolledState = window.scrollY > 16;

function setNavbarHidden(isHidden) {
  if (!navbar || navbarHiddenState === isHidden) {
    return;
  }
  navbarHiddenState = isHidden;
  navbar.classList.toggle("navbar-hidden", isHidden);
}

function setNavbarScrolled(isScrolled) {
  if (!navbar || navbarScrolledState === isScrolled) {
    return;
  }
  navbarScrolledState = isScrolled;
  navbar.classList.toggle("navbar-scrolled", isScrolled);
}

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu.classList.toggle("open");

    if (navDropdownItem && navDropdownToggle && window.innerWidth <= 768) {
      navDropdownItem.classList.toggle("open", !expanded);
      navDropdownToggle.setAttribute("aria-expanded", String(!expanded));
    }

    if (navbar && navMenu.classList.contains("open")) {
      setNavbarHidden(false);
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (navMenu && menuToggle) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
    if (navDropdownItem && navDropdownToggle) {
      navDropdownItem.classList.remove("open");
      navDropdownToggle.setAttribute("aria-expanded", "false");
    }
  });
});

const navDropdownToggle = document.querySelector(".nav-dropdown-toggle");
const navDropdownItem = document.querySelector(".nav-dropdown-item");

if (navDropdownToggle && navDropdownItem) {
  const setDropdownOpen = (isOpen) => {
    navDropdownItem.classList.toggle("open", isOpen);
    navDropdownToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navDropdownToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDropdownOpen(!navDropdownItem.classList.contains("open"));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-dropdown-item")) {
      setDropdownOpen(false);
    }
  });

  document.querySelectorAll(".nav-dropdown-menu a").forEach((dropdownLink) => {
    dropdownLink.addEventListener("click", () => {
      setDropdownOpen(false);
    });
  });
}

function updateNavbarOnScroll() {
  if (!navbar) {
    return;
  }

  const currentScrollY = window.scrollY;
  const menuOpen = navMenu && navMenu.classList.contains("open");
  const scrollDelta = currentScrollY - lastScrollY;

  if (currentScrollY > 16) {
    setNavbarScrolled(true);
  } else if (currentScrollY < 4) {
    setNavbarScrolled(false);
  }

  if (menuOpen || currentScrollY <= 90) {
    setNavbarHidden(false);
    lastScrollY = currentScrollY;
    return;
  }

  if (scrollDelta > 10 && currentScrollY > 140) {
    setNavbarHidden(true);
  } else if (scrollDelta < -8) {
    setNavbarHidden(false);
  }

  lastScrollY = currentScrollY;
}

updateNavbarOnScroll();

window.addEventListener(
  "scroll",
  () => {
    if (isNavbarTicking) {
      return;
    }

    isNavbarTicking = true;
    window.requestAnimationFrame(() => {
      updateNavbarOnScroll();
      isNavbarTicking = false;
    });
  },
  { passive: true }
);

if (serviceSelect) {
  const params = new URLSearchParams(window.location.search);
  const service = params.get("service");

  if (service && ["gardening", "solar", "vendors"].includes(service)) {
    serviceSelect.value = service;
  }
}

staggerGroups.forEach((group) => {
  const children = group.querySelectorAll(".reveal");
  children.forEach((child, index) => {
    child.style.transitionDelay = `${index * 130}ms`;
  });
});

if (revealItems.length > 0 && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else if (revealItems.length > 0) {
  revealItems.forEach((item) => item.classList.add("visible"));
}

if (!prefersReducedMotion && canUsePointerTilt && tiltItems.length > 0) {
  const tiltIntensity = 18;

  tiltItems.forEach((item) => {
    item.addEventListener("mousemove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;

      const rotateY = (px - 0.5) * tiltIntensity;
      const rotateX = (0.5 - py) * tiltIntensity;

      item.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px) scale(1.03)`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "";
    });
  });
}

function initSectionParallax() {
  const parallaxNodes = Array.from(document.querySelectorAll("[data-parallax]"));
  if (prefersReducedMotion || parallaxNodes.length === 0) {
    return;
  }

  // Toggle parallax intensity presets here: "ultra-subtle" or "cinematic"
  const PARALLAX_PRESET = "ultra-subtle";
  const parallaxPresets = {
    "ultra-subtle": { maxOffset: 10, intensity: 0.08 },
    cinematic: { maxOffset: 22, intensity: 0.14 }
  };
  const activeParallaxPreset = parallaxPresets[PARALLAX_PRESET] || parallaxPresets["ultra-subtle"];

  let parallaxTicking = false;

  function renderParallax() {
    const viewportHeight = window.innerHeight;
    const enableParallax = window.innerWidth > 900;

    parallaxNodes.forEach((node) => {
      if (!enableParallax) {
        node.style.transform = "";
        return;
      }

      const speed = Number.parseFloat(node.getAttribute("data-speed") || "0.1");
      const rect = node.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        return;
      }

      const viewportCenter = viewportHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const delta = viewportCenter - elementCenter;
      const offset = Math.max(
        -activeParallaxPreset.maxOffset,
        Math.min(activeParallaxPreset.maxOffset, delta * speed * activeParallaxPreset.intensity)
      );

      node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });

    parallaxTicking = false;
  }

  function requestParallax() {
    if (parallaxTicking) {
      return;
    }

    parallaxTicking = true;
    window.requestAnimationFrame(renderParallax);
  }

  renderParallax();
  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
}

initSectionParallax();

function initPricingScrollStory() {
  const pricingStories = Array.from(document.querySelectorAll(".pricing-scroll-story"));
  if (pricingStories.length === 0) {
    return;
  }

  if (prefersReducedMotion) {
    pricingStories.forEach((section) => {
      section.classList.add("is-stage-2");
    });
    return;
  }

  let pricingTicking = false;

  function applyPricingStage() {
    const viewportHeight = window.innerHeight;

    pricingStories.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const scrollSpan = Math.max(section.offsetHeight - viewportHeight, 1);
      const travelled = viewportHeight * 0.2 - rect.top;
      const progress = Math.max(0, Math.min(1, travelled / scrollSpan));

      section.style.setProperty("--pricing-progress", progress.toFixed(4));
      section.classList.remove("is-stage-1", "is-stage-2", "is-stage-3");

      if (progress < 0.34) {
        section.classList.add("is-stage-1");
      } else if (progress < 0.68) {
        section.classList.add("is-stage-2");
      } else {
        section.classList.add("is-stage-3");
      }
    });

    pricingTicking = false;
  }

  function requestPricingStage() {
    if (pricingTicking) {
      return;
    }
    pricingTicking = true;
    window.requestAnimationFrame(applyPricingStage);
  }

  applyPricingStage();
  window.addEventListener("scroll", requestPricingStage, { passive: true });
  window.addEventListener("resize", requestPricingStage);
}

initPricingScrollStory();

function initShowcaseSlider() {
  const showcaseWindow = document.querySelector(".showcase-slider-window");
  const showcaseTrack = document.querySelector(".showcase-row");
  const prevButton = document.querySelector(".showcase-nav-prev");
  const nextButton = document.querySelector(".showcase-nav-next");
  const dotsWrap = document.querySelector(".showcase-dots");

  if (!showcaseWindow || !showcaseTrack) {
    return;
  }

  const sourceCards = Array.from(showcaseTrack.querySelectorAll(".showcase-item"));
  const totalCards = sourceCards.length;
  if (totalCards < 2) {
    return;
  }

  sourceCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    showcaseTrack.appendChild(clone);
  });

  let cardSpan = 0;
  let loopWidth = 0;
  let baseOffset = 0;
  let offset = 0;
  let animationFrameId = 0;
  let lastTimestamp = 0;
  let isPaused = false;
  let lastActiveDot = -1;
  let direction = 1;
  const speedPxPerSecond = 32;
  let dots = [];

  function renderDots() {
    if (!dotsWrap) {
      return;
    }

    dotsWrap.innerHTML = "";
    dots = [];

    for (let i = 0; i < totalCards; i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "showcase-dot";
      dot.setAttribute("aria-label", `Go to showcase item ${i + 1}`);
      dot.addEventListener("click", () => {
        jumpToIndex(i);
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
  }

  function getActiveIndex() {
    if (!cardSpan || !loopWidth) {
      return 0;
    }

    const normalized = (((offset - baseOffset) % loopWidth) + loopWidth) % loopWidth;
    return Math.floor(normalized / cardSpan) % totalCards;
  }

  function syncDots() {
    if (!dots.length) {
      return;
    }

    const active = getActiveIndex();
    if (active === lastActiveDot) {
      return;
    }
    lastActiveDot = active;

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === active);
    });
  }

  function renderTrack() {
    showcaseTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  function measureTrack() {
    const firstCard = showcaseTrack.querySelector(".showcase-item");
    if (!firstCard) {
      return;
    }

    const rowStyles = window.getComputedStyle(showcaseTrack);
    const gap = Number.parseFloat(rowStyles.gap || rowStyles.columnGap || "0");
    const peek = Number.parseFloat(window.getComputedStyle(showcaseWindow).paddingLeft || "0");

    cardSpan = firstCard.getBoundingClientRect().width + gap;
    loopWidth = cardSpan * totalCards;
    baseOffset = Math.max(loopWidth - peek, 0);

    if (!offset) {
      offset = baseOffset;
    } else {
      const normalized = (((offset - baseOffset) % loopWidth) + loopWidth) % loopWidth;
      offset = baseOffset + normalized;
    }

    renderTrack();
    syncDots();
  }

  function jumpToIndex(index) {
    if (!cardSpan || !loopWidth) {
      return;
    }
    offset = baseOffset + (index % totalCards) * cardSpan;
    renderTrack();
    syncDots();
  }

  function stepBy(step) {
    if (!cardSpan || !loopWidth) {
      return;
    }

    const next = (getActiveIndex() + step + totalCards) % totalCards;
    direction = step >= 0 ? 1 : -1;
    jumpToIndex(next);
  }

  function animateSlider(timestamp) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!isPaused && !prefersReducedMotion && cardSpan > 0 && loopWidth > 0) {
      offset += direction * speedPxPerSecond * deltaSeconds;
      const normalized = (((offset - baseOffset) % loopWidth) + loopWidth) % loopWidth;
      offset = baseOffset + normalized;
      renderTrack();
      syncDots();
    }

    animationFrameId = window.requestAnimationFrame(animateSlider);
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      stepBy(-1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      stepBy(1);
    });
  }

  showcaseWindow.addEventListener("mouseenter", () => {
    isPaused = true;
  });
  showcaseWindow.addEventListener("mouseleave", () => {
    isPaused = false;
  });
  showcaseWindow.addEventListener("focusin", () => {
    isPaused = true;
  });
  showcaseWindow.addEventListener("focusout", () => {
    isPaused = false;
  });

  window.addEventListener("resize", measureTrack);

  renderDots();
  measureTrack();
  syncDots();

  if (!prefersReducedMotion) {
    animationFrameId = window.requestAnimationFrame(animateSlider);
  }

  window.addEventListener("beforeunload", () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
  });
}

initShowcaseSlider();

/* ========== MULTI-STEP FORM ========== */
const form = document.getElementById("multiStepForm");
const formSteps = document.querySelectorAll(".form-step");
const progressSteps = document.querySelectorAll(".progress-step");
const progressBar = document.getElementById("progressBar");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const formSubtitle = document.getElementById("formSubtitle");
const formStep = document.getElementById("formStep");
const successMessage = document.getElementById("successMessage");
const messageTextarea = document.getElementById("message");
const charCount = document.getElementById("charCount");
const contactForm = document.getElementById("contactForm");
const contactFormSuccess = document.getElementById("formSuccess");

let currentStep = 1;

const stepSubtitles = {
  1: "Share your details and we'll connect you with the right GreenArch partner.",
  2: "Tell us about your location and service interests.",
  3: "Final details to personalize your experience."
};

const stepButtonTexts = {
  1: "Next Step",
  2: "Continue",
  3: "Submit Request"
};

const validationRules = {
  1: ["name", "phone", "email"],
  2: ["location", "serviceSelect"],
  3: ["message"]
};

// Validation patterns
const validators = {
  name: (value) => value.trim().length >= 2,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[\d\+\-\(\)\s]+$/.test(value) && value.trim().length >= 9,
  location: (value) => value.trim().length >= 2,
  serviceSelect: (value) => value !== "",
  message: () => true
};

function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return true;

  const isValid = validators[fieldId](field.value);
  const errorElement = document.getElementById(fieldId + "Error");

  if (!isValid && field.value.trim() !== "") {
    if (errorElement) {
      errorElement.textContent = getErrorMessage(fieldId);
    }
  }

  return isValid || field.value.trim() === "";
}

function getErrorMessage(fieldId) {
  const messages = {
    name: "Please enter your full name (at least 2 characters)",
    email: "Please enter a valid email address",
    phone: "Please enter a valid phone number",
    location: "Please enter your location",
    serviceSelect: "Please select a service",
    message: "Message is required"
  };
  return messages[fieldId] || "Invalid input";
}

function validateStep(step) {
  const fieldsToValidate = validationRules[step];
  let isValid = true;

  fieldsToValidate.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const fieldValid = validators[fieldId](field.value);
    const errorElement = document.getElementById(fieldId + "Error");

    if (!fieldValid) {
      field.classList.add("invalid");
      if (errorElement) {
        errorElement.textContent = getErrorMessage(fieldId);
        errorElement.style.display = "block";
      }
      isValid = false;
    } else {
      field.classList.remove("invalid");
      if (errorElement) {
        errorElement.style.display = "none";
      }
    }
  });

  return isValid;
}

function updateProgress() {
  const progress = (currentStep / 3) * 100;
  progressBar.style.width = progress + "%";

  progressSteps.forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove("active", "completed");

    if (stepNum === currentStep) {
      step.classList.add("active");
    } else if (stepNum < currentStep) {
      step.classList.add("completed");
    }
  });

  formSubtitle.textContent = stepSubtitles[currentStep];
  nextBtn.textContent = stepButtonTexts[currentStep];
  formStep.value = currentStep;

  if (currentStep === 1) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "block";
  }
}

function showStep(step) {
  formSteps.forEach((s) => {
    s.classList.remove("active");
  });

  document.querySelector(`[data-step="${step}"]`).classList.add("active");
  updateProgress();

  // Scroll to top for mobile
  if (window.innerWidth <= 640) {
    setTimeout(() => {
      document.querySelector(".saas-form-card").scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }
}

if (form && nextBtn && prevBtn && progressBar) {
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 3) {
      submitForm();
    } else {
      currentStep++;
      showStep(currentStep);
    }
  });

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });
}

// Real-time validation on input
document.querySelectorAll(".form-input").forEach((input) => {
  input.addEventListener("blur", () => {
    validateField(input.id);
  });

  input.addEventListener("input", () => {
    if (input.classList.contains("invalid")) {
      validateField(input.id);
    }
  });
});

// Character counter for textarea
if (messageTextarea && charCount) {
  messageTextarea.addEventListener("input", () => {
    const length = messageTextarea.value.length;
    charCount.textContent = `${length} / 500`;

    if (length > 500) {
      messageTextarea.value = messageTextarea.value.substring(0, 500);
      charCount.textContent = "500 / 500";
    }
  });
}

function submitForm() {
  nextBtn.classList.add("loading");
  nextBtn.disabled = true;
  prevBtn.disabled = true;

  // Simulate form submission delay
  setTimeout(() => {
    const formData = new FormData(form);

    // Submit to Formspree
    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    })
      .then((response) => {
        if (response.ok) {
          form.style.display = "none";
          successMessage.style.display = "block";
        } else {
          alert("Failed to submit. Please try again.");
          nextBtn.classList.remove("loading");
          nextBtn.disabled = false;
          prevBtn.disabled = false;
        }
      })
      .catch(() => {
        alert("Failed to submit. Please try again.");
        nextBtn.classList.remove("loading");
        nextBtn.disabled = false;
        prevBtn.disabled = false;
      });
  }, 800);
}

// Initialize form
if (form) {
  updateProgress();

  // Check for URL service parameter
  const params = new URLSearchParams(window.location.search);
  const service = params.get("service");
  if (service && ["gardening", "solar", "vendors"].includes(service)) {
    document.getElementById("serviceSelect").value = service;
  }
}

if (contactForm && !form) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector(".btn-form-submit");
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      await requestJson("/api/contact", {
        method: "POST",
        body: {
          name: document.getElementById("name")?.value.trim() || "",
          email: document.getElementById("email")?.value.trim() || "",
          subject: document.getElementById("subject")?.value.trim() || "",
          message: document.getElementById("message")?.value.trim() || ""
        }
      });

      contactForm.style.display = "none";
      if (contactFormSuccess) {
        contactFormSuccess.style.display = "block";
      }
    } catch {
      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Submission failed");
        }

        contactForm.style.display = "none";
        if (contactFormSuccess) {
          contactFormSuccess.style.display = "block";
        }
      } catch {
        alert("Failed to submit. Please try again.");
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    }
  });
}

/* ========== AUTH PAGE ========== */
const authTabs = document.querySelectorAll(".auth-tab");
const authPanels = document.querySelectorAll(".auth-panel");
const authPasswordToggles = document.querySelectorAll("[data-password-toggle]");
const loginAuthForm = document.getElementById("loginPanel");
const signupAuthForm = document.getElementById("signupPanel");
const signupPassword = document.getElementById("authSignupPassword");
const signupConfirmPassword = document.getElementById("authSignupConfirmPassword");
const signupError = document.getElementById("authSignupError");
const googleLoginBtn = document.getElementById("googleLoginBtn");

function activateAuthPanel(targetId) {
  authTabs.forEach((tab) => {
    const isActive = tab.dataset.authTarget === targetId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  authPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === targetId);
  });
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateAuthPanel(tab.dataset.authTarget);
  });
});

if (authTabs.length && authPanels.length) {
  const authParams = new URLSearchParams(window.location.search);
  const requestedTab = (authParams.get("tab") || "").toLowerCase();

  if (requestedTab === "signup") {
    activateAuthPanel("signupPanel");
  } else if (requestedTab === "login") {
    activateAuthPanel("loginPanel");
  }
}

if (googleLoginBtn && !googleLoginBtn.hasAttribute("data-google-rendered")) {
  googleLoginBtn.addEventListener("click", () => {
    if (typeof window.googleLogin === "function") {
      window.googleLogin();
      return;
    }

    alert("Google Sign-In is not ready yet. Please refresh and try again.");
  });
}

authPasswordToggles.forEach((toggleButton) => {
  toggleButton.addEventListener("click", () => {
    const inputId = toggleButton.dataset.passwordToggle;
    const input = document.getElementById(inputId);
    if (!input) {
      return;
    }

    const showingPassword = input.type === "text";
    input.type = showingPassword ? "password" : "text";
    toggleButton.textContent = showingPassword ? "Show" : "Hide";
    toggleButton.setAttribute("aria-label", showingPassword ? "Show password" : "Hide password");
  });
});

if (loginAuthForm) {
  loginAuthForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = loginAuthForm.querySelector(".auth-submit");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add("is-loading");
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = "Signing in...";
    }
    const emailValue = document.getElementById("authLoginEmail")?.value.trim() || "";
    const passwordValue = document.getElementById("authLoginPassword")?.value || "";

    try {
      const response = await requestJson("/api/auth/login", {
        method: "POST",
        body: {
          email: emailValue,
          password: passwordValue
        }
      });

      setAuthSession(response.user, response.token);

      const authParams = new URLSearchParams(window.location.search);
      const redirectTarget = authParams.get("redirect");
      const roleBasedTarget = response.user?.role === "admin" ? "admin.html" : response.user?.role === "partner" ? NURSERY_DASHBOARD_PAGE : "index.html";
      window.location.href = redirectTarget || roleBasedTarget;
    } catch (error) {
      console.warn(error);
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove("is-loading");
        submitButton.textContent = submitButton.dataset.originalText || "Login";
      }
      alert(error.message || "Login failed. Please check your email and password.");
    }
  });
}

if (signupAuthForm && signupPassword && signupConfirmPassword) {
  signupAuthForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = signupAuthForm.querySelector(".auth-submit");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add("is-loading");
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = "Creating account...";
    }

    if (signupPassword.value !== signupConfirmPassword.value) {
      if (signupError) {
        signupError.textContent = "Passwords do not match. Please recheck.";
      }
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove("is-loading");
        submitButton.textContent = submitButton.dataset.originalText || "Create Account";
      }
      signupConfirmPassword.focus();
      return;
    }

    if (signupError) {
      signupError.textContent = "";
    }

    const signupName = document.getElementById("authSignupName")?.value.trim() || "GreenArch User";
    const signupEmail = document.getElementById("authSignupEmail")?.value.trim() || "user@greenarch.app";
    const signupPhoneValue = document.getElementById("authSignupPhone")?.value.trim() || "";

    try {
      const response = await requestJson("/api/auth/signup", {
        method: "POST",
        body: {
          name: signupName,
          email: signupEmail,
          phone: signupPhoneValue,
          password: signupPassword.value
        }
      });

      setAuthSession(response.user, response.token);
      window.location.href = response.user?.role === "partner" ? NURSERY_DASHBOARD_PAGE : "index.html";
    } catch (error) {
      console.warn(error);
      setCurrentUser({
        name: signupName,
        email: signupEmail,
        phone: signupPhoneValue
      });

      window.location.href = "index.html";
    }
  });
}

const bookingScheduler = document.querySelector("[data-booking-scheduler]");
let resetBookingScheduler = () => {};

if (bookingScheduler) {
  const calendarLabel = bookingScheduler.querySelector("[data-booking-calendar-label]");
  const monthLabel = bookingScheduler.querySelector("[data-booking-month]");
  const calendarGrid = bookingScheduler.querySelector("[data-booking-calendar]");
  const timeSlotsContainer = bookingScheduler.querySelector("[data-booking-time-slots]");
  const selectedDateLabel = bookingScheduler.querySelector("[data-booking-selected-date]");
  const summaryLabel = bookingScheduler.querySelector("[data-booking-selection-summary]");
  const selectionError = bookingScheduler.querySelector("[data-booking-selection-error]");
  const previousMonthButton = bookingScheduler.querySelector("[data-booking-month-prev]");
  const nextMonthButton = bookingScheduler.querySelector("[data-booking-month-next]");
  const preferredDayInput = document.getElementById("preferredDay");
  const timeSlotInput = document.getElementById("timeSlot");

  const schedulerSlots = [
    {
      label: "Morning",
      range: "9:00 AM - 12:00 PM",
      slots: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]
    },
    {
      label: "Afternoon",
      range: "1:00 PM - 5:00 PM",
      slots: ["1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"]
    },
    {
      label: "Evening",
      range: "5:00 PM - 8:00 PM",
      slots: ["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"]
    }
  ];

  const schedulerState = {
    viewMonth: new Date(),
    selectedDate: null,
    selectedSlot: ""
  };

  schedulerState.viewMonth.setDate(1);

  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  });

  function toInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function startOfDay(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  function getInitialDate() {
    const today = startOfDay(new Date());
    const initial = new Date(today);
    initial.setDate(initial.getDate() + 1);
    return initial;
  }

  function updateSummary() {
    const hasDate = Boolean(schedulerState.selectedDate);
    const hasSlot = Boolean(schedulerState.selectedSlot);

    if (selectionError) {
      selectionError.hidden = hasDate && hasSlot;
    }

    if (calendarLabel) {
      calendarLabel.textContent = hasDate ? dayFormatter.format(schedulerState.selectedDate) : "Pick your preferred day";
    }

    if (selectedDateLabel) {
      selectedDateLabel.textContent = hasDate ? dayFormatter.format(schedulerState.selectedDate) : "Choose a day first";
    }

    if (summaryLabel) {
      summaryLabel.textContent = hasDate && hasSlot
        ? `${dayFormatter.format(schedulerState.selectedDate)} • ${schedulerState.selectedSlot}`
        : "Select a day and a time to complete your booking.";
    }
  }

  function selectDate(date) {
    schedulerState.selectedDate = new Date(date);
    schedulerState.viewMonth = new Date(schedulerState.selectedDate.getFullYear(), schedulerState.selectedDate.getMonth(), 1);
    if (preferredDayInput) {
      preferredDayInput.value = toInputValue(schedulerState.selectedDate);
    }
    updateSummary();
    renderCalendar();
  }

  function selectSlot(slot) {
    schedulerState.selectedSlot = slot;
    if (timeSlotInput) {
      timeSlotInput.value = slot;
    }
    updateSummary();
    renderSlots();
  }

  function renderCalendar() {
    if (!calendarGrid || !monthLabel) {
      return;
    }

    const currentMonth = schedulerState.viewMonth;
    monthLabel.textContent = monthFormatter.format(currentMonth);

    const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = (firstOfMonth.getDay() + 6) % 7;
    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - startDay);
    const today = startOfDay(new Date());

    const cells = [];
    for (let index = 0; index < 42; index += 1) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + index);
      const isCurrentMonth = cellDate.getMonth() === currentMonth.getMonth();
      const isPast = startOfDay(cellDate) < today;
      const isSelected = schedulerState.selectedDate && toInputValue(cellDate) === toInputValue(schedulerState.selectedDate);

      cells.push(`
        <button
          type="button"
          class="scheduler-day${isCurrentMonth ? "" : " is-muted"}${isSelected ? " is-active" : ""}${isPast && isCurrentMonth ? " is-disabled" : ""}"
          data-booking-day="${toInputValue(cellDate)}"
          aria-pressed="${isSelected ? "true" : "false"}"
          ${isPast && isCurrentMonth ? "disabled" : ""}
        >
          <span class="scheduler-day-label">${cellDate.getDate()}</span>
        </button>
      `);
    }

    calendarGrid.innerHTML = cells.join("");

    calendarGrid.querySelectorAll("[data-booking-day]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.getAttribute("data-booking-day");
        if (!value) {
          return;
        }
        selectDate(new Date(`${value}T12:00:00`));
      });
    });
  }

  function renderSlots() {
    if (!timeSlotsContainer) {
      return;
    }

    timeSlotsContainer.innerHTML = schedulerSlots
      .map(
        (group) => `
          <section class="scheduler-slot-group">
            <div class="scheduler-slot-head">
              <span class="scheduler-slot-icon" aria-hidden="true">◦</span>
              <div>
                <h4>${group.label}</h4>
                <p>${group.range}</p>
              </div>
            </div>
            <div class="scheduler-slot-grid">
              ${group.slots
                .map((slot) => {
                  const isActive = schedulerState.selectedSlot === slot;
                  return `
                    <button
                      type="button"
                      class="scheduler-slot${isActive ? " is-active" : ""}"
                      data-booking-slot="${slot}"
                      aria-pressed="${isActive ? "true" : "false"}"
                    >
                      ${slot}
                    </button>
                  `;
                })
                .join("")}
            </div>
          </section>
        `
      )
      .join("");

    timeSlotsContainer.querySelectorAll("[data-booking-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.getAttribute("data-booking-slot");
        if (value) {
          selectSlot(value);
        }
      });
    });
  }

  function goToMonth(offset) {
    schedulerState.viewMonth = new Date(schedulerState.viewMonth.getFullYear(), schedulerState.viewMonth.getMonth() + offset, 1);
    renderCalendar();
  }

  if (previousMonthButton) {
    previousMonthButton.addEventListener("click", () => goToMonth(-1));
  }

  if (nextMonthButton) {
    nextMonthButton.addEventListener("click", () => goToMonth(1));
  }

  resetBookingScheduler = () => {
    schedulerState.viewMonth = new Date();
    schedulerState.viewMonth.setDate(1);
    schedulerState.selectedDate = null;
    schedulerState.selectedSlot = "";
    if (preferredDayInput) {
      preferredDayInput.value = "";
    }
    if (timeSlotInput) {
      timeSlotInput.value = "";
    }
    renderCalendar();
    renderSlots();
    updateSummary();
  };

  renderCalendar();
  renderSlots();
  selectDate(getInitialDate());
  selectSlot(schedulerSlots[0].slots[0]);
}

const gardenerBookingForm = document.getElementById("gardenerBookingForm");
if (gardenerBookingForm) {
  const bookingSuccessMessage = document.getElementById("bookingSuccessMessage");
  const bookingSelectionError = document.querySelector("[data-booking-selection-error]");

  gardenerBookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!gardenerBookingForm.checkValidity()) {
      gardenerBookingForm.reportValidity();
      return;
    }

    const formData = new FormData(gardenerBookingForm);
    const bookingPayload = {
      service: "Free Inspection",
      plantSize: String(formData.get("plantSize") || "").trim(),
      preferredDay: String(formData.get("preferredDay") || "").trim(),
      timeSlot: String(formData.get("timeSlot") || "").trim(),
      fullName: String(formData.get("fullName") || "").trim(),
      phoneNumber: String(formData.get("phoneNumber") || "").trim(),
      address: String(formData.get("address") || "").trim()
    };

    if (!bookingPayload.preferredDay || !bookingPayload.timeSlot) {
      if (bookingSelectionError) {
        bookingSelectionError.hidden = false;
      }
      bookingScheduler?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (bookingSelectionError) {
      bookingSelectionError.hidden = true;
    }

    const submitButton = gardenerBookingForm.querySelector(".request-booking-btn");
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const response = await requestJson("/api/bookings", {
        method: "POST",
        body: bookingPayload
      });

      const existingBookings = getStoredBookings();
      existingBookings.push({
        id: response.booking.id,
        serviceLabel: response.booking.serviceLabel,
        requirements: `${response.booking.plantSize} | ${response.booking.timeSlot}`,
        dateLabel: response.booking.preferredDay,
        status: response.booking.status
      });
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(existingBookings));

      gardenerBookingForm.reset();
      resetBookingScheduler();
      if (bookingSuccessMessage) {
        bookingSuccessMessage.hidden = false;
      }
    } catch {
      const existingBookings = getStoredBookings();
      existingBookings.push({
        id: `local_${Date.now()}`,
        serviceLabel: "Free Inspection",
        requirements: `${bookingPayload.plantSize} | ${bookingPayload.timeSlot}`,
        dateLabel: bookingPayload.preferredDay,
        status: "Pending"
      });
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(existingBookings));

      gardenerBookingForm.reset();
      if (bookingSuccessMessage) {
        bookingSuccessMessage.hidden = false;
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}


