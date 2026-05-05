import {
  supabase,
  deviceId,
  isSupabaseConfigured,
  ensureAnonymousSession,
} from "./supabaseClient.js";

const pageTitle = document.getElementById("page-title");
const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item")];
const toast = document.getElementById("toast");
const themeSelect = document.getElementById("theme-select");
const languageSelect = document.getElementById("language-select");
const incidentFeed = document.getElementById("incident-feed");
const myReportsList = document.getElementById("my-reports-list");
const trustedContactsList = document.getElementById("trusted-contacts-list");
const trustedContactForm = document.getElementById("trusted-contact-form");
const routeHistoryList = document.getElementById("route-history-list");
const lastSosTime = document.getElementById("last-sos-time");
const incidentsTodayCount = document.getElementById("incidents-today-count");
const safeZonesCount = document.getElementById("safe-zones-count");
const patrolUnitsCount = document.getElementById("patrol-units-count");
const riskPill = document.querySelector(".pill");
const alertsBadge = document.querySelector("[data-action='alerts-center']");
const profileDisplayName = document.getElementById("profile-display-name");
const editProfileBtn = document.getElementById("edit-profile-btn");
const profileEditorCard = document.getElementById("profile-editor-card");
const profileForm = document.getElementById("profile-form");
const profileNameInput = document.getElementById("profile-name-input");
const cancelProfileEditBtn = document.getElementById("cancel-profile-edit");
const simpleProfileForm = document.getElementById("simple-profile-form");
const simpleProfileNameInput = document.getElementById("simple-profile-name");
const simpleProfileEmailInput = document.getElementById("simple-profile-email");
const simpleProfilesList = document.getElementById("simple-profile-list");

const labels = {
  map: "Safety Map",
  report: "Incident Report",
  sos: "SOS Center",
  gps: "GPS Safe Route",
  settings: "Settings",
};

const state = {
  currentUserId: null,
  currentProfileName: "Community Member",
  selectedIncidentType: "crime",
  selectedRouteKey: "A",
  incidents: [],
  myReports: [],
  contacts: [],
  routes: [],
  simpleProfiles: [],
};

const copy = {
  en: {
    mapTitle: "Safety Map",
    reportTitle: "Incident Report",
    sosTitle: "SOS Center",
    gpsTitle: "GPS Safe Route",
    settingsTitle: "Settings",
    appTagline: "Smart Urban Safety",
    riskLevel: "Risk: Medium",
    share: "Share",
    currentLocation: "Current Location",
    mapOverlayDetail: "2 alerts within 1km radius",
    incidentsToday: "11",
    incidentsTodayLabel: "Incidents today",
    safeZones: "6",
    safeZonesLabel: "Safe zones nearby",
    patrolUnits: "4",
    patrolUnitsLabel: "Patrol units active",
    nearbyAlerts: "Nearby Alerts",
    viewAll: "View all",
    highRisk: "High",
    mediumRisk: "Medium",
    alertOne: "Theft reported near City Mall.",
    alertOneMeta: "300m away • 14 min ago",
    alertTwo: "Road accident near Oak Junction.",
    alertTwoMeta: "1.2km away • 38 min ago",
    shareMyLocation: "Share My Live Location",
    reportIncident: "Report an Incident",
    reportHint:
      "Your report helps route people away from danger in real time.",
    crime: "Crime",
    accident: "Accident",
    harassment: "Harassment",
    other: "Other",
    incidentLocation: "Location",
    details: "Details",
    anonymousReport: "Submit anonymously",
    uploadProof: "Attach photo or video",
    submitReport: "Submit Report",
    sosStatus: "Emergency mode ready",
    sosQuickCall: "Emergency Quick Call",
    sosDescription: "Tap and hold for 2 seconds to alert contacts.",
    broadcastSos: "Broadcast SOS to trusted contacts",
    police: "Police 911",
    ambulance: "Ambulance 112",
    fire: "Fire 101",
    helpline: "Helpline 1098",
    trustedContacts: "Trusted Contacts",
    silentSos: "Send Silent SOS",
    safeRouting: "Safe Route Planner",
    fromShort: "From",
    toShort: "To",
    fromLocation: "From",
    toLocation: "To",
    routePriority: "Route Priority",
    wellLitRoads: "Well-lit roads",
    avoidIsolated: "Avoid isolated streets",
    avoidTraffic: "Avoid heavy traffic",
    routeOptionOne: "Route A",
    routeOptionOneMeta: "14 min • Low risk",
    routeOptionTwo: "Route B",
    routeOptionTwoMeta: "11 min • Medium risk",
    findSafeRoute: "Find Safest Route",
    preferences: "Preferences",
    profileTagline: "Safety mode: Aware commuter",
    editProfile: "Edit profile",
    profileEditorTitle: "Edit Profile",
    displayNameLabel: "Display name",
    appearance: "Appearance",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    pushAlerts: "Push danger alerts",
    locationSharing: "Auto location sharing",
    emergencyPreferences: "Emergency Preferences",
    autoSiren: "Auto siren after SOS",
    shareRoute: "Share active route with contacts",
    mapTab: "Map",
    reportTab: "Report",
    sosTab: "SOS",
    gpsTab: "GPS",
    settingsTab: "Settings",
    reportSent: "Report sent successfully.",
    locationShared: "Live location shared.",
    sosBroadcasted: "SOS broadcast sent to trusted contacts.",
    routeReady: "Safest route generated.",
    databaseDisabled:
      "Supabase is not configured. Add env values and restart the app.",
    savedPreferences: "Preferences saved.",
    reportUpdated: "Report updated.",
    reportDeleted: "Report deleted.",
    contactSaved: "Trusted contact saved.",
    contactDeleted: "Trusted contact deleted.",
    routeSaved: "Route saved to history.",
    routeDeleted: "Route deleted.",
    routeUpdated: "Route updated.",
    profileSaved: "Profile name updated.",
    profileNameRequired: "Please enter a display name.",
    profileSchemaMissing:
      "Profile table is missing. Run the latest SQL schema in Supabase.",
  },
  es: {
    mapTitle: "Mapa de Seguridad",
    reportTitle: "Reporte de Incidente",
    sosTitle: "Centro SOS",
    gpsTitle: "Ruta GPS Segura",
    settingsTitle: "Ajustes",
    appTagline: "Seguridad Urbana Inteligente",
    riskLevel: "Riesgo: Medio",
    share: "Compartir",
    currentLocation: "Ubicacion Actual",
    mapOverlayDetail: "2 alertas dentro de 1km",
    incidentsToday: "11",
    incidentsTodayLabel: "Incidentes hoy",
    safeZones: "6",
    safeZonesLabel: "Zonas seguras cercanas",
    patrolUnits: "4",
    patrolUnitsLabel: "Patrullas activas",
    nearbyAlerts: "Alertas Cercanas",
    viewAll: "Ver todo",
    highRisk: "Alta",
    mediumRisk: "Media",
    alertOne: "Robo reportado cerca de City Mall.",
    alertOneMeta: "A 300m • hace 14 min",
    alertTwo: "Accidente vial cerca de Oak Junction.",
    alertTwoMeta: "A 1.2km • hace 38 min",
    shareMyLocation: "Compartir mi ubicacion en vivo",
    reportIncident: "Reportar un Incidente",
    reportHint:
      "Tu reporte ayuda a desviar personas del peligro en tiempo real.",
    crime: "Crimen",
    accident: "Accidente",
    harassment: "Acoso",
    other: "Otro",
    incidentLocation: "Ubicacion",
    details: "Detalles",
    anonymousReport: "Enviar anonimamente",
    uploadProof: "Adjuntar foto o video",
    submitReport: "Enviar reporte",
    sosStatus: "Modo emergencia listo",
    sosQuickCall: "Llamada de Emergencia",
    sosDescription: "Mantener 2 segundos para alertar a tus contactos.",
    broadcastSos: "Enviar SOS a contactos de confianza",
    police: "Policia 911",
    ambulance: "Ambulancia 112",
    fire: "Bomberos 101",
    helpline: "Linea de ayuda 1098",
    trustedContacts: "Contactos de confianza",
    silentSos: "Enviar SOS silencioso",
    safeRouting: "Planificador de Ruta Segura",
    fromShort: "Desde",
    toShort: "Hasta",
    fromLocation: "Desde",
    toLocation: "Hasta",
    routePriority: "Prioridad de ruta",
    wellLitRoads: "Calles bien iluminadas",
    avoidIsolated: "Evitar calles aisladas",
    avoidTraffic: "Evitar trafico pesado",
    routeOptionOne: "Ruta A",
    routeOptionOneMeta: "14 min • Riesgo bajo",
    routeOptionTwo: "Ruta B",
    routeOptionTwoMeta: "11 min • Riesgo medio",
    findSafeRoute: "Buscar ruta mas segura",
    preferences: "Preferencias",
    profileTagline: "Modo seguridad: viajero atento",
    editProfile: "Editar perfil",
    profileEditorTitle: "Editar perfil",
    displayNameLabel: "Nombre visible",
    appearance: "Apariencia",
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",
    language: "Idioma",
    pushAlerts: "Alertas de peligro",
    locationSharing: "Compartir ubicacion automaticamente",
    emergencyPreferences: "Preferencias de emergencia",
    autoSiren: "Sirena automatica despues de SOS",
    shareRoute: "Compartir ruta activa con contactos",
    mapTab: "Mapa",
    reportTab: "Reporte",
    sosTab: "SOS",
    gpsTab: "GPS",
    settingsTab: "Ajustes",
    reportSent: "Reporte enviado correctamente.",
    locationShared: "Ubicacion en vivo compartida.",
    sosBroadcasted: "SOS enviado a tus contactos de confianza.",
    routeReady: "Ruta segura generada.",
    databaseDisabled:
      "Supabase no esta configurado. Agrega variables de entorno y reinicia la app.",
    savedPreferences: "Preferencias guardadas.",
    reportUpdated: "Reporte actualizado.",
    reportDeleted: "Reporte eliminado.",
    contactSaved: "Contacto guardado.",
    contactDeleted: "Contacto eliminado.",
    routeSaved: "Ruta guardada.",
    routeDeleted: "Ruta eliminada.",
    routeUpdated: "Ruta actualizada.",
    profileSaved: "Nombre de perfil actualizado.",
    profileNameRequired: "Ingresa un nombre visible.",
    profileSchemaMissing:
      "Falta la tabla de perfil. Ejecuta el SQL mas reciente en Supabase.",
  },
  fr: {
    mapTitle: "Carte de Securite",
    reportTitle: "Signalement d'Incident",
    sosTitle: "Centre SOS",
    gpsTitle: "Itineraire GPS Securise",
    settingsTitle: "Reglages",
    appTagline: "Securite Urbaine Intelligente",
    riskLevel: "Risque : Moyen",
    share: "Partager",
    currentLocation: "Position Actuelle",
    mapOverlayDetail: "2 alertes dans un rayon de 1km",
    incidentsToday: "11",
    incidentsTodayLabel: "Incidents aujourd'hui",
    safeZones: "6",
    safeZonesLabel: "Zones sures proches",
    patrolUnits: "4",
    patrolUnitsLabel: "Patrouilles actives",
    nearbyAlerts: "Alertes Proches",
    viewAll: "Voir tout",
    highRisk: "Eleve",
    mediumRisk: "Moyen",
    alertOne: "Vol signale pres de City Mall.",
    alertOneMeta: "A 300m • il y a 14 min",
    alertTwo: "Accident pres de Oak Junction.",
    alertTwoMeta: "A 1,2km • il y a 38 min",
    shareMyLocation: "Partager ma position en direct",
    reportIncident: "Signaler un incident",
    reportHint:
      "Votre signalement aide a rediriger les gens loin du danger en temps reel.",
    crime: "Crime",
    accident: "Accident",
    harassment: "Harcelement",
    other: "Autre",
    incidentLocation: "Lieu",
    details: "Details",
    anonymousReport: "Envoyer anonymement",
    uploadProof: "Joindre photo ou video",
    submitReport: "Envoyer le signalement",
    sosStatus: "Mode urgence pret",
    sosQuickCall: "Appel d'urgence",
    sosDescription: "Maintenez 2 secondes pour alerter vos contacts.",
    broadcastSos: "Diffuser SOS aux contacts de confiance",
    police: "Police 911",
    ambulance: "Ambulance 112",
    fire: "Pompiers 101",
    helpline: "Assistance 1098",
    trustedContacts: "Contacts de confiance",
    silentSos: "Envoyer SOS silencieux",
    safeRouting: "Planificateur d'itineraire securise",
    fromShort: "De",
    toShort: "Vers",
    fromLocation: "De",
    toLocation: "Vers",
    routePriority: "Priorite d'itineraire",
    wellLitRoads: "Routes bien eclairees",
    avoidIsolated: "Eviter les rues isolees",
    avoidTraffic: "Eviter le trafic dense",
    routeOptionOne: "Itineraire A",
    routeOptionOneMeta: "14 min • Risque faible",
    routeOptionTwo: "Itineraire B",
    routeOptionTwoMeta: "11 min • Risque moyen",
    findSafeRoute: "Trouver l'itineraire le plus sur",
    preferences: "Preferences",
    profileTagline: "Mode securite : navetteur vigilant",
    editProfile: "Modifier profil",
    profileEditorTitle: "Modifier le profil",
    displayNameLabel: "Nom affiche",
    appearance: "Apparence",
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    language: "Langue",
    pushAlerts: "Alertes de danger push",
    locationSharing: "Partage automatique de position",
    emergencyPreferences: "Preferences d'urgence",
    autoSiren: "Sirene auto apres SOS",
    shareRoute: "Partager l'itineraire actif",
    mapTab: "Carte",
    reportTab: "Signaler",
    sosTab: "SOS",
    gpsTab: "GPS",
    settingsTab: "Reglages",
    reportSent: "Signalement envoye avec succes.",
    locationShared: "Position en direct partagee.",
    sosBroadcasted: "SOS diffuse a vos contacts de confiance.",
    routeReady: "Itineraire securise genere.",
    databaseDisabled:
      "Supabase n'est pas configure. Ajoutez les variables d'environnement et redemarrez l'application.",
    savedPreferences: "Preferences enregistrees.",
    reportUpdated: "Signalement mis a jour.",
    reportDeleted: "Signalement supprime.",
    contactSaved: "Contact de confiance enregistre.",
    contactDeleted: "Contact supprime.",
    routeSaved: "Itineraire enregistre.",
    routeDeleted: "Itineraire supprime.",
    routeUpdated: "Itineraire mis a jour.",
    profileSaved: "Nom du profil mis a jour.",
    profileNameRequired: "Veuillez saisir un nom affiche.",
    profileSchemaMissing:
      "La table de profil est absente. Executez le SQL le plus recent dans Supabase.",
  },
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function switchPage(target) {
  pages.forEach((page) => page.classList.toggle("active", page.dataset.page === target));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.target === target));
  pageTitle.textContent = (copy[languageSelect.value] || copy.en)[`${target}Title`] || labels[target];
}

function applyLanguage(language) {
  const selected = copy[language] || copy.en;
  const i18nElements = document.querySelectorAll("[data-i18n]");
  i18nElements.forEach((el) => {
    const key = el.dataset.i18n;
    if (selected[key]) el.textContent = selected[key];
  });
  const activePage = document.querySelector(".page.active")?.dataset.page || "map";
  pageTitle.textContent = selected[`${activePage}Title`] || labels[activePage];
}

function text(key) {
  return (copy[languageSelect.value] || copy.en)[key] || copy.en[key] || key;
}

function hasDatabaseSession() {
  if (!supabase) {
    showToast(text("databaseDisabled"));
    return false;
  }
  if (!state.currentUserId) {
    showToast("Unable to establish user session.");
    return false;
  }
  return true;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

function timeAgo(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function severityLabel(level) {
  if (level === "high") return text("highRisk");
  if (level === "medium") return text("mediumRisk");
  return "Low";
}

function severityClass(level) {
  if (level === "high") return "high";
  if (level === "medium") return "medium";
  return "medium";
}

function renderIncidentFeed() {
  if (!state.incidents.length) {
    incidentFeed.innerHTML = `<li class="empty-state">No incidents reported yet.</li>`;
    incidentsTodayCount.textContent = "0";
    alertsBadge.textContent = "0";
    riskPill.textContent = "Risk: Low";
    return;
  }

  incidentFeed.innerHTML = state.incidents
    .map(
      (incident) => `
      <li>
        <span class="danger-tag ${severityClass(incident.severity)}">${escapeHtml(severityLabel(incident.severity))}</span>
        <div>
          <p>${escapeHtml(incident.details)}</p>
          <small>${escapeHtml(incident.location_text || "Unknown")} • ${escapeHtml(timeAgo(incident.created_at))}</small>
        </div>
      </li>`
    )
    .join("");

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = state.incidents.filter((item) =>
    String(item.created_at || "").startsWith(today)
  ).length;
  const highCount = state.incidents.filter((item) => item.severity === "high").length;
  const mediumCount = state.incidents.filter((item) => item.severity === "medium").length;

  incidentsTodayCount.textContent = String(todayCount);
  safeZonesCount.textContent = String(Math.max(1, 8 - highCount));
  patrolUnitsCount.textContent = String(Math.max(2, 4 + mediumCount));
  alertsBadge.textContent = String(state.incidents.length);
  riskPill.textContent =
    highCount > 0 ? "Risk: High" : mediumCount > 0 ? "Risk: Medium" : "Risk: Low";
}

function renderMyReports() {
  if (!state.myReports.length) {
    myReportsList.innerHTML = `<div class="empty-state">No reports submitted yet.</div>`;
    return;
  }

  myReportsList.innerHTML = state.myReports
    .map(
      (report) => `
      <article class="contact-row">
        <div>
          <strong>${escapeHtml(report.incident_type)} • ${escapeHtml(report.severity)}</strong>
          <small>${escapeHtml(report.location_text)} • ${escapeHtml(report.status)} • ${escapeHtml(timeAgo(report.created_at))}</small>
        </div>
        <div class="contact-actions">
          <button class="tiny-btn" data-action="toggle-report-status" data-id="${report.id}" data-status="${report.status}">
            ${report.status === "resolved" ? "Reopen" : "Resolve"}
          </button>
          <button class="tiny-btn" data-action="delete-report" data-id="${report.id}">
            Delete
          </button>
        </div>
      </article>`
    )
    .join("");
}

function renderTrustedContacts() {
  if (!state.contacts.length) {
    trustedContactsList.innerHTML = `<div class="empty-state">No trusted contacts added.</div>`;
    return;
  }

  trustedContactsList.innerHTML = state.contacts
    .map(
      (contact) => `
      <article class="contact-row">
        <div>
          <strong>${escapeHtml(contact.contact_name)}</strong>
          <small>${escapeHtml(contact.phone_number)}${contact.relationship ? ` • ${escapeHtml(contact.relationship)}` : ""}</small>
        </div>
        <div class="contact-actions">
          <button class="tiny-btn" data-action="edit-contact" data-id="${contact.id}">Edit</button>
          <button class="tiny-btn" data-action="delete-contact" data-id="${contact.id}">Delete</button>
        </div>
      </article>`
    )
    .join("");
}

function renderRouteHistory() {
  if (!state.routes.length) {
    routeHistoryList.innerHTML = `<div class="empty-state">No routes saved yet.</div>`;
    return;
  }

  routeHistoryList.innerHTML = state.routes
    .map(
      (route) => `
      <article class="contact-row">
        <div>
          <strong>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)}</strong>
          <small>${escapeHtml(route.route_key)} • ${escapeHtml(route.risk_level)} • ${escapeHtml(route.eta_minutes)} min • ${escapeHtml(timeAgo(route.created_at))}</small>
        </div>
        <div class="contact-actions">
          <button class="tiny-btn" data-action="toggle-route-favorite" data-id="${route.id}" data-favorite="${route.is_favorite}">
            ${route.is_favorite ? "Unfavorite" : "Favorite"}
          </button>
          <button class="tiny-btn" data-action="delete-route" data-id="${route.id}">
            Delete
          </button>
        </div>
      </article>`
    )
    .join("");
}

function renderSimpleProfiles() {
  if (!simpleProfilesList) return;
  if (!state.simpleProfiles.length) {
    simpleProfilesList.innerHTML = `<div class="empty-state">No profiles saved yet.</div>`;
    return;
  }

  simpleProfilesList.innerHTML = state.simpleProfiles
    .map(
      (profile) => `
      <article class="contact-row">
        <div>
          <strong>${escapeHtml(profile.name)}</strong>
          <small>${escapeHtml(profile.email)} • ${escapeHtml(timeAgo(profile.created_at))}</small>
        </div>
      </article>`
    )
    .join("");
}

async function fetchSimpleProfiles() {
  if (!supabase || !state.currentUserId) return;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, created_at")
    .eq("user_id", state.currentUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[profiles] fetch error:", error);
    showToast(error.message);
    return;
  }

  state.simpleProfiles = data || [];
  renderSimpleProfiles();
  console.log("[profiles] fetch success:", state.simpleProfiles);
}

async function saveSimpleProfile(name, email) {
  if (!supabase || !state.currentUserId) return false;
  const payload = {
    user_id: state.currentUserId,
    name: (name || "").trim(),
    email: (email || "").trim(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select("id, name, email, created_at")
    .single();

  if (error) {
    console.error("[profiles] insert error:", error);
    showToast(error.message);
    return false;
  }

  console.log("[profiles] insert success:", data);
  return true;
}

async function fetchIncidentFeed() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("incident_reports")
    .select("id, incident_type, severity, location_text, details, created_at, status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) {
    showToast(error.message);
    return;
  }
  state.incidents = data || [];
  renderIncidentFeed();
}

async function fetchMyReports() {
  if (!supabase || !state.currentUserId) return;
  const { data, error } = await supabase
    .from("incident_reports")
    .select("id, incident_type, severity, location_text, status, created_at")
    .eq("reporter_user_id", state.currentUserId)
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) {
    showToast(error.message);
    return;
  }
  state.myReports = data || [];
  renderMyReports();
}

async function fetchTrustedContacts() {
  if (!supabase || !state.currentUserId) return;
  const { data, error } = await supabase
    .from("trusted_contacts")
    .select("id, contact_name, phone_number, relationship")
    .eq("owner_user_id", state.currentUserId)
    .order("created_at", { ascending: false });
  if (error) {
    showToast(error.message);
    return;
  }
  state.contacts = data || [];
  renderTrustedContacts();
}

async function fetchRouteHistory() {
  if (!supabase || !state.currentUserId) return;
  const { data, error } = await supabase
    .from("route_history")
    .select("id, origin, destination, route_key, risk_level, eta_minutes, is_favorite, created_at")
    .eq("owner_user_id", state.currentUserId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    showToast(error.message);
    return;
  }
  state.routes = data || [];
  renderRouteHistory();
}

async function fetchLastSosEvent() {
  if (!supabase || !state.currentUserId) return;
  const { data, error } = await supabase
    .from("sos_events")
    .select("created_at, trigger_type")
    .eq("user_id", state.currentUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    showToast(error.message);
    return;
  }
  if (!data) {
    lastSosTime.textContent = "No SOS event logged yet.";
    return;
  }
  lastSosTime.textContent = `Last SOS: ${data.trigger_type} • ${timeAgo(data.created_at)}`;
}

async function savePreferences() {
  if (!supabase || !state.currentUserId) return;
  const payload = {
    owner_user_id: state.currentUserId,
    owner_device_id: deviceId,
    language: languageSelect.value,
    theme: themeSelect.value,
    push_alerts: document.getElementById("push-alerts").checked,
    location_sharing: document.getElementById("location-sharing").checked,
    auto_siren: document.getElementById("auto-siren").checked,
    share_route: document.getElementById("share-route").checked,
  };

  const { error } = await supabase.from("user_preferences").upsert(payload, {
    onConflict: "owner_user_id",
  });
  if (error) {
    showToast(error.message);
    return;
  }
  showToast(text("savedPreferences"));
}

async function loadPreferences() {
  if (!supabase || !state.currentUserId) return;
  const { data, error } = await supabase
    .from("user_preferences")
    .select(
      "language, theme, push_alerts, location_sharing, auto_siren, share_route, owner_device_id"
    )
    .eq("owner_user_id", state.currentUserId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    showToast(error.message);
    return;
  }
  if (!data) return;
  languageSelect.value = data.language || "en";
  themeSelect.value = data.theme || "light";
  document.getElementById("push-alerts").checked = Boolean(data.push_alerts);
  document.getElementById("location-sharing").checked = Boolean(data.location_sharing);
  document.getElementById("auto-siren").checked = Boolean(data.auto_siren);
  document.getElementById("share-route").checked = Boolean(data.share_route);
  document.body.classList.toggle("dark", themeSelect.value === "dark");
  applyLanguage(languageSelect.value);
}

async function logSosEvent(triggerType) {
  if (!supabase || !state.currentUserId) return;
  const { error } = await supabase.from("sos_events").insert({
    user_id: state.currentUserId,
    device_id: deviceId,
    trigger_type: triggerType,
    note: "Triggered from app UI",
  });
  if (error) {
    showToast(error.message);
    return;
  }
  await fetchLastSosEvent();
}

function setProfileDisplayName(name) {
  const fallback = "Community Member";
  const trimmed = (name || "").trim();
  state.currentProfileName = trimmed || fallback;
  if (profileDisplayName) {
    profileDisplayName.textContent = state.currentProfileName;
  }
  if (profileNameInput && !profileNameInput.value) {
    profileNameInput.value = state.currentProfileName;
  }
}

function showProfileEditor() {
  if (!profileEditorCard || !profileNameInput) return;
  profileNameInput.value = state.currentProfileName;
  profileEditorCard.classList.remove("hidden");
  profileNameInput.focus();
}

function hideProfileEditor() {
  if (!profileEditorCard) return;
  profileEditorCard.classList.add("hidden");
}

async function loadUserProfile() {
  if (!supabase || !state.currentUserId) return;
  const { data, error } = await supabase
    .from("user_profiles")
    .select("display_name")
    .eq("user_id", state.currentUserId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    if (error.code === "42P01") {
      showToast(text("profileSchemaMissing"));
      return;
    }
    showToast(error.message);
    return;
  }

  setProfileDisplayName(data?.display_name || state.currentProfileName);
}

async function saveUserProfileName(name) {
  if (!supabase || !state.currentUserId) return false;
  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    showToast(text("profileNameRequired"));
    return false;
  }

  const payload = {
    user_id: state.currentUserId,
    display_name: trimmedName,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("user_profiles").upsert(payload, {
    onConflict: "user_id",
  });

  if (error) {
    if (error.code === "42P01") {
      showToast(text("profileSchemaMissing"));
      return false;
    }
    showToast(error.message);
    return false;
  }

  setProfileDisplayName(trimmedName);
  showToast(text("profileSaved"));
  return true;
}

navItems.forEach((item) => {
  item.addEventListener("click", () => switchPage(item.dataset.target));
});

document.querySelectorAll("#incident-chip-row .chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll("#incident-chip-row .chip")
      .forEach((other) => other.classList.toggle("active", other === chip));
    state.selectedIncidentType = chip.dataset.type;
  });
});

document.querySelectorAll("#route-options .route-option").forEach((option) => {
  option.addEventListener("click", () => {
    document
      .querySelectorAll("#route-options .route-option")
      .forEach((other) => other.classList.toggle("active", other === option));
    state.selectedRouteKey = option.dataset.routeKey;
  });
});

document.getElementById("report-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!hasDatabaseSession()) {
    return;
  }
  (async () => {
    const payload = {
      reporter_user_id: state.currentUserId,
      incident_type: state.selectedIncidentType,
      severity: document.getElementById("report-severity").value,
      location_text: document.getElementById("report-location").value.trim(),
      details: document.getElementById("report-details").value.trim(),
      is_anonymous: document.getElementById("report-anonymous").checked,
      reporter_device_id: deviceId,
      status: "active",
    };
    const { error } = await supabase.from("incident_reports").insert(payload);
    if (error) {
      showToast(error.message);
      return;
    }
    event.target.reset();
    document
      .querySelectorAll("#incident-chip-row .chip")
      .forEach((chip, idx) => chip.classList.toggle("active", idx === 0));
    state.selectedIncidentType = "crime";
    await Promise.all([fetchIncidentFeed(), fetchMyReports()]);
    showToast(text("reportSent"));
  })();
});

document.getElementById("route-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!hasDatabaseSession()) {
    return;
  }
  (async () => {
    const routeA = { eta: 14, risk: "low" };
    const routeB = { eta: 11, risk: "medium" };
    const routeMeta = state.selectedRouteKey === "B" ? routeB : routeA;
    const { error } = await supabase.from("route_history").insert({
      owner_user_id: state.currentUserId,
      owner_device_id: deviceId,
      origin: document.getElementById("origin").value.trim(),
      destination: document.getElementById("destination").value.trim(),
      route_key: state.selectedRouteKey,
      risk_level: routeMeta.risk,
      eta_minutes: routeMeta.eta,
      options: {
        well_lit: document.querySelectorAll("#route-form fieldset input")[0].checked,
        avoid_isolated: document.querySelectorAll("#route-form fieldset input")[1].checked,
        avoid_traffic: document.querySelectorAll("#route-form fieldset input")[2].checked,
      },
    });
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchRouteHistory();
    showToast(text("routeSaved"));
  })();
});

document
  .querySelector("[data-action='share-location']")
  .addEventListener("click", () =>
    showToast((copy[languageSelect.value] || copy.en).locationShared)
  );

document
  .querySelector("[data-action='broadcast-sos']")
  .addEventListener("click", async () => {
    showToast(text("sosBroadcasted"));
    await logSosEvent("broadcast");
  });

document
  .querySelector("[data-action='silent-sos']")
  .addEventListener("click", async () => {
    showToast(text("sosBroadcasted"));
    await logSosEvent("silent");
  });

document
  .querySelector("[data-action='alerts-center']")
  .addEventListener("click", () => showToast((copy[languageSelect.value] || copy.en).nearbyAlerts));

document
  .querySelector("[data-action='upload-proof']")
  .addEventListener("click", () =>
    showToast((copy[languageSelect.value] || copy.en).uploadProof)
  );

document.getElementById("refresh-my-reports").addEventListener("click", fetchMyReports);
document.getElementById("refresh-routes").addEventListener("click", fetchRouteHistory);
document.getElementById("save-preferences-btn").addEventListener("click", savePreferences);

if (simpleProfileForm) {
  simpleProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabase) {
      showToast(text("databaseDisabled"));
      return;
    }

    const name = simpleProfileNameInput.value;
    const email = simpleProfileEmailInput.value;
    const saved = await saveSimpleProfile(name, email);
    if (!saved) return;

    simpleProfileForm.reset();
    await fetchSimpleProfiles();
    showToast("Profile saved.");
  });
}

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {
    showProfileEditor();
  });
}

if (cancelProfileEditBtn) {
  cancelProfileEditBtn.addEventListener("click", () => {
    hideProfileEditor();
  });
}

if (profileForm) {
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!hasDatabaseSession()) {
      return;
    }
    const wasSaved = await saveUserProfileName(profileNameInput.value);
    if (wasSaved) {
      hideProfileEditor();
    }
  });
}

myReportsList.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  if (!id || !supabase) return;

  if (target.dataset.action === "toggle-report-status") {
    const nextStatus = target.dataset.status === "resolved" ? "active" : "resolved";
    const { error } = await supabase
      .from("incident_reports")
      .update({ status: nextStatus })
      .eq("id", id)
      .eq("reporter_user_id", state.currentUserId);
    if (error) {
      showToast(error.message);
      return;
    }
    await Promise.all([fetchIncidentFeed(), fetchMyReports()]);
    showToast(text("reportUpdated"));
  }

  if (target.dataset.action === "delete-report") {
    const { error } = await supabase
      .from("incident_reports")
      .delete()
      .eq("id", id)
      .eq("reporter_user_id", state.currentUserId);
    if (error) {
      showToast(error.message);
      return;
    }
    await Promise.all([fetchIncidentFeed(), fetchMyReports()]);
    showToast(text("reportDeleted"));
  }
});

trustedContactsList.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  if (!id || !supabase) return;

  if (target.dataset.action === "delete-contact") {
    const { error } = await supabase
      .from("trusted_contacts")
      .delete()
      .eq("id", id)
      .eq("owner_user_id", state.currentUserId);
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchTrustedContacts();
    showToast(text("contactDeleted"));
  }

  if (target.dataset.action === "edit-contact") {
    const current = state.contacts.find((contact) => contact.id === id);
    if (!current) return;
    const contactName = window.prompt("Contact name", current.contact_name);
    if (!contactName) return;
    const phoneNumber = window.prompt("Phone number", current.phone_number);
    if (!phoneNumber) return;
    const relationship = window.prompt("Relationship", current.relationship || "") || null;
    const { error } = await supabase
      .from("trusted_contacts")
      .update({ contact_name: contactName, phone_number: phoneNumber, relationship })
      .eq("id", id)
      .eq("owner_user_id", state.currentUserId);
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchTrustedContacts();
    showToast(text("contactSaved"));
  }
});

routeHistoryList.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  if (!id || !supabase) return;

  if (target.dataset.action === "delete-route") {
    const { error } = await supabase
      .from("route_history")
      .delete()
      .eq("id", id)
      .eq("owner_user_id", state.currentUserId);
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchRouteHistory();
    showToast(text("routeDeleted"));
  }

  if (target.dataset.action === "toggle-route-favorite") {
    const nextFavorite = target.dataset.favorite !== "true";
    const { error } = await supabase
      .from("route_history")
      .update({ is_favorite: nextFavorite })
      .eq("id", id)
      .eq("owner_user_id", state.currentUserId);
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchRouteHistory();
    showToast(text("routeUpdated"));
  }
});

trustedContactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!hasDatabaseSession()) {
    return;
  }
  const payload = {
    owner_user_id: state.currentUserId,
    owner_device_id: deviceId,
    contact_name: document.getElementById("contact-name").value.trim(),
    phone_number: document.getElementById("contact-phone").value.trim(),
    relationship: document.getElementById("contact-relationship").value.trim() || null,
  };
  const { error } = await supabase.from("trusted_contacts").insert(payload);
  if (error) {
    showToast(error.message);
    return;
  }
  trustedContactForm.reset();
  await fetchTrustedContacts();
  showToast(text("contactSaved"));
});

themeSelect.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeSelect.value === "dark");
});

languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
});

async function initApp() {
  applyLanguage("en");
  setProfileDisplayName(state.currentProfileName);
  renderSimpleProfiles();
  if (!isSupabaseConfigured) {
    renderIncidentFeed();
    renderMyReports();
    renderTrustedContacts();
    renderRouteHistory();
    showToast(text("databaseDisabled"));
    return;
  }

  try {
    const user = await ensureAnonymousSession();
    state.currentUserId = user?.id || null;
  } catch (error) {
    showToast(error.message || "Unable to start secure session.");
    return;
  }

  if (!state.currentUserId) {
    showToast("Unable to establish user session.");
    return;
  }

  await Promise.all([
    loadPreferences(),
    loadUserProfile(),
    fetchSimpleProfiles(),
    fetchIncidentFeed(),
    fetchMyReports(),
    fetchTrustedContacts(),
    fetchRouteHistory(),
    fetchLastSosEvent(),
  ]);

  supabase
    .channel("incidents-live-feed")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "incident_reports" },
      () => {
        fetchIncidentFeed();
      }
    )
    .subscribe();
}

initApp();
