const pageTitle = document.getElementById("page-title");
const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item")];
const toast = document.getElementById("toast");
const themeSelect = document.getElementById("theme-select");
const languageSelect = document.getElementById("language-select");

const labels = {
  map: "Safety Map",
  report: "Incident Report",
  sos: "SOS Center",
  gps: "GPS Safe Route",
  settings: "Settings",
};

const copy = {
  en: {
    appTagline: "Community Safety",
    currentLocation: "Current Location",
    currentLocationValue: "5th Ave & Main St, Downtown",
    nearbyAlerts: "Nearby Alerts",
    highRisk: "High",
    mediumRisk: "Medium",
    alertOne: "Theft reported 300m away, 14 minutes ago.",
    alertTwo: "Road accident near Oak Junction, 1.2km away.",
    shareMyLocation: "Share My Live Location",
    reportIncident: "Report an Incident",
    incidentType: "Incident Type",
    selectType: "Select type...",
    crime: "Crime",
    accident: "Accident",
    harassment: "Harassment",
    incidentLocation: "Location",
    details: "Details",
    anonymousReport: "Submit anonymously",
    submitReport: "Submit Report",
    sosQuickCall: "Emergency Quick Call",
    sosDescription: "Tap one of the emergency contacts below to call instantly.",
    broadcastSos: "Broadcast SOS to Trusted Contacts",
    safeRouting: "Safe Route Planner",
    fromLocation: "From",
    toLocation: "To",
    routePriority: "Route Priority",
    wellLitRoads: "Well-lit roads",
    avoidIsolated: "Avoid isolated streets",
    avoidTraffic: "Avoid heavy traffic",
    findSafeRoute: "Find Safest Route",
    recommendedRoute: "Recommended Route",
    routeSummary: "Estimated 14 min, low risk corridor.",
    preferences: "Preferences",
    appearance: "Appearance",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    pushAlerts: "Push danger alerts",
    locationSharing: "Auto location sharing",
    mapTab: "Map",
    reportTab: "Report",
    sosTab: "SOS",
    gpsTab: "GPS",
    settingsTab: "Settings",
    reportSent: "Report sent successfully.",
    locationShared: "Live location shared.",
    sosBroadcasted: "SOS broadcast sent to trusted contacts.",
    routeReady: "Safest route generated.",
  },
  es: {
    appTagline: "Seguridad Comunitaria",
    currentLocation: "Ubicacion Actual",
    currentLocationValue: "5ta Avenida y Calle Principal, Centro",
    nearbyAlerts: "Alertas Cercanas",
    highRisk: "Alta",
    mediumRisk: "Media",
    alertOne: "Robo reportado a 300m, hace 14 minutos.",
    alertTwo: "Accidente vial cerca de Oak Junction, a 1.2km.",
    shareMyLocation: "Compartir mi ubicacion en vivo",
    reportIncident: "Reportar un Incidente",
    incidentType: "Tipo de incidente",
    selectType: "Seleccionar tipo...",
    crime: "Crimen",
    accident: "Accidente",
    harassment: "Acoso",
    incidentLocation: "Ubicacion",
    details: "Detalles",
    anonymousReport: "Enviar anonimamente",
    submitReport: "Enviar reporte",
    sosQuickCall: "Llamada de Emergencia",
    sosDescription:
      "Toca uno de los contactos de emergencia para llamar al instante.",
    broadcastSos: "Enviar SOS a contactos de confianza",
    safeRouting: "Planificador de Ruta Segura",
    fromLocation: "Desde",
    toLocation: "Hasta",
    routePriority: "Prioridad de ruta",
    wellLitRoads: "Calles bien iluminadas",
    avoidIsolated: "Evitar calles aisladas",
    avoidTraffic: "Evitar trafico pesado",
    findSafeRoute: "Buscar ruta mas segura",
    recommendedRoute: "Ruta recomendada",
    routeSummary: "Estimado 14 min, corredor de bajo riesgo.",
    preferences: "Preferencias",
    appearance: "Apariencia",
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",
    language: "Idioma",
    pushAlerts: "Alertas de peligro",
    locationSharing: "Compartir ubicacion automaticamente",
    mapTab: "Mapa",
    reportTab: "Reporte",
    sosTab: "SOS",
    gpsTab: "GPS",
    settingsTab: "Ajustes",
    reportSent: "Reporte enviado correctamente.",
    locationShared: "Ubicacion en vivo compartida.",
    sosBroadcasted: "SOS enviado a tus contactos de confianza.",
    routeReady: "Ruta segura generada.",
  },
  fr: {
    appTagline: "Securite Communautaire",
    currentLocation: "Position Actuelle",
    currentLocationValue: "5e Avenue et rue Main, Centre-ville",
    nearbyAlerts: "Alertes Proches",
    highRisk: "Eleve",
    mediumRisk: "Moyen",
    alertOne: "Vol signale a 300m, il y a 14 minutes.",
    alertTwo: "Accident pres de Oak Junction, a 1,2km.",
    shareMyLocation: "Partager ma position en direct",
    reportIncident: "Signaler un incident",
    incidentType: "Type d'incident",
    selectType: "Selectionner le type...",
    crime: "Crime",
    accident: "Accident",
    harassment: "Harcelement",
    incidentLocation: "Lieu",
    details: "Details",
    anonymousReport: "Envoyer anonymement",
    submitReport: "Envoyer le signalement",
    sosQuickCall: "Appel d'urgence",
    sosDescription:
      "Touchez un contact d'urgence ci-dessous pour appeler instantanement.",
    broadcastSos: "Diffuser SOS aux contacts de confiance",
    safeRouting: "Planificateur d'itineraire securise",
    fromLocation: "De",
    toLocation: "Vers",
    routePriority: "Priorite d'itineraire",
    wellLitRoads: "Routes bien eclairees",
    avoidIsolated: "Eviter les rues isolees",
    avoidTraffic: "Eviter le trafic dense",
    findSafeRoute: "Trouver l'itineraire le plus sur",
    recommendedRoute: "Itineraire recommande",
    routeSummary: "Estimation 14 min, couloir a faible risque.",
    preferences: "Preferences",
    appearance: "Apparence",
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    language: "Langue",
    pushAlerts: "Alertes de danger push",
    locationSharing: "Partage automatique de position",
    mapTab: "Carte",
    reportTab: "Signaler",
    sosTab: "SOS",
    gpsTab: "GPS",
    settingsTab: "Reglages",
    reportSent: "Signalement envoye avec succes.",
    locationShared: "Position en direct partagee.",
    sosBroadcasted: "SOS diffuse a vos contacts de confiance.",
    routeReady: "Itineraire securise genere.",
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
  pageTitle.textContent = labels[target];
}

function applyLanguage(language) {
  const selected = copy[language] || copy.en;
  const i18nElements = document.querySelectorAll("[data-i18n]");
  i18nElements.forEach((el) => {
    const key = el.dataset.i18n;
    if (selected[key]) el.textContent = selected[key];
  });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => switchPage(item.dataset.target));
});

document.getElementById("report-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.target.reset();
  showToast((copy[languageSelect.value] || copy.en).reportSent);
});

document.getElementById("route-form").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast((copy[languageSelect.value] || copy.en).routeReady);
});

document
  .querySelector("[data-action='share-location']")
  .addEventListener("click", () =>
    showToast((copy[languageSelect.value] || copy.en).locationShared)
  );

document
  .querySelector("[data-action='broadcast-sos']")
  .addEventListener("click", () =>
    showToast((copy[languageSelect.value] || copy.en).sosBroadcasted)
  );

themeSelect.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeSelect.value === "dark");
});

languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
});

applyLanguage("en");
