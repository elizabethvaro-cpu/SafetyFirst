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
const gpsMapContainer = document.getElementById("gps-live-map");
const gpsMapHint = document.getElementById("gps-map-hint");
const communityRouteForm = document.getElementById("community-route-form");
const communityRouteList = document.getElementById("community-route-list");
const routeOptionsContainer = document.getElementById("route-options");
const routeForm = document.getElementById("route-form");
const routeOriginInput = document.getElementById("origin");
const routeDestinationInput = document.getElementById("destination");
const routePreferenceInputs = [...document.querySelectorAll("#route-form fieldset input")];
const communityRouteStartInput = document.getElementById("community-route-start");
const communityRouteDestinationInput = document.getElementById("community-route-destination");
const communityRouteNotesInput = document.getElementById("community-route-notes");
const communityRouteSafetyLevelInput = document.getElementById("community-route-safety-level");
const communityRouteRatingInput = document.getElementById("community-route-rating");
const communityRouteTagsInput = document.getElementById("community-route-tags");

const MAP_DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };
const MAP_SEARCH_RADIUS_METERS = 1207;
const MAP_TIME_RANGE_TO_HOURS = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};
const GPS_ROUTE_SAMPLE_POINTS = 24;
const GPS_INCIDENT_PROXIMITY_METERS = 260;
const GPS_DANGER_MARKER_LIMIT = 150;
const GPS_NEARBY_FALLBACK_MIN_METERS = 320;
const GPS_NEARBY_FALLBACK_MAX_METERS = 2300;
const GPS_MAX_VISIBLE_DIRECTIONS = 8;
const GPS_OSRM_BASE_URL = "https://router.project-osrm.org";
const GPS_OSRM_TIMEOUT_MS = 4500;
const GPS_REVERSE_GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse";
const GPS_REVERSE_GEOCODE_TIMEOUT_MS = 3500;

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
  routeHistoryRatings: {},
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
  gps: {
    map: null,
    userLatLng: null,
    fromLatLng: null,
    toLatLng: null,
    userMarker: null,
    fromMarker: null,
    toMarker: null,
    dangerMarkersLayer: null,
    routePolylinesLayer: null,
    communityRoutes: [],
    routeChoices: [],
    routeRatings: {},
    activeRouteId: null,
    currentRouteRiskLevel: null,
    schemaHasCommunityTables: true,
    schemaHasRouteFeedbackTable: true,
    clickStage: "from",
    uiEventsBound: false,
    routeRealtimeChannel: null,
    communityRealtimeChannel: null,
    feedbackRealtimeChannel: null,
    userPositionWatchId: null,
    routeRequestToken: 0,
    placeNameCache: {},
    reverseLookupTokens: {
      from: 0,
      to: 0,
    },
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

function invalidateMapLayout(mapInstance) {
  if (!mapInstance) return;
  requestAnimationFrame(() => {
    mapInstance.invalidateSize();
    setTimeout(() => mapInstance.invalidateSize(), 120);
  });
}

function refreshActivePageMap(targetPage) {
  if (targetPage === "map") {
    invalidateMapLayout(state.map.instance);
  }
  if (targetPage === "gps") {
    invalidateMapLayout(state.gps.map);
  }
}

function switchPage(target) {
  pages.forEach((page) => page.classList.toggle("active", page.dataset.page === target));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.target === target));
  pageTitle.textContent = (copy[languageSelect.value] || copy.en)[`${target}Title`] || labels[target];
  refreshActivePageMap(target);
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

function getRatingButtonState(score, selectedRating) {
  const normalizedScore = Number(score);
  const normalizedSelected = Number(selectedRating) || 0;
  const isFilled = normalizedSelected > 0 && normalizedScore <= normalizedSelected;
  const isSelected = normalizedSelected > 0 && normalizedScore === normalizedSelected;
  return {
    classes: [isFilled ? "is-filled" : "", isSelected ? "is-selected" : ""].filter(Boolean).join(" "),
    ariaPressed: isSelected ? "true" : "false",
  };
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

function deriveNearbyCoordinatesFromSeed(seed, anchorPoint) {
  if (!anchorPoint || !Number.isFinite(anchorPoint.lat) || !Number.isFinite(anchorPoint.lng)) {
    return deriveCoordinatesFromSeed(seed);
  }
  const hash = hashString(seed || "nearby-point");
  const radiusMeters =
    GPS_NEARBY_FALLBACK_MIN_METERS +
    (hash % (GPS_NEARBY_FALLBACK_MAX_METERS - GPS_NEARBY_FALLBACK_MIN_METERS + 1));
  const bearingRadians = (((Math.floor(hash / 700) % 360) * Math.PI) / 180);
  const latOffset = (radiusMeters * Math.cos(bearingRadians)) / 111111;
  const lngDivisor = Math.max(0.2, Math.cos(toRadians(anchorPoint.lat)));
  const lngOffset = (radiusMeters * Math.sin(bearingRadians)) / (111111 * lngDivisor);
  return {
    lat: anchorPoint.lat + latOffset,
    lng: anchorPoint.lng + lngOffset,
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
      (route) => {
        const selectedRating = Number(state.routeHistoryRatings[route.id] || 0);
        return `
          <article class="contact-row">
            <div>
              <strong>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)}</strong>
              <small>${escapeHtml(route.route_key)} • ${escapeHtml(route.risk_level)} • ${escapeHtml(route.eta_minutes)} min • ${escapeHtml(timeAgo(route.created_at))}</small>
              <small class="route-feedback-note">Rate this suggested route:</small>
              <div class="gps-route-rate">
                ${[1, 2, 3, 4, 5]
                  .map((score) => {
                    const ratingState = getRatingButtonState(score, selectedRating);
                    return `
                      <button
                        class="gps-rate-btn ${ratingState.classes}"
                        data-action="rate-route"
                        data-id="${route.id}"
                        data-rating="${score}"
                        aria-pressed="${ratingState.ariaPressed}">
                        ${score}
                      </button>`;
                  })
                  .join("")}
              </div>
            </div>
            <div class="contact-actions">
              <button class="tiny-btn" data-action="toggle-route-favorite" data-id="${route.id}" data-favorite="${route.is_favorite}">
                ${route.is_favorite ? "Unfavorite" : "Favorite"}
              </button>
              <button class="tiny-btn" data-action="delete-route" data-id="${route.id}">
                Delete
              </button>
            </div>
          </article>`;
      }
    )
    .join("");
}

function renderCommunityRoutes() {
  if (!communityRouteList) return;
  if (!state.gps.communityRoutes.length) {
    communityRouteList.innerHTML = `<div class="empty-state">No community routes submitted yet.</div>`;
    return;
  }

  communityRouteList.innerHTML = state.gps.communityRoutes
    .slice(0, 8)
    .map((route) => {
      const tags = Array.isArray(route.tags) ? route.tags : [];
      return `
        <article class="community-route-item">
          <strong>${escapeHtml(route.start_location)} → ${escapeHtml(route.destination_location)}</strong>
          <p>${escapeHtml(route.safety_level)} risk • Rating ${escapeHtml(String(route.safety_rating || 0))}/5 • ${escapeHtml(timeAgo(route.created_at))}</p>
          <p>${escapeHtml(route.route_notes || "No additional notes.")}</p>
          <div class="community-route-tags">
            ${tags.map((tag) => `<span class="community-route-tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="contact-actions" style="margin-top:0.45rem;">
            <button class="tiny-btn" data-action="use-community-route" data-id="${route.id}">Use Route</button>
          </div>
        </article>`;
    })
    .join("");
}

function parseTagsInput(value) {
  if (!value) return [];
  const parts = String(value)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(parts)];
}

function normalizeCommunityRoute(record) {
  return {
    id: record.id,
    start_location: record.start_location || "",
    destination_location: record.destination_location || "",
    route_notes: record.route_notes || "",
    safety_level: record.safety_level || "medium",
    safety_rating: Number(record.safety_rating) || 3,
    tags: Array.isArray(record.tags) ? record.tags : [],
    created_at: record.created_at || new Date().toISOString(),
    start_lat: Number(record.start_lat),
    start_lng: Number(record.start_lng),
    destination_lat: Number(record.destination_lat),
    destination_lng: Number(record.destination_lng),
  };
}

function safeSetLatLng(layer, latlng) {
  if (!layer || !latlng) return;
  if (typeof layer.setLatLng === "function") {
    layer.setLatLng(latlng);
  }
}

function mapGpsRiskLabel(riskLevel) {
  if (riskLevel === "low") return "Low Risk";
  if (riskLevel === "high") return "High Risk";
  return "Medium Risk";
}

function mapGpsRiskClass(riskLevel) {
  if (riskLevel === "low") return "low-risk";
  if (riskLevel === "high") return "high-risk";
  return "medium-risk";
}

function mapGpsRouteColor(riskLevel) {
  if (riskLevel === "low") return "#16a34a";
  if (riskLevel === "high") return "#dc2626";
  return "#eab308";
}

function formatGpsLatLng(latlng) {
  if (!latlng) return "";
  return `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
}

function normalizeStreetLabelFromAddress(address) {
  if (!address || typeof address !== "object") return "";
  const road = address.road || address.pedestrian || address.footway || address.cycleway;
  const number = address.house_number;
  const area =
    address.neighbourhood ||
    address.suburb ||
    address.city_district ||
    address.city ||
    address.town ||
    address.village;
  const firstPart = [number, road].filter(Boolean).join(" ").trim() || road || "";
  if (firstPart && area) return `${firstPart}, ${area}`;
  return firstPart || area || "";
}

async function fetchStreetNameForLatLng(latlng) {
  if (!latlng) return "";
  const cacheKey = `${latlng.lat.toFixed(4)},${latlng.lng.toFixed(4)}`;
  if (state.gps.placeNameCache[cacheKey]) return state.gps.placeNameCache[cacheKey];

  const query = new URLSearchParams({
    format: "jsonv2",
    lat: String(latlng.lat),
    lon: String(latlng.lng),
    zoom: "18",
    addressdetails: "1",
  });
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), GPS_REVERSE_GEOCODE_TIMEOUT_MS);
  try {
    const response = await fetch(`${GPS_REVERSE_GEOCODE_URL}?${query.toString()}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) return "";
    const payload = await response.json();
    const normalized =
      normalizeStreetLabelFromAddress(payload?.address) ||
      String(payload?.display_name || "")
        .split(",")
        .slice(0, 2)
        .join(", ")
        .trim();
    if (!normalized) return "";
    state.gps.placeNameCache[cacheKey] = normalized;
    return normalized;
  } catch {
    return "";
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function setGpsInputStreetName(latlng, pointType, options = {}) {
  const inputEl = pointType === "from" ? routeOriginInput : routeDestinationInput;
  if (!inputEl || !latlng) return;
  const preserveExistingName = Boolean(options.preserveExistingName);
  const existingValue = inputEl.value.trim();
  const existingIsCoordinates = Boolean(parseGpsCoordinates(existingValue));
  if (preserveExistingName && existingValue && !existingIsCoordinates) {
    return;
  }

  const fallbackLabel = pointType === "from" ? "Current street" : "Destination street";
  inputEl.value = fallbackLabel;
  const tokenKey = pointType === "from" ? "from" : "to";
  const requestToken = (state.gps.reverseLookupTokens[tokenKey] || 0) + 1;
  state.gps.reverseLookupTokens[tokenKey] = requestToken;
  void (async () => {
    const streetName = await fetchStreetNameForLatLng(latlng);
    if (state.gps.reverseLookupTokens[tokenKey] !== requestToken) return;
    inputEl.value = streetName || fallbackLabel;
  })();
}

function getGpsPreferenceWeights() {
  return {
    wellLit: Boolean(routePreferenceInputs[0]?.checked),
    avoidIsolated: Boolean(routePreferenceInputs[1]?.checked),
    avoidTraffic: Boolean(routePreferenceInputs[2]?.checked),
  };
}

function parseGpsCoordinates(inputValue) {
  const textValue = (inputValue || "").trim();
  const coordsMatch = textValue.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/
  );
  if (coordsMatch) {
    return {
      lat: Number(coordsMatch[1]),
      lng: Number(coordsMatch[2]),
    };
  }
  return null;
}

function resolveGpsPoint(inputValue, fallbackSeed, options = {}) {
  const parsedCoordinates = parseGpsCoordinates(inputValue);
  if (parsedCoordinates) {
    return parsedCoordinates;
  }
  const textValue = (inputValue || "").trim();
  if (options.anchorPoint && options.preferNearby !== false) {
    return deriveNearbyCoordinatesFromSeed(textValue || fallbackSeed || "gps-point", options.anchorPoint);
  }
  return deriveCoordinatesFromSeed(textValue || fallbackSeed || "gps-point");
}

function updateGpsHint(message) {
  if (!gpsMapHint) return;
  if (message) {
    gpsMapHint.textContent = message;
    return;
  }
  if (!state.gps.fromLatLng) {
    gpsMapHint.textContent = "Tap map to set From point.";
    return;
  }
  if (!state.gps.toLatLng) {
    gpsMapHint.textContent = "Tap map to set To point.";
    return;
  }
  gpsMapHint.textContent = "Tap markers or route cards to inspect safety.";
}

function interpolateRoute(start, control, end, samples = GPS_ROUTE_SAMPLE_POINTS) {
  const points = [];
  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const oneMinusT = 1 - t;
    const lat =
      oneMinusT * oneMinusT * start.lat +
      2 * oneMinusT * t * control.lat +
      t * t * end.lat;
    const lng =
      oneMinusT * oneMinusT * start.lng +
      2 * oneMinusT * t * control.lng +
      t * t * end.lng;
    points.push({ lat, lng });
  }
  return points;
}

function buildRoutePath(start, destination, offsetScale = 0) {
  const mid = {
    lat: (start.lat + destination.lat) / 2,
    lng: (start.lng + destination.lng) / 2,
  };
  const vectorLat = destination.lat - start.lat;
  const vectorLng = destination.lng - start.lng;
  const length = Math.max(Math.sqrt(vectorLat * vectorLat + vectorLng * vectorLng), 0.00001);
  const perpendicular = {
    lat: -vectorLng / length,
    lng: vectorLat / length,
  };
  const control = {
    lat: mid.lat + perpendicular.lat * offsetScale,
    lng: mid.lng + perpendicular.lng * offsetScale,
  };
  return interpolateRoute(start, control, destination);
}

function computeRouteDistanceMeters(path) {
  if (!path?.length) return 0;
  let total = 0;
  for (let index = 1; index < path.length; index += 1) {
    total += distanceMeters(path[index - 1].lat, path[index - 1].lng, path[index].lat, path[index].lng);
  }
  return total;
}

function estimateRouteBaseMinutes(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 6;
  if (distanceKm <= 1.2) {
    return Math.max(6, Math.round(distanceKm * 10 + 2));
  }
  if (distanceKm <= 3) {
    return Math.max(8, Math.round(distanceKm * 8.5 + 2));
  }
  if (distanceKm <= 7) {
    return Math.max(14, Math.round(distanceKm * 7 + 4));
  }
  return Math.max(24, Math.round(distanceKm * 6.2 + 6));
}

function formatDurationMinutes(totalMinutes) {
  const safeMinutes = Math.max(1, Math.round(totalMinutes || 0));
  if (safeMinutes < 60) return `${safeMinutes} min`;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function buildTransitLeg(routeId, preferences) {
  if (routeId === "A") {
    return {
      mode: "train",
      label: "Train",
      line: preferences.avoidTraffic ? "Metro Green Line" : "Metro Blue Line",
      stops: preferences.wellLit ? 4 : 3,
    };
  }
  if (routeId === "B") {
    return {
      mode: "bus",
      label: "Bus",
      line: preferences.avoidIsolated ? "Bus 22 Downtown Loop" : "Bus 17 Crosstown",
      stops: preferences.avoidTraffic ? 6 : 5,
    };
  }
  return {
    mode: "bus",
    label: "Bus",
    line: "Bus 9 Local",
    stops: preferences.avoidIsolated ? 5 : 4,
  };
}

function buildRouteDirections(routeId, etaMinutes, preferences) {
  const transitLeg = buildTransitLeg(routeId, preferences);
  const walkStartMinutes = Math.max(3, Math.round(etaMinutes * 0.2));
  const walkEndMinutes = Math.max(2, Math.round(etaMinutes * 0.17));
  const transitMinutes = Math.max(4, etaMinutes - walkStartMinutes - walkEndMinutes);
  const terminalName = routeId === "A" ? "Central Station" : routeId === "B" ? "Main St Stop" : "Civic Center Stop";
  const arrivalName = routeId === "A" ? "Riverside Terminal" : routeId === "B" ? "Market Square Stop" : "North Gate Stop";

  return [
    {
      mode: "walk",
      label: "Walk",
      durationMinutes: walkStartMinutes,
      instruction: `Walk to ${terminalName}.`,
    },
    {
      mode: transitLeg.mode,
      label: transitLeg.label,
      durationMinutes: transitMinutes,
      instruction: `Take ${transitLeg.line} for ${transitLeg.stops} stops to ${arrivalName}.`,
    },
    {
      mode: "walk",
      label: "Walk",
      durationMinutes: walkEndMinutes,
      instruction: "Walk from the stop to your destination.",
    },
  ];
}

function decodePolyline6(encoded) {
  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;
    coordinates.push({ lat: lat / 1e6, lng: lng / 1e6 });
  }
  return coordinates;
}

function formatOsrmInstruction(step) {
  const maneuver = step?.maneuver || {};
  const type = maneuver.type || "continue";
  const modifier = maneuver.modifier || "straight";
  const roadName = step?.name || step?.ref || "the route";
  if (type === "depart") {
    return `Head ${modifier} on ${roadName}.`;
  }
  if (type === "arrive") {
    return "Arrive at your destination.";
  }
  if (type === "turn") {
    return `Turn ${modifier} onto ${roadName}.`;
  }
  if (type === "fork") {
    return `Keep ${modifier} to continue on ${roadName}.`;
  }
  if (type === "roundabout") {
    const exitNumber = maneuver.exit ? ` and take exit ${maneuver.exit}` : "";
    return `Enter the roundabout${exitNumber}, then continue on ${roadName}.`;
  }
  if (type === "new name" || type === "continue") {
    return `Continue on ${roadName}.`;
  }
  return `Follow ${roadName}.`;
}

function extractOsrmDirections(routeData, profile) {
  const profileLabel =
    profile === "walking" ? "Walk" : profile === "cycling" ? "Bike" : "Drive";
  const allSteps = (routeData?.legs || []).flatMap((leg) => leg.steps || []);
  if (!allSteps.length) return [];
  return allSteps.slice(0, GPS_MAX_VISIBLE_DIRECTIONS).map((step) => ({
    mode: profile,
    label: profileLabel,
    durationMinutes: Math.max(1, Math.round((Number(step.duration) || 0) / 60)),
    instruction: formatOsrmInstruction(step),
  }));
}

async function fetchOsrmRoutes(fromPoint, toPoint, profile) {
  const url =
    `${GPS_OSRM_BASE_URL}/route/v1/${profile}/` +
    `${fromPoint.lng},${fromPoint.lat};${toPoint.lng},${toPoint.lat}` +
    "?overview=full&geometries=polyline6&steps=true&alternatives=true&continue_straight=true";
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), GPS_OSRM_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.routes) ? payload.routes : [];
  } catch {
    return [];
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function buildOsrmRouteOption({
  routeData,
  profile,
  id,
  title,
  preferences,
  scoreBias = 0,
  speedBiasMinutes = 0,
}) {
  const path = decodePolyline6(routeData.geometry || "");
  if (!path.length) return null;
  const metrics = computeRouteSafetyMetrics(path, preferences);
  const osrmMinutes = Math.max(1, Math.round((Number(routeData.duration) || 0) / 60));
  const etaMinutes = Math.max(4, osrmMinutes + speedBiasMinutes);
  const adjustedScore = Math.max(0, Math.min(100, metrics.score + scoreBias));
  const riskLevel = adjustedScore >= 72 ? "low" : adjustedScore >= 48 ? "medium" : "high";
  const directions =
    extractOsrmDirections(routeData, profile) || buildRouteDirections(id, etaMinutes, preferences);
  return {
    id,
    routeKey: id,
    title,
    path,
    score: adjustedScore,
    riskLevel,
    etaMinutes,
    directions: directions.length ? directions : buildRouteDirections(id, etaMinutes, preferences),
    nearbyIncidents: metrics.nearbyIncidents,
  };
}

async function tryBuildRealGpsRoutes(fromPoint, toPoint, preferences) {
  const straightDistance = distanceMeters(fromPoint.lat, fromPoint.lng, toPoint.lat, toPoint.lng);
  const profiles = new Set(["driving"]);
  if (straightDistance <= 6000) profiles.add("walking");
  if (preferences.avoidTraffic) profiles.add("cycling");

  const routeBatches = await Promise.all(
    [...profiles].map(async (profile) => {
      const routes = await fetchOsrmRoutes(fromPoint, toPoint, profile);
      const sortedByDuration = routes
        .map((routeData, index) => ({ routeData, profile, index }))
        .sort(
          (left, right) => (Number(left.routeData.duration) || Infinity) - (Number(right.routeData.duration) || Infinity)
        );
      return sortedByDuration;
    })
  );

  const routeMap = Object.fromEntries(routeBatches.flat().map((entry) => [entry.profile, []]));
  routeBatches.flat().forEach((entry) => {
    if (!routeMap[entry.profile]) {
      routeMap[entry.profile] = [];
    }
    routeMap[entry.profile].push(entry);
  });

  const selectedEntries = [];
  const usedEntries = new Set();
  const trySelect = (profile, preferredIndex = 0) => {
    const options = routeMap[profile] || [];
    const candidate = options[preferredIndex];
    if (!candidate) return;
    const key = `${profile}:${candidate.index}`;
    if (usedEntries.has(key)) return;
    usedEntries.add(key);
    selectedEntries.push(candidate);
  };

  // Always include a driving option.
  trySelect("driving", 0);
  // Include walking for realistic short-distance comparison.
  if (straightDistance <= 6000) {
    trySelect("walking", 0);
  }
  // Include cycling alternative when traffic avoidance is requested.
  if (preferences.avoidTraffic) {
    trySelect("cycling", 0);
  }
  // Fill remaining slots with next-fastest unique options.
  const allCandidatesBySpeed = routeBatches
    .flat()
    .sort(
      (left, right) => (Number(left.routeData.duration) || Infinity) - (Number(right.routeData.duration) || Infinity)
    );
  allCandidatesBySpeed.forEach((candidate) => {
    if (selectedEntries.length >= 3) return;
    const key = `${candidate.profile}:${candidate.index}`;
    if (usedEntries.has(key)) return;
    usedEntries.add(key);
    selectedEntries.push(candidate);
  });

  const idOrder = ["A", "B", "C"];
  return selectedEntries.slice(0, 3).map((item, index) => {
    const routeId = idOrder[index] || `R${index + 1}`;
    const profileTitle =
      item.profile === "walking" ? "Walking" : item.profile === "cycling" ? "Cycling" : "Driving";
    return buildOsrmRouteOption({
      routeData: item.routeData,
      profile: item.profile,
      id: routeId,
      title: `Route ${routeId} (${profileTitle})`,
      preferences,
    });
  }).filter(Boolean);
}

function computeRouteSafetyMetrics(path, preferences) {
  const incidents = state.incidents.filter((item) => item.status === "active");
  let weightedRisk = 0;
  let nearbyIncidents = 0;
  const now = Date.now();

  path.forEach((point) => {
    incidents.forEach((incident) => {
      if (!Number.isFinite(incident.mapLat) || !Number.isFinite(incident.mapLng)) return;
      const distance = distanceMeters(point.lat, point.lng, incident.mapLat, incident.mapLng);
      if (distance > GPS_INCIDENT_PROXIMITY_METERS) return;
      nearbyIncidents += 1;
      const severityWeight =
        incident.severity === "critical"
          ? 4.5
          : incident.severity === "high"
            ? 3.2
            : incident.severity === "medium"
              ? 2
              : 1;
      const incidentAgeDays = Math.max(
        0,
        (now - new Date(incident.created_at || now).getTime()) / (24 * 60 * 60 * 1000)
      );
      const recencyFactor = Math.max(0.2, 1 - incidentAgeDays / 30);
      const proximityFactor = Math.max(0.35, 1 - distance / GPS_INCIDENT_PROXIMITY_METERS);
      weightedRisk += severityWeight * recencyFactor * proximityFactor;
    });
  });

  const preferenceBoost =
    (preferences.wellLit ? 8 : 0) +
    (preferences.avoidIsolated ? 10 : 0) +
    (preferences.avoidTraffic ? 4 : 0);

  const communityBoost = state.gps.communityRoutes.reduce((accumulator, route) => {
    const levelBoost =
      route.safety_level === "low" ? 6 : route.safety_level === "medium" ? 2 : -3;
    const ratingBoost = (Number(route.safety_rating) || 0) * 0.8;
    return accumulator + levelBoost + ratingBoost;
  }, 0);

  const score = Math.max(0, Math.min(100, Math.round(100 - weightedRisk * 5 + preferenceBoost + communityBoost * 0.08)));
  const riskLevel = score >= 72 ? "low" : score >= 48 ? "medium" : "high";

  return {
    score,
    riskLevel,
    weightedRisk,
    nearbyIncidents,
  };
}

function buildRouteOption({ id, title, path, speedBiasMinutes = 0, safetyBias = 0, preferences }) {
  const metrics = computeRouteSafetyMetrics(path, preferences);
  const distanceKm = computeRouteDistanceMeters(path) / 1000;
  const baseMinutes = estimateRouteBaseMinutes(distanceKm);
  const etaMinutes = Math.max(5, baseMinutes + speedBiasMinutes);
  const adjustedScore = Math.max(0, Math.min(100, metrics.score + safetyBias));
  const riskLevel = adjustedScore >= 72 ? "low" : adjustedScore >= 48 ? "medium" : "high";
  const directions = buildRouteDirections(id, etaMinutes, preferences);

  return {
    id,
    routeKey: id,
    title,
    path,
    score: adjustedScore,
    riskLevel,
    etaMinutes,
    directions,
    nearbyIncidents: metrics.nearbyIncidents,
  };
}

function rankGpsRoutes(routeChoices) {
  if (!Array.isArray(routeChoices) || !routeChoices.length) return [];
  const fastestEta = Math.min(...routeChoices.map((route) => route.etaMinutes));
  const hasLowOrMedium = routeChoices.some((route) => route.riskLevel !== "high");
  const riskRank = {
    low: 0,
    medium: 1,
    high: hasLowOrMedium ? 2 : 1,
  };

  return routeChoices
    .map((route) => {
      const etaGapMinutes = Math.max(0, route.etaMinutes - fastestEta);
      const speedScore = Math.max(0, 100 - etaGapMinutes * 8);
      const priority = Math.round(route.score * 0.72 + speedScore * 0.28);
      return {
        ...route,
        priorityScore: priority,
      };
    })
    .sort((left, right) => {
      const riskGap = (riskRank[left.riskLevel] ?? 1) - (riskRank[right.riskLevel] ?? 1);
      if (riskGap !== 0) return riskGap;
      if (right.priorityScore !== left.priorityScore) return right.priorityScore - left.priorityScore;
      if (left.etaMinutes !== right.etaMinutes) return left.etaMinutes - right.etaMinutes;
      return right.score - left.score;
    });
}

function setGpsRouteSelection(routeId) {
  const selected =
    state.gps.routeChoices.find((route) => route.id === routeId) ||
    state.gps.routeChoices[0] ||
    null;
  if (!selected) return;
  state.gps.activeRouteId = selected.id;
  state.gps.currentRouteRiskLevel = selected.riskLevel;
  state.selectedRouteKey = selected.routeKey;
  renderGpsRouteOptions();
  syncLegacyRouteSelection();
  drawGpsRoutesOnMap();
  focusGpsRouteOnMap(selected);
}

function focusGpsRouteOnMap(route) {
  if (!state.gps.map || !route?.path?.length) return;
  const bounds = L.latLngBounds(route.path.map((point) => [point.lat, point.lng]));
  if (!bounds.isValid()) return;
  state.gps.map.fitBounds(bounds, {
    padding: [28, 28],
    maxZoom: 16,
    animate: true,
    duration: 0.4,
  });
}

function drawGpsRoutesOnMap() {
  if (!state.gps.map || !state.gps.routePolylinesLayer) return;
  state.gps.routePolylinesLayer.clearLayers();
  state.gps.routeChoices.forEach((route) => {
    const isActive = route.id === state.gps.activeRouteId;
    const polyline = L.polyline(route.path, {
      color: mapGpsRouteColor(route.riskLevel),
      weight: isActive ? 5 : 3.5,
      opacity: isActive ? 0.9 : 0.55,
      dashArray: isActive ? null : "6 5",
    });
    polyline.on("click", () => setGpsRouteSelection(route.id));
    if (isActive) {
      polyline.bindPopup(
        `<strong>${escapeHtml(route.title)}</strong><br>` +
          `${escapeHtml(mapGpsRiskLabel(route.riskLevel))} • ${escapeHtml(
            formatDurationMinutes(route.etaMinutes)
          )}`
      );
    }
    polyline.addTo(state.gps.routePolylinesLayer);
  });
}

function renderGpsRouteOptions() {
  if (!routeOptionsContainer) return;
  if (!state.gps.routeChoices.length) {
    routeOptionsContainer.innerHTML = `
      <button type="button" class="route-option active" data-route-key="A">
        <strong data-i18n="routeOptionOne">Route A</strong>
        <small data-i18n="routeOptionOneMeta">14 min • Low risk</small>
      </button>
      <button type="button" class="route-option" data-route-key="B">
        <strong data-i18n="routeOptionTwo">Route B</strong>
        <small data-i18n="routeOptionTwoMeta">11 min • Medium risk</small>
      </button>`;
    syncLegacyRouteSelection();
    return;
  }
  routeOptionsContainer.innerHTML = state.gps.routeChoices
    .map((route) => {
      const activeClass = route.id === state.gps.activeRouteId ? "active" : "";
      const riskClass = mapGpsRiskClass(route.riskLevel);
      const recommendedClass = route.id === state.gps.routeChoices[0]?.id ? "recommended" : "";
      const selectedRating = Number(state.gps.routeRatings[route.id] || 0);
      return `
        <article class="route-option ${activeClass} ${riskClass} ${recommendedClass}">
          <button type="button" class="tiny-btn" data-action="select-gps-route" data-route-id="${route.id}" data-route-key="${route.routeKey}">
            Select
          </button>
          <strong>${escapeHtml(route.title)}</strong>
          <small>${route.etaMinutes} min • ${escapeHtml(mapGpsRiskLabel(route.riskLevel))} • Score ${route.score}</small>
          <small class="route-status-note">${route.nearbyIncidents} nearby alerts on this path</small>
          <ol class="route-directions" aria-label="Route directions">
            ${(Array.isArray(route.directions) ? route.directions : [])
              .slice(0, GPS_MAX_VISIBLE_DIRECTIONS)
              .map(
                (step) =>
                  `<li><span class="step-mode">${escapeHtml(step.label)}:</span> ${escapeHtml(
                    step.instruction
                  )} <span class="step-duration">(${escapeHtml(
                    formatDurationMinutes(step.durationMinutes)
                  )})</span></li>`
              )
              .join("")}
          </ol>
          <div class="gps-route-rate">
            ${[1, 2, 3, 4, 5]
              .map((score) => {
                const ratingState = getRatingButtonState(score, selectedRating);
                return `<button
                  type="button"
                  class="gps-rate-btn ${ratingState.classes}"
                  data-action="rate-gps-route"
                  data-route-id="${route.id}"
                  data-rating="${score}"
                  aria-pressed="${ratingState.ariaPressed}">
                  Rate ${score}
                </button>`;
              })
              .join("")}
          </div>
        </article>`;
    })
    .join("");
  syncLegacyRouteSelection();
}

function syncLegacyRouteSelection() {
  if (!routeOptionsContainer) return;
  routeOptionsContainer.querySelectorAll(".route-option").forEach((option) => {
    if (!(option instanceof HTMLElement)) return;
    const routeKey = option.dataset.routeKey || option.dataset.routeId;
    option.classList.toggle("active", routeKey === state.selectedRouteKey);
  });
}

function setGpsWaypoint(latlng, pointType, options = {}) {
  if (!latlng || !state.gps.map) return;
  if (pointType === "from") {
    state.gps.fromLatLng = latlng;
    setGpsInputStreetName(latlng, "from", options);
    if (!state.gps.fromMarker) {
      state.gps.fromMarker = L.marker(latlng, {
        icon: L.divIcon({
          className: "gps-waypoint-pin-wrap",
          html: `<span class="gps-waypoint-pin start"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      }).addTo(state.gps.map);
    } else {
      safeSetLatLng(state.gps.fromMarker, latlng);
    }
    state.gps.clickStage = "to";
    updateGpsHint("To point set. Tap map to set destination.");
    return;
  }

  state.gps.toLatLng = latlng;
  setGpsInputStreetName(latlng, "to", options);
  if (!state.gps.toMarker) {
    state.gps.toMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: "gps-waypoint-pin-wrap",
        html: `<span class="gps-waypoint-pin destination"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    }).addTo(state.gps.map);
  } else {
    safeSetLatLng(state.gps.toMarker, latlng);
  }
  state.gps.clickStage = "from";
  updateGpsHint();
}

function ensureGpsDangerMarkers() {
  if (!state.gps.map || !state.gps.dangerMarkersLayer) return;
  state.gps.dangerMarkersLayer.clearLayers();
  const incidents = state.incidents
    .filter((incident) => incident.status === "active")
    .slice(0, GPS_DANGER_MARKER_LIMIT);

  incidents.forEach((incident) => {
    if (!Number.isFinite(incident.mapLat) || !Number.isFinite(incident.mapLng)) return;
    L.marker(
      { lat: incident.mapLat, lng: incident.mapLng },
      {
        icon: L.divIcon({
          className: "gps-danger-pin-wrap",
          html: `<span class="gps-danger-pin"></span>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      }
    )
      .bindPopup(
        `<strong>${escapeHtml(incident.incident_type || "Incident")}</strong><br>${escapeHtml(
          incident.details || "No details"
        )}`
      )
      .addTo(state.gps.dangerMarkersLayer);
  });
}

function evaluateCurrentRouteSafety() {
  const active = state.gps.routeChoices.find((route) => route.id === state.gps.activeRouteId);
  if (!active) return;
  if (active.riskLevel === "high" && state.gps.currentRouteRiskLevel !== "high") {
    showToast("Safety alert: active route risk increased. Consider safer option.");
    updateGpsHint("Warning: current route now has high risk.");
  }
  state.gps.currentRouteRiskLevel = active.riskLevel;
}

function refreshGpsWithIncidents() {
  ensureGpsDangerMarkers();
  if (state.gps.fromLatLng && state.gps.toLatLng) {
    generateGpsRoutes({ persistHistory: false, silent: true });
  }
  evaluateCurrentRouteSafety();
}

function generateGpsRoutes(options = {}) {
  const originInputValue = routeOriginInput.value;
  const destinationInputValue = routeDestinationInput.value;
  const originHasCoordinates = Boolean(parseGpsCoordinates(originInputValue));
  const destinationHasCoordinates = Boolean(parseGpsCoordinates(destinationInputValue));
  const fromPoint =
    state.gps.fromLatLng ||
    resolveGpsPoint(originInputValue, "route-origin", { preferNearby: !originHasCoordinates });
  const toPoint =
    state.gps.toLatLng ||
    resolveGpsPoint(destinationInputValue, "route-destination", {
      anchorPoint: fromPoint,
      preferNearby: !destinationHasCoordinates,
    });
  state.gps.fromLatLng = fromPoint;
  state.gps.toLatLng = toPoint;
  setGpsWaypoint(fromPoint, "from", { preserveExistingName: true });
  setGpsWaypoint(toPoint, "to", { preserveExistingName: true });

  const preferences = getGpsPreferenceWeights();
  const directSpanDegrees = Math.hypot(fromPoint.lat - toPoint.lat, fromPoint.lng - toPoint.lng);
  const offset = Math.min(0.01, Math.max(0.0012, directSpanDegrees * 0.32));
  const routeA = buildRouteOption({
    id: "A",
    title: "Route A",
    path: buildRoutePath(fromPoint, toPoint, offset),
    speedBiasMinutes: 2,
    safetyBias: 6,
    preferences,
  });
  const routeB = buildRouteOption({
    id: "B",
    title: "Route B",
    path: buildRoutePath(fromPoint, toPoint, -offset * 0.6),
    speedBiasMinutes: -1,
    safetyBias: 3,
    preferences,
  });
  const routeC = buildRouteOption({
    id: "C",
    title: "Route C",
    path: buildRoutePath(fromPoint, toPoint, 0),
    speedBiasMinutes: -3,
    safetyBias: -4,
    preferences,
  });

  state.gps.routeChoices = rankGpsRoutes([routeA, routeB, routeC]);
  setGpsRouteSelection(state.gps.routeChoices[0]?.id || "A");
  updateGpsHint();
  if (!options.silent) {
    showToast("Safety routes generated.");
  }

  const currentRequestToken = state.gps.routeRequestToken + 1;
  state.gps.routeRequestToken = currentRequestToken;
  void (async () => {
    const realRoutes = await tryBuildRealGpsRoutes(fromPoint, toPoint, preferences);
    if (!realRoutes.length) return;
    if (state.gps.routeRequestToken !== currentRequestToken) return;
    state.gps.routeChoices = rankGpsRoutes(realRoutes);
    setGpsRouteSelection(state.gps.routeChoices[0]?.id || state.gps.activeRouteId || "A");
    updateGpsHint("Live road route loaded. Tap options to preview turns.");
    if (!options.silent) {
      showToast("Live GPS route updated.");
    }
  })();
}

async function fetchCommunityRoutes() {
  if (!supabase || !state.currentUserId || !state.gps.schemaHasCommunityTables) {
    renderCommunityRoutes();
    return;
  }
  const { data, error } = await supabase
    .from("community_safe_routes")
    .select(
      "id, start_location, destination_location, route_notes, safety_level, safety_rating, tags, created_at, start_lat, start_lng, destination_lat, destination_lng"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (error.code === "42P01") {
      state.gps.schemaHasCommunityTables = false;
      state.gps.communityRoutes = [];
      renderCommunityRoutes();
      return;
    }
    showToast(error.message);
    return;
  }
  state.gps.communityRoutes = (data || []).map(normalizeCommunityRoute);
  renderCommunityRoutes();
}

async function saveCommunityRoute(payload) {
  if (!supabase || !state.currentUserId || !state.gps.schemaHasCommunityTables) return false;
  const { error } = await supabase.from("community_safe_routes").insert(payload);
  if (error) {
    if (error.code === "42P01") {
      state.gps.schemaHasCommunityTables = false;
      showToast("Community routes table missing. Run latest SQL schema.");
      return false;
    }
    showToast(error.message);
    return false;
  }
  return true;
}

async function saveRouteFeedback(routeId, rating) {
  if (!supabase || !state.currentUserId || !state.gps.schemaHasRouteFeedbackTable) return false;
  const { error } = await supabase.from("route_feedback").insert({
    owner_user_id: state.currentUserId,
    owner_device_id: deviceId,
    route_key: routeId,
    rating,
    metadata: {
      from: routeOriginInput.value.trim(),
      destination: routeDestinationInput.value.trim(),
      generated_at: new Date().toISOString(),
    },
  });

  if (error) {
    if (error.code === "42P01") {
      state.gps.schemaHasRouteFeedbackTable = false;
      showToast("Route feedback table missing. Run latest SQL schema.");
      return false;
    }
    showToast(error.message);
    return false;
  }
  return true;
}

async function fetchRouteFeedbackRatings() {
  if (!supabase || !state.currentUserId || !state.gps.schemaHasRouteFeedbackTable) return;
  const { data, error } = await supabase
    .from("route_feedback")
    .select("route_key, rating, created_at")
    .eq("owner_user_id", state.currentUserId)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    if (error.code === "42P01") {
      state.gps.schemaHasRouteFeedbackTable = false;
      return;
    }
    showToast(error.message);
    return;
  }

  const latestByRouteKey = {};
  (data || []).forEach((entry) => {
    const key = String(entry.route_key || "").trim();
    if (!key || latestByRouteKey[key]) return;
    const rating = Number(entry.rating);
    if (!Number.isFinite(rating)) return;
    latestByRouteKey[key] = rating;
  });

  state.gps.routeRatings = {
    ...state.gps.routeRatings,
    A: latestByRouteKey.A ?? state.gps.routeRatings.A,
    B: latestByRouteKey.B ?? state.gps.routeRatings.B,
    C: latestByRouteKey.C ?? state.gps.routeRatings.C,
  };

  state.routeHistoryRatings = {
    ...state.routeHistoryRatings,
    ...Object.fromEntries(
      Object.entries(latestByRouteKey).filter(([routeKey]) => !["A", "B", "C"].includes(routeKey))
    ),
  };

  renderGpsRouteOptions();
  renderRouteHistory();
}

function bindGpsMapEvents() {
  if (!state.gps.map || state.gps.mapEventsBound) return;
  state.gps.map.on("click", (event) => {
    const stage = state.gps.clickStage === "to" ? "to" : "from";
    setGpsWaypoint(event.latlng, stage);
    if (state.gps.fromLatLng && state.gps.toLatLng) {
      generateGpsRoutes({ persistHistory: false, silent: true });
    }
  });
  state.gps.mapEventsBound = true;
}

function ensureGpsMap() {
  if (!gpsMapContainer || state.gps.map) return;
  const mapInstance = L.map(gpsMapContainer, {
    zoomControl: false,
    attributionControl: false,
  }).setView([MAP_DEFAULT_CENTER.lat, MAP_DEFAULT_CENTER.lng], 12);
  state.gps.map = mapInstance;
  state.gps.dangerMarkersLayer = L.layerGroup().addTo(mapInstance);
  state.gps.routePolylinesLayer = L.layerGroup().addTo(mapInstance);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(mapInstance);
  bindGpsMapEvents();
  setTimeout(() => mapInstance.invalidateSize(), 0);
  updateGpsHint();

  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
      state.gps.userLatLng = latlng;
      if (!state.gps.userMarker) {
        state.gps.userMarker = L.circleMarker(latlng, {
          radius: 6,
          color: "#2563eb",
          fillColor: "#2563eb",
          fillOpacity: 0.8,
          weight: 2,
        }).addTo(mapInstance);
      } else {
        safeSetLatLng(state.gps.userMarker, latlng);
      }
      if (!state.gps.fromLatLng) {
        setGpsWaypoint(latlng, "from");
      }
    },
    () => {},
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );

  if (state.gps.userPositionWatchId !== null) {
    navigator.geolocation.clearWatch(state.gps.userPositionWatchId);
  }
  state.gps.userPositionWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
      state.gps.userLatLng = latlng;
      if (!state.gps.userMarker) {
        state.gps.userMarker = L.circleMarker(latlng, {
          radius: 6,
          color: "#2563eb",
          fillColor: "#2563eb",
          fillOpacity: 0.8,
          weight: 2,
        }).addTo(mapInstance);
      } else {
        safeSetLatLng(state.gps.userMarker, latlng);
      }
      const gpsPageActive = document.querySelector(".page.active")?.dataset.page === "gps";
      if (gpsPageActive && !state.gps.fromLatLng) {
        mapInstance.panTo(latlng, { animate: true, duration: 0.3 });
      }
    },
    () => {},
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 }
  );
}

function bindGpsUiEvents() {
  const gpsRouteOptionsBound = routeOptionsContainer?.dataset.gpsBound === "true";
  const gpsCommunitySubmitBound = communityRouteForm?.dataset.gpsBound === "true";
  const gpsCommunityListBound = communityRouteList?.dataset.gpsBound === "true";

  if (!gpsRouteOptionsBound) {
    if (routeOptionsContainer) routeOptionsContainer.dataset.gpsBound = "true";
    routeOptionsContainer?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const selectButton = target.closest("[data-action='select-gps-route']");
      if (selectButton instanceof HTMLElement) {
        const routeId = selectButton.dataset.routeId;
        if (routeId) setGpsRouteSelection(routeId);
      }

      const rateButton = target.closest(".gps-rate-btn");
      if (rateButton instanceof HTMLElement && rateButton.dataset.action === "rate-gps-route") {
        const routeId = rateButton.dataset.routeId;
        const rating = Number(rateButton.dataset.rating);
        if (!routeId || !Number.isFinite(rating)) return;
        state.gps.routeRatings[routeId] = rating;
        renderGpsRouteOptions();
        if (!supabase || !state.currentUserId) {
          showToast("Rating selected.");
          return;
        }
        const saved = await saveRouteFeedback(routeId, rating);
        if (saved) showToast("Thanks for rating this route.");
      }
    });
  }

  if (!gpsCommunitySubmitBound) {
    if (communityRouteForm) communityRouteForm.dataset.gpsBound = "true";
    communityRouteForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!hasDatabaseSession()) return;

      const startLocation = communityRouteStartInput?.value.trim() || "";
      const destinationLocation = communityRouteDestinationInput?.value.trim() || "";
      if (!startLocation || !destinationLocation) {
        showToast("Please provide start and destination.");
        return;
      }

      const payload = {
        owner_user_id: state.currentUserId,
        owner_device_id: deviceId,
        start_location: startLocation,
        destination_location: destinationLocation,
        route_notes: communityRouteNotesInput?.value.trim() || null,
        safety_level: communityRouteSafetyLevelInput?.value || "medium",
        safety_rating: Number(communityRouteRatingInput?.value || 3),
        tags: parseTagsInput(communityRouteTagsInput?.value || ""),
        start_lat: Number(state.gps.fromLatLng?.lat ?? resolveGpsPoint(startLocation, "community-start").lat),
        start_lng: Number(state.gps.fromLatLng?.lng ?? resolveGpsPoint(startLocation, "community-start").lng),
        destination_lat: Number(
          state.gps.toLatLng?.lat ?? resolveGpsPoint(destinationLocation, "community-destination").lat
        ),
        destination_lng: Number(
          state.gps.toLatLng?.lng ?? resolveGpsPoint(destinationLocation, "community-destination").lng
        ),
      };

      const saved = await saveCommunityRoute(payload);
      if (!saved) return;
      communityRouteForm.reset();
      if (communityRouteRatingInput) communityRouteRatingInput.value = "4";
      if (communityRouteSafetyLevelInput) communityRouteSafetyLevelInput.value = "low";
      await fetchCommunityRoutes();
      if (state.gps.fromLatLng && state.gps.toLatLng) {
        generateGpsRoutes({ silent: true });
      }
      showToast("Community route submitted.");
    });
  }

  if (!gpsCommunityListBound) {
    if (communityRouteList) communityRouteList.dataset.gpsBound = "true";
    communityRouteList?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.action !== "use-community-route") return;
      const routeId = target.dataset.id;
      if (!routeId) return;
      const route = state.gps.communityRoutes.find((item) => item.id === routeId);
      if (!route) return;
      routeOriginInput.value = route.start_location;
      routeDestinationInput.value = route.destination_location;
      if (Number.isFinite(route.start_lat) && Number.isFinite(route.start_lng)) {
        state.gps.fromLatLng = { lat: route.start_lat, lng: route.start_lng };
      } else {
        state.gps.fromLatLng = resolveGpsPoint(route.start_location, "community-start");
      }
      if (Number.isFinite(route.destination_lat) && Number.isFinite(route.destination_lng)) {
        state.gps.toLatLng = { lat: route.destination_lat, lng: route.destination_lng };
      } else {
        state.gps.toLatLng = resolveGpsPoint(route.destination_location, "community-destination");
      }
      if (state.gps.map) {
        setGpsWaypoint(state.gps.fromLatLng, "from", { preserveExistingName: true });
        setGpsWaypoint(state.gps.toLatLng, "to", { preserveExistingName: true });
      }
      generateGpsRoutes({ silent: true });
      showToast("Community route applied.");
    });
  }
}

async function subscribeGpsRealtime() {
  if (!supabase) return;
  if (state.gps.routeRealtimeChannel) {
    await supabase.removeChannel(state.gps.routeRealtimeChannel);
  }
  if (state.gps.communityRealtimeChannel) {
    await supabase.removeChannel(state.gps.communityRealtimeChannel);
  }
  if (state.gps.feedbackRealtimeChannel) {
    await supabase.removeChannel(state.gps.feedbackRealtimeChannel);
  }

  state.gps.routeRealtimeChannel = supabase
    .channel("gps-route-history-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "route_history" },
      () => {
        fetchRouteHistory();
      }
    )
    .subscribe();

  if (state.gps.schemaHasCommunityTables) {
    state.gps.communityRealtimeChannel = supabase
      .channel("gps-community-routes-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_safe_routes" },
        () => {
          fetchCommunityRoutes();
        }
      )
      .subscribe();
  }

  if (state.gps.schemaHasRouteFeedbackTable) {
    state.gps.feedbackRealtimeChannel = supabase
      .channel("gps-route-feedback-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "route_feedback" },
        () => {
          fetchRouteFeedbackRatings();
        }
      )
      .subscribe();
  }
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

function hasMissingCoordinateColumnError(error) {
  if (!error) return false;
  return /(incident_lat|incident_lng|column)/i.test(`${error.message} ${error.details || ""}`);
}

async function insertIncidentReport(payload) {
  if (!supabase) return { error: { message: "Database unavailable." } };
  const basePayload = { ...payload };
  const mapSource = state.map.selectedLatLng || state.map.userLatLng;
  let withCoordinates = { ...basePayload };
  if (state.map.schemaHasCoordinates && mapSource) {
    withCoordinates = {
      ...basePayload,
      incident_lat: Number(mapSource.lat.toFixed(6)),
      incident_lng: Number(mapSource.lng.toFixed(6)),
    };
  }
  let result = await supabase.from("incident_reports").insert(withCoordinates);
  if (result.error && state.map.schemaHasCoordinates && hasMissingCoordinateColumnError(result.error)) {
    state.map.schemaHasCoordinates = false;
    result = await supabase.from("incident_reports").insert(basePayload);
  }
  return result;
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
      state.map.schemaHasCoordinates && hasMissingCoordinateColumnError(error);
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
  refreshGpsWithIncidents();
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

window.addEventListener("resize", () => {
  const activePage = document.querySelector(".page.active")?.dataset.page;
  if (!activePage) return;
  refreshActivePageMap(activePage);
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
    const { error } = await insertIncidentReport(payload);
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

const routeFormAlreadyBound = routeForm?.dataset.routeSubmitBound === "true";
if (!routeFormAlreadyBound) {
  if (routeForm) routeForm.dataset.routeSubmitBound = "true";
  routeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!hasDatabaseSession()) {
    return;
  }

  const originValue = routeOriginInput?.value.trim() || "";
  const destinationValue = routeDestinationInput?.value.trim() || "";
  if (!originValue || !destinationValue) {
    showToast("Please provide both start and destination.");
    return;
  }

  const originParsed = parseGpsCoordinates(originValue);
  const destinationParsed = parseGpsCoordinates(destinationValue);
  state.gps.fromLatLng = resolveGpsPoint(originValue, "route-origin", {
    preferNearby: !originParsed,
  });
  state.gps.toLatLng = resolveGpsPoint(destinationValue, "route-destination", {
    anchorPoint: state.gps.fromLatLng,
    preferNearby: !destinationParsed,
  });
  if (state.gps.map) {
    setGpsWaypoint(state.gps.fromLatLng, "from", { preserveExistingName: true });
    setGpsWaypoint(state.gps.toLatLng, "to", { preserveExistingName: true });
  }

  generateGpsRoutes({ silent: true });
  const selectedRoute =
    state.gps.routeChoices.find((route) => route.id === state.gps.activeRouteId) ||
    state.gps.routeChoices[0];
  if (!selectedRoute) {
    showToast("Unable to generate routes.");
    return;
  }

  const payload = {
    owner_user_id: state.currentUserId,
    owner_device_id: deviceId,
    origin: originValue,
    destination: destinationValue,
    route_key: selectedRoute.routeKey === "A" ? "A" : "B",
    risk_level: selectedRoute.riskLevel,
    eta_minutes: selectedRoute.etaMinutes,
    options: {
      well_lit: Boolean(routePreferenceInputs[0]?.checked),
      avoid_isolated: Boolean(routePreferenceInputs[1]?.checked),
      avoid_traffic: Boolean(routePreferenceInputs[2]?.checked),
      gps_route_score: selectedRoute.score,
      gps_route_incidents: selectedRoute.nearbyIncidents,
    },
  };

  const { error } = await supabase.from("route_history").insert(payload);
  if (error) {
    showToast(error.message);
    return;
  }

  await fetchRouteHistory();
  showToast("Safety routes generated.");
  });
}

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

  const rateButton = target.closest("[data-action='rate-route']");
  if (rateButton instanceof HTMLElement) {
    const routeId = rateButton.dataset.id;
    const rating = Number(rateButton.dataset.rating);
    if (!routeId || !Number.isFinite(rating)) return;
    state.routeHistoryRatings[routeId] = rating;
    renderRouteHistory();
    if (!supabase || !state.currentUserId) {
      showToast("Rating selected.");
      return;
    }
    const saved = await saveRouteFeedback(routeId, rating);
    if (saved) {
      showToast("Thanks for rating this route.");
    }
    return;
  }

  if (!supabase) return;
  const actionTarget = target.closest("[data-action]");
  if (!(actionTarget instanceof HTMLElement)) return;
  const id = actionTarget.dataset.id;
  if (!id) return;

  if (actionTarget.dataset.action === "delete-route") {
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

  if (actionTarget.dataset.action === "toggle-route-favorite") {
    const nextFavorite = actionTarget.dataset.favorite !== "true";
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

bindGpsUiEvents();

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
  ensureGpsMap();
  if (!isSupabaseConfigured) {
    renderIncidentFeed();
    renderMyReports();
    renderTrustedContacts();
    renderRouteHistory();
    renderCommunityRoutes();
    refreshMapDataFromIncidents();
    refreshGpsWithIncidents();
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
    fetchCommunityRoutes(),
    fetchRouteFeedbackRatings(),
    fetchLastSosEvent(),
  ]);

  refreshGpsWithIncidents();
  await subscribeGpsRealtime();

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
