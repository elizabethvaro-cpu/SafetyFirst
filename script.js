import {
  supabase,
  deviceId,
  isSupabaseConfigured,
  ensureAnonymousSession,
} from "./supabaseClient.js";
import L from "leaflet";
import Supercluster from "supercluster";

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
const simpleProfilesList = document.getElementById("simple-profiles-list");
const mapContainer = document.getElementById("live-map");
const mapIncidentsSummary = document.getElementById("map-incidents-summary");
const mapCriticalCount = document.getElementById("map-critical-count");
const mapHighCount = document.getElementById("map-high-count");
const mapMediumCount = document.getElementById("map-medium-count");
const mapFloatingTotal = document.getElementById("map-floating-total");
const geoPermissionStatus = document.getElementById("geo-permission-status");
const mapDetailsSheet = document.getElementById("map-details-sheet");
const mapSheetTotal = document.getElementById("map-sheet-total");
const mapSheetTypes = document.getElementById("map-sheet-types");
const mapSheetSeverity = document.getElementById("map-sheet-severity");
const mapSheetLatest = document.getElementById("map-sheet-latest");
const mapSelectedIncidents = document.getElementById("map-selected-incidents");
const mapFilterTime = document.getElementById("map-filter-time");
const mapFilterType = document.getElementById("map-filter-type");
const mapFilterSeverity = document.getElementById("map-filter-severity");
const mapFilterBtn = document.getElementById("map-filter-btn");
const mapAlertsBtn = document.getElementById("map-alerts-btn");

const MAP_DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };
const MAP_SEARCH_RADIUS_METERS = 1207;
const MAP_TIME_RANGE_TO_HOURS = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

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
  map: {
    instance: null,
    userMarker: null,
    selectedMarker: null,
    radiusCircle: null,
    clusterLayer: null,
    selectedLatLng: null,
    userLatLng: null,
    nearbyIncidents: [],
    clusterIndex: null,
    schemaHasCoordinates: true,
    filters: {
      timeRange: "7d",
      type: "all",
      severity: "all",
    },
    refreshTimeout: null,
  },
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
  if (level === "critical") return "Critical";
  if (level === "high") return text("highRisk");
  if (level === "medium") return text("mediumRisk");
  return "Low";
}

function severityClass(level) {
  if (level === "critical") return "critical";
  if (level === "high") return "high";
  if (level === "medium") return "medium";
  return "medium";
}

function hashString(value) {
  const textValue = String(value || "");
  let hash = 0;
  for (let i = 0; i < textValue.length; i += 1) {
    hash = (hash << 5) - hash + textValue.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function deriveCoordinatesFromSeed(seed) {
  const hash = hashString(seed || "safe-steps");
  const latOffset = ((hash % 2000) / 2000 - 0.5) * 0.32;
  const lngOffset = (((Math.floor(hash / 2000) % 2000) / 2000) - 0.5) * 0.42;
  return {
    lat: MAP_DEFAULT_CENTER.lat + latOffset,
    lng: MAP_DEFAULT_CENTER.lng + lngOffset,
    inferred: true,
  };
}

function normalizeIncident(record) {
  const normalized = { ...(record || {}) };
  const lat = Number(normalized.incident_lat);
  const lng = Number(normalized.incident_lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    normalized.mapLat = lat;
    normalized.mapLng = lng;
    normalized.hasExactCoordinates = true;
    return normalized;
  }
  const fallback = deriveCoordinatesFromSeed(
    normalized.location_text || normalized.details || normalized.id
  );
  normalized.mapLat = fallback.lat;
  normalized.mapLng = fallback.lng;
  normalized.hasExactCoordinates = false;
  return normalized;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  const radius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

function formatTimestamp(input) {
  if (!input) return "n/a";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "n/a";
  return date.toLocaleString();
}

function toIsoUtcDateTime(date) {
  return date.toISOString();
}

function setMapStatus(message) {
  if (geoPermissionStatus) {
    geoPermissionStatus.textContent = message;
  }
}

function updateMapSummary(incidents = []) {
  const criticalCount = incidents.filter((item) => item.severity === "critical").length;
  const highCount = incidents.filter((item) => item.severity === "high").length;
  const mediumCount = incidents.filter((item) => item.severity === "medium").length;
  if (mapCriticalCount) mapCriticalCount.textContent = String(criticalCount);
  if (mapHighCount) mapHighCount.textContent = String(highCount);
  if (mapMediumCount) mapMediumCount.textContent = String(mediumCount);
  if (mapFloatingTotal) mapFloatingTotal.textContent = String(incidents.length);
  if (mapIncidentsSummary) mapIncidentsSummary.textContent = `${incidents.length} incidents nearby`;
  if (alertsBadge) alertsBadge.textContent = String(incidents.length);
}

function renderIncidentFeed() {
  if (!state.incidents.length) {
    incidentFeed.innerHTML = `<li class="empty-state">No incidents reported yet.</li>`;
    updateMapSummary([]);
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

  updateMapSummary(state.incidents);
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
  const baseColumns = "id, incident_type, severity, location_text, details, created_at, status";
  const selectedColumns = state.map.schemaHasCoordinates
    ? `${baseColumns}, incident_lat, incident_lng`
    : baseColumns;
  const { data, error } = await supabase
    .from("incident_reports")
    .select(selectedColumns)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    const missingCoordinateColumn =
      state.map.schemaHasCoordinates &&
      /(incident_lat|incident_lng|column)/i.test(`${error.message} ${error.details || ""}`);
    if (missingCoordinateColumn) {
      state.map.schemaHasCoordinates = false;
      await fetchIncidentFeed();
      return;
    }
    showToast(error.message);
    return;
  }
  state.incidents = (data || []).map(normalizeIncident);
  renderIncidentFeed();
  refreshMapDataFromIncidents();
}

function getIncidentCutoffDate() {
  const hours = MAP_TIME_RANGE_TO_HOURS[state.map.filters.timeRange] || MAP_TIME_RANGE_TO_HOURS["7d"];
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function filterIncidentForMap(incident) {
  if (!incident || incident.status !== "active") return false;
  const incidentDate = new Date(incident.created_at);
  if (!Number.isNaN(incidentDate.getTime()) && incidentDate < getIncidentCutoffDate()) {
    return false;
  }
  if (state.map.filters.type !== "all" && incident.incident_type !== state.map.filters.type) {
    return false;
  }
  if (state.map.filters.severity !== "all" && incident.severity !== state.map.filters.severity) {
    return false;
  }
  return true;
}

function getFilteredMapIncidents() {
  return state.incidents.filter(filterIncidentForMap);
}

function getIncidentsWithinRadius(centerLatLng, incidents) {
  if (!centerLatLng) return [];
  return incidents
    .filter((incident) => Number.isFinite(incident.mapLat) && Number.isFinite(incident.mapLng))
    .map((incident) => ({
      ...incident,
      distance_meters: distanceMeters(
        centerLatLng.lat,
        centerLatLng.lng,
        incident.mapLat,
        incident.mapLng
      ),
    }))
    .filter((incident) => incident.distance_meters <= MAP_SEARCH_RADIUS_METERS)
    .sort((a, b) => a.distance_meters - b.distance_meters);
}

function buildSuperclusterIndex(incidents) {
  const points = incidents
    .filter((incident) => Number.isFinite(incident.mapLat) && Number.isFinite(incident.mapLng))
    .map((incident) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [incident.mapLng, incident.mapLat],
      },
      properties: {
        incidentId: incident.id,
      },
    }));

  const index = new Supercluster({
    radius: 44,
    maxZoom: 19,
    minPoints: 2,
  });
  index.load(points);
  state.map.clusterIndex = index;
}

function markerIconForSeverity(severity) {
  const className = severityClass(severity);
  return L.divIcon({
    className: "map-incident-pin-wrap",
    html: `<span class="map-incident-pin ${className}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function clusterIcon(count) {
  return L.divIcon({
    className: "map-cluster-pin-wrap",
    html: `<span class="map-cluster-pin">${count}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function renderClustersForViewport() {
  const mapInstance = state.map.instance;
  if (!mapInstance || !state.map.clusterLayer || !state.map.clusterIndex) return;
  state.map.clusterLayer.clearLayers();

  const bounds = mapInstance.getBounds();
  const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
  const zoom = Math.round(mapInstance.getZoom());
  const clusters = state.map.clusterIndex.getClusters(bbox, zoom);

  clusters.forEach((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const props = feature.properties || {};
    if (props.cluster) {
      const marker = L.marker([lat, lng], {
        icon: clusterIcon(props.point_count || 0),
      });
      marker.on("click", () => {
        const expansionZoom = state.map.clusterIndex.getClusterExpansionZoom(props.cluster_id);
        mapInstance.flyTo([lat, lng], Math.min(expansionZoom, 18), { duration: 0.35 });
      });
      marker.addTo(state.map.clusterLayer);
      return;
    }

    const incident = state.incidents.find((item) => item.id === props.incidentId);
    if (!incident) return;
    const marker = L.marker([lat, lng], {
      icon: markerIconForSeverity(incident.severity),
    });
    marker.on("click", () => {
      marker
        .bindPopup(
          `<strong>${escapeHtml(incident.incident_type || "incident")}</strong><br>${escapeHtml(
            incident.details || "No details"
          )}<br><small>${escapeHtml(incident.location_text || "Unknown")} • ${escapeHtml(
            timeAgo(incident.created_at)
          )}</small>`
        )
        .openPopup();
      selectMapLocation({ lat, lng }, { fromMarker: true });
    });
    marker.addTo(state.map.clusterLayer);
  });
}

function renderMapDetailsSheet(incidents) {
  if (!mapDetailsSheet) return;
  mapDetailsSheet.classList.remove("hidden");
  const total = incidents.length;
  if (mapSheetTotal) mapSheetTotal.textContent = String(total);

  if (!total) {
    if (mapSheetTypes) mapSheetTypes.textContent = "Types: none";
    if (mapSheetSeverity) mapSheetSeverity.textContent = "Severity: none";
    if (mapSheetLatest) mapSheetLatest.textContent = "Latest report: n/a";
    if (mapSelectedIncidents) {
      mapSelectedIncidents.innerHTML = `<div class="empty-state">No incidents found in this radius.</div>`;
    }
    return;
  }

  const types = {};
  const severities = {};
  let latestAt = incidents[0]?.created_at || null;
  incidents.forEach((incident) => {
    types[incident.incident_type] = (types[incident.incident_type] || 0) + 1;
    severities[incident.severity] = (severities[incident.severity] || 0) + 1;
    if ((incident.created_at || "") > (latestAt || "")) {
      latestAt = incident.created_at;
    }
  });
  if (mapSheetTypes) {
    mapSheetTypes.textContent = `Types: ${Object.entries(types)
      .map(([key, count]) => `${key} (${count})`)
      .join(", ")}`;
  }
  if (mapSheetSeverity) {
    mapSheetSeverity.textContent = `Severity: ${Object.entries(severities)
      .map(([key, count]) => `${key} (${count})`)
      .join(", ")}`;
  }
  if (mapSheetLatest) mapSheetLatest.textContent = `Latest report: ${formatTimestamp(latestAt)}`;
  if (mapSelectedIncidents) {
    mapSelectedIncidents.innerHTML = incidents
      .slice(0, 6)
      .map(
        (incident) => `
          <article class="map-incident-detail">
            <h4>${escapeHtml(incident.incident_type || "Incident")} • ${escapeHtml(
              severityLabel(incident.severity)
            )}</h4>
            <p>${escapeHtml(incident.details || "No details")}</p>
            <p>${escapeHtml(incident.location_text || "Unknown location")} • ${escapeHtml(
              timeAgo(incident.created_at)
            )}</p>
          </article>`
      )
      .join("");
  }
}

function updateSelectionLayers(latlng) {
  if (!state.map.instance) return;
  if (!state.map.selectedMarker) {
    state.map.selectedMarker = L.circleMarker(latlng, {
      radius: 7,
      color: "#ef4444",
      weight: 2,
      fillColor: "#ef4444",
      fillOpacity: 0.35,
    }).addTo(state.map.instance);
  } else {
    state.map.selectedMarker.setLatLng(latlng);
  }

  if (!state.map.radiusCircle) {
    state.map.radiusCircle = L.circle(latlng, {
      radius: MAP_SEARCH_RADIUS_METERS,
      color: "#ef4444",
      weight: 1,
      fillColor: "#ef4444",
      fillOpacity: 0.1,
    }).addTo(state.map.instance);
  } else {
    state.map.radiusCircle.setLatLng(latlng);
    state.map.radiusCircle.setRadius(MAP_SEARCH_RADIUS_METERS);
  }
}

function selectMapLocation(latlng, options = {}) {
  state.map.selectedLatLng = latlng;
  updateSelectionLayers(latlng);
  if (!options.fromMarker && state.map.instance) {
    state.map.instance.panTo(latlng, { animate: true, duration: 0.25 });
  }
  const nearby = getIncidentsWithinRadius(latlng, getFilteredMapIncidents());
  state.map.nearbyIncidents = nearby;
  updateMapSummary(nearby.length ? nearby : getFilteredMapIncidents());
  renderMapDetailsSheet(nearby);
}

function refreshMapDataFromIncidents() {
  const filtered = getFilteredMapIncidents();
  buildSuperclusterIndex(filtered);
  renderClustersForViewport();
  if (state.map.selectedLatLng) {
    const nearby = getIncidentsWithinRadius(state.map.selectedLatLng, filtered);
    state.map.nearbyIncidents = nearby;
    updateMapSummary(nearby.length ? nearby : filtered);
    renderMapDetailsSheet(nearby);
    return;
  }
  updateMapSummary(filtered);
}

function scheduleMapRefresh(delayMs = 80) {
  if (state.map.refreshTimeout) {
    window.clearTimeout(state.map.refreshTimeout);
  }
  state.map.refreshTimeout = window.setTimeout(() => {
    state.map.refreshTimeout = null;
    fetchIncidentFeed();
  }, delayMs);
}

function setMapFiltersFromInputs() {
  state.map.filters.timeRange = mapFilterTime?.value || "7d";
  state.map.filters.type = mapFilterType?.value || "all";
  state.map.filters.severity = mapFilterSeverity?.value || "all";
}

function bindMapUiEvents() {
  [mapFilterTime, mapFilterType, mapFilterSeverity].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", () => {
      setMapFiltersFromInputs();
      refreshMapDataFromIncidents();
    });
  });

  if (mapFilterBtn) {
    mapFilterBtn.addEventListener("click", () => {
      if (!mapDetailsSheet) return;
      mapDetailsSheet.classList.toggle("hidden");
    });
  }

  if (mapAlertsBtn) {
    mapAlertsBtn.addEventListener("click", () => {
      if (!mapDetailsSheet) return;
      mapDetailsSheet.classList.remove("hidden");
      if (!state.map.selectedLatLng && state.map.instance) {
        selectMapLocation(state.map.instance.getCenter());
      }
    });
  }
}

function initializeMap() {
  if (!mapContainer || state.map.instance) return;
  const mapInstance = L.map(mapContainer, {
    zoomControl: false,
    attributionControl: false,
  }).setView([MAP_DEFAULT_CENTER.lat, MAP_DEFAULT_CENTER.lng], 12);
  state.map.instance = mapInstance;
  state.map.clusterLayer = L.layerGroup().addTo(mapInstance);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(mapInstance);
  mapInstance.on("click", (event) => {
    selectMapLocation(event.latlng);
  });
  mapInstance.on("moveend zoomend", () => {
    renderClustersForViewport();
  });
  bindMapUiEvents();
  setTimeout(() => mapInstance.invalidateSize(), 0);

  if (!navigator.geolocation) {
    if (geoPermissionStatus) geoPermissionStatus.textContent = "Geolocation is not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latlng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      state.map.userLatLng = latlng;
      if (!state.map.userMarker) {
        state.map.userMarker = L.circleMarker(latlng, {
          radius: 6,
          color: "#2563eb",
          fillColor: "#2563eb",
          fillOpacity: 0.8,
          weight: 2,
        }).addTo(mapInstance);
      } else {
        state.map.userMarker.setLatLng(latlng);
      }
      mapInstance.setView([latlng.lat, latlng.lng], 13);
      if (geoPermissionStatus) geoPermissionStatus.textContent = "Location active.";
    },
    (error) => {
      const message =
        error.code === 1
          ? "Location permission denied"
          : error.code === 2
            ? "Location unavailable"
            : "Location request timed out";
      if (geoPermissionStatus) geoPermissionStatus.textContent = message;
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000,
    }
  );
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
  ?.addEventListener("click", () =>
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
  initializeMap();
  if (!isSupabaseConfigured) {
    renderIncidentFeed();
    renderMyReports();
    renderTrustedContacts();
    renderRouteHistory();
    refreshMapDataFromIncidents();
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
        scheduleMapRefresh();
      }
    )
    .subscribe();
}

initApp();
