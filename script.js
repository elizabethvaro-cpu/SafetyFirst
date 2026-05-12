const pageTitle = document.getElementById("page-title");
const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item")];
const toast = document.getElementById("toast");
const themeSelect = document.getElementById("theme-select");
const languageSelect = document.getElementById("language-select");
const routeForm = document.getElementById("route-form");
const routeOriginInput = document.getElementById("origin");
const routeDestinationInput = document.getElementById("destination");
const routePreferenceInputs = [...document.querySelectorAll("#route-form fieldset input")];
const routeOptionsContainer = document.getElementById("route-options");
const routeMapSvg = document.getElementById("route-map-svg");
const routePathLayer = document.getElementById("route-path-layer");
const routeMarkerLayer = document.getElementById("route-marker-layer");
const routeHazardLayer = document.getElementById("route-hazard-layer");
const routeMapLegend = document.getElementById("route-map-legend");
const routeDirectionsList = document.getElementById("route-directions-list");
const routeSummaryText = document.getElementById("route-summary-text");
const activeRouteChip = document.getElementById("active-route-chip");

const routeState = {
  hazards: [],
  choices: [],
  activeRouteId: null,
};

const labels = {
  map: "Safety Map",
  report: "Incident Report",
  sos: "SOS Center",
  gps: "GPS Safe Route",
  settings: "Settings",
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

function hashString(value) {
  let hash = 0;
  const normalized = String(value || "");
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function toPointFromSeed(seed, xShift = 0, yShift = 0) {
  const hash = hashString(seed);
  const x = 16 + ((hash % 7000) / 7000) * 68 + xShift;
  const y = 16 + (((Math.floor(hash / 7000) % 7000) / 7000) * 68 + yShift);
  return {
    x: Math.max(8, Math.min(92, x)),
    y: Math.max(8, Math.min(92, y)),
  };
}

function toPathString(points) {
  if (!points.length) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function buildCurveRoute(start, destination, bendStrength = 0) {
  const midpoint = {
    x: (start.x + destination.x) / 2,
    y: (start.y + destination.y) / 2,
  };
  const vector = {
    x: destination.x - start.x,
    y: destination.y - start.y,
  };
  const length = Math.max(Math.sqrt(vector.x * vector.x + vector.y * vector.y), 0.01);
  const normal = {
    x: -vector.y / length,
    y: vector.x / length,
  };
  const control = {
    x: midpoint.x + normal.x * bendStrength,
    y: midpoint.y + normal.y * bendStrength,
  };
  const points = [];
  const samples = 20;
  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const inv = 1 - t;
    const x = inv * inv * start.x + 2 * inv * t * control.x + t * t * destination.x;
    const y = inv * inv * start.y + 2 * inv * t * control.y + t * t * destination.y;
    points.push({ x, y });
  }
  return points;
}

function pointToSegmentDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    const px = point.x - start.x;
    const py = point.y - start.y;
    return Math.sqrt(px * px + py * py);
  }
  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy))
  );
  const projection = {
    x: start.x + t * dx,
    y: start.y + t * dy,
  };
  const px = point.x - projection.x;
  const py = point.y - projection.y;
  return Math.sqrt(px * px + py * py);
}

function computePathDistanceKm(points) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index].x - points[index - 1].x;
    const dy = points[index].y - points[index - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return Number((total * 0.34).toFixed(1));
}

function compassLabel(fromPoint, toPoint) {
  const angle = (Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x) * 180) / Math.PI;
  if (angle >= -22.5 && angle < 22.5) return "east";
  if (angle >= 22.5 && angle < 67.5) return "south-east";
  if (angle >= 67.5 && angle < 112.5) return "south";
  if (angle >= 112.5 && angle < 157.5) return "south-west";
  if (angle >= 157.5 || angle < -157.5) return "west";
  if (angle >= -157.5 && angle < -112.5) return "north-west";
  if (angle >= -112.5 && angle < -67.5) return "north";
  return "north-east";
}

function buildRouteSteps(route, originLabel, destinationLabel) {
  const points = route.points;
  const sectionSize = Math.max(4, Math.floor(points.length / 4));
  const checkpoints = [
    points[0],
    points[Math.min(points.length - 1, sectionSize)],
    points[Math.min(points.length - 1, sectionSize * 2)],
    points[Math.min(points.length - 1, sectionSize * 3)],
    points[points.length - 1],
  ];
  return [
    {
      instruction: `Head ${compassLabel(checkpoints[0], checkpoints[1])} from ${originLabel}.`,
      distance: `${Math.max(0.4, route.distanceKm * 0.22).toFixed(1)} km`,
      duration: `${Math.max(2, Math.round(route.etaMinutes * 0.2))} min`,
    },
    {
      instruction: `Continue on the ${route.riskLevel === "low" ? "well-lit" : "main"} corridor.`,
      distance: `${Math.max(0.6, route.distanceKm * 0.34).toFixed(1)} km`,
      duration: `${Math.max(3, Math.round(route.etaMinutes * 0.32))} min`,
    },
    {
      instruction:
        route.transitMode === "train"
          ? `Take ${route.transitLabel} for ${route.transitStops} stops.`
          : `Take ${route.transitLabel} for ${route.transitStops} stops.`,
      distance: `${Math.max(0.8, route.distanceKm * 0.3).toFixed(1)} km`,
      duration: `${Math.max(4, Math.round(route.etaMinutes * 0.3))} min`,
    },
    {
      instruction: `Walk ${compassLabel(checkpoints[3], checkpoints[4])} and arrive at ${destinationLabel}.`,
      distance: `${Math.max(0.2, route.distanceKm * 0.14).toFixed(1)} km`,
      duration: `${Math.max(2, Math.round(route.etaMinutes * 0.18))} min`,
    },
  ];
}

function riskClassName(riskLevel) {
  if (riskLevel === "low") return "low";
  if (riskLevel === "high") return "high";
  return "medium";
}

function computeRouteRisk(points, hazards, preferenceFlags) {
  let riskPoints = 0;
  hazards.forEach((hazard) => {
    let bestDistance = Infinity;
    for (let i = 1; i < points.length; i += 1) {
      const distance = pointToSegmentDistance(hazard, points[i - 1], points[i]);
      if (distance < bestDistance) bestDistance = distance;
    }
    if (bestDistance < 6) riskPoints += 35;
    else if (bestDistance < 10) riskPoints += 19;
    else if (bestDistance < 14) riskPoints += 10;
  });
  const preferenceBonus =
    (preferenceFlags.wellLit ? 8 : 0) +
    (preferenceFlags.avoidIsolated ? 7 : 0) +
    (preferenceFlags.avoidTraffic ? 4 : 0);
  const safetyScore = Math.max(5, Math.min(98, Math.round(100 - riskPoints + preferenceBonus)));
  const riskLevel = safetyScore >= 72 ? "low" : safetyScore >= 50 ? "medium" : "high";
  return { safetyScore, riskLevel };
}

function buildRouteChoices(originLabel, destinationLabel, preferenceFlags) {
  const from = toPointFromSeed(originLabel || "start", -3, 4);
  const to = toPointFromSeed(destinationLabel || "destination", 4, -5);
  routeState.hazards = [
    toPointFromSeed(`${originLabel}-hazard-1`, 0, -8),
    toPointFromSeed(`${destinationLabel}-hazard-2`, -9, 1),
    toPointFromSeed(`${originLabel}-${destinationLabel}-hazard-3`, 8, 5),
  ];
  const variants = [
    { id: "A", bend: 9, speedBias: 3, mode: "train", transit: "Train Green Line", stops: 4 },
    { id: "B", bend: -4, speedBias: 0, mode: "bus", transit: "Bus 22", stops: 5 },
    { id: "C", bend: 1, speedBias: -2, mode: "bus", transit: "Bus 7 Express", stops: 3 },
  ];

  const rawRoutes = variants.map((variant) => {
    const points = buildCurveRoute(from, to, variant.bend);
    const distanceKm = computePathDistanceKm(points);
    const baselineMinutes = Math.max(7, Math.round(distanceKm * 5.2));
    const etaMinutes = Math.max(6, baselineMinutes + variant.speedBias);
    const risk = computeRouteRisk(points, routeState.hazards, preferenceFlags);
    const speedScore = 100 - Math.max(0, etaMinutes - 8) * 5;
    const priorityScore = Math.round(risk.safetyScore * 0.7 + speedScore * 0.3);
    return {
      id: variant.id,
      title: `Route ${variant.id}`,
      points,
      distanceKm,
      etaMinutes,
      safetyScore: risk.safetyScore,
      riskLevel: risk.riskLevel,
      priorityScore,
      transitMode: variant.mode,
      transitLabel: variant.transit,
      transitStops: variant.stops,
    };
  });

  const riskWeight = { low: 0, medium: 1, high: 2 };
  const ranked = rawRoutes.sort((left, right) => {
    if (riskWeight[left.riskLevel] !== riskWeight[right.riskLevel]) {
      return riskWeight[left.riskLevel] - riskWeight[right.riskLevel];
    }
    if (right.priorityScore !== left.priorityScore) {
      return right.priorityScore - left.priorityScore;
    }
    return left.etaMinutes - right.etaMinutes;
  });

  ranked.forEach((route) => {
    route.steps = buildRouteSteps(route, originLabel, destinationLabel);
  });
  return { routes: ranked, from, to };
}

function renderRouteMap(activeRouteId, startPoint, destinationPoint) {
  if (!routePathLayer || !routeMarkerLayer || !routeHazardLayer) return;
  routeHazardLayer.innerHTML = routeState.hazards
    .map(
      (hazard) =>
        `<circle cx="${hazard.x.toFixed(2)}" cy="${hazard.y.toFixed(2)}" r="1.8" class="route-hazard-dot"></circle>`
    )
    .join("");

  routePathLayer.innerHTML = routeState.choices
    .map((route) => {
      const activeClass = route.id === activeRouteId ? "active" : "";
      return `<path data-route-id="${route.id}" class="route-svg-path ${riskClassName(route.riskLevel)} ${activeClass}" d="${toPathString(
        route.points
      )}"></path>`;
    })
    .join("");

  routeMarkerLayer.innerHTML = `
    <circle cx="${startPoint.x.toFixed(2)}" cy="${startPoint.y.toFixed(2)}" r="2.2" class="route-map-start"></circle>
    <circle cx="${destinationPoint.x.toFixed(2)}" cy="${destinationPoint.y.toFixed(2)}" r="2.2" class="route-map-end"></circle>
  `;
}

function renderRouteCards() {
  if (!routeOptionsContainer) return;
  if (!routeState.choices.length) {
    routeOptionsContainer.innerHTML = `<div class="route-empty-state">No routes available yet.</div>`;
    return;
  }

  routeOptionsContainer.innerHTML = routeState.choices
    .map((route, index) => {
      const isActive = route.id === routeState.activeRouteId;
      const badge = index === 0 ? `<span class="route-priority">Best safe + fast</span>` : "";
      return `
      <article class="route-option ${isActive ? "active" : ""}" data-route-id="${route.id}">
        <div class="route-option-head">
          <strong>${route.title}</strong>
          ${badge}
        </div>
        <small>${route.etaMinutes} min • ${route.distanceKm.toFixed(1)} km • ${route.riskLevel} risk</small>
        <small>Safety ${route.safetyScore}/100 • ${route.transitLabel}</small>
      </article>`;
    })
    .join("");
}

function renderDirections() {
  const activeRoute = routeState.choices.find((route) => route.id === routeState.activeRouteId);
  if (!activeRoute) {
    if (routeDirectionsList) {
      routeDirectionsList.innerHTML =
        '<li class="route-empty-state">Directions will appear here after selecting a route.</li>';
    }
    if (routeSummaryText) routeSummaryText.textContent = "Pick a route to see directions.";
    if (activeRouteChip) activeRouteChip.textContent = "No route selected";
    return;
  }

  if (activeRouteChip) {
    activeRouteChip.textContent = `${activeRoute.title} • ${activeRoute.etaMinutes} min`;
  }
  if (routeSummaryText) {
    routeSummaryText.textContent =
      `${activeRoute.riskLevel.toUpperCase()} risk • Safety ${activeRoute.safetyScore}/100 • ` +
      `${activeRoute.distanceKm.toFixed(1)} km`;
  }
  if (routeDirectionsList) {
    routeDirectionsList.innerHTML = activeRoute.steps
      .map(
        (step) => `
        <li>
          <span>${step.instruction}</span>
          <small>${step.distance} • ${step.duration}</small>
        </li>`
      )
      .join("");
  }
}

function selectRoute(routeId) {
  if (!routeState.choices.some((route) => route.id === routeId)) return;
  routeState.activeRouteId = routeId;
  const activeRoute = routeState.choices.find((route) => route.id === routeId);
  if (routeMapLegend && activeRoute) {
    routeMapLegend.textContent = `${activeRoute.title} selected: ${activeRoute.transitLabel}, ${activeRoute.etaMinutes} min, ${activeRoute.riskLevel} risk.`;
  }
  const startPoint = routeState.choices[0]?.points[0];
  const destinationPoint = routeState.choices[0]?.points[routeState.choices[0].points.length - 1];
  if (startPoint && destinationPoint) {
    renderRouteMap(routeId, startPoint, destinationPoint);
  }
  renderRouteCards();
  renderDirections();
}

function generateAndRenderRoutes() {
  const originText = routeOriginInput?.value.trim();
  const destinationText = routeDestinationInput?.value.trim();
  if (!originText || !destinationText) {
    showToast("Please provide both start and destination.");
    return false;
  }

  const preferences = {
    wellLit: Boolean(routePreferenceInputs[0]?.checked),
    avoidIsolated: Boolean(routePreferenceInputs[1]?.checked),
    avoidTraffic: Boolean(routePreferenceInputs[2]?.checked),
  };
  const generated = buildRouteChoices(originText, destinationText, preferences);
  routeState.choices = generated.routes;
  routeState.activeRouteId = generated.routes[0]?.id || null;
  renderRouteMap(routeState.activeRouteId, generated.from, generated.to);
  renderRouteCards();
  renderDirections();
  if (routeState.activeRouteId) {
    selectRoute(routeState.activeRouteId);
  }
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
  });
});

routeOptionsContainer?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const card = target.closest(".route-option");
  if (!(card instanceof HTMLElement)) return;
  const routeId = card.dataset.routeId;
  if (routeId) {
    selectRoute(routeId);
  }
});

document.getElementById("report-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.target.reset();
  document
    .querySelectorAll("#incident-chip-row .chip")
    .forEach((chip, idx) => chip.classList.toggle("active", idx === 0));
  showToast((copy[languageSelect.value] || copy.en).reportSent);
});

routeForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const generated = generateAndRenderRoutes();
  if (generated) {
    showToast((copy[languageSelect.value] || copy.en).routeReady);
  }
});

routePathLayer?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof SVGPathElement)) return;
  const routeId = target.dataset.routeId;
  if (routeId) selectRoute(routeId);
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

document
  .querySelector("[data-action='silent-sos']")
  .addEventListener("click", () =>
    showToast((copy[languageSelect.value] || copy.en).sosBroadcasted)
  );

document
  .querySelector("[data-action='alerts-center']")
  .addEventListener("click", () => showToast((copy[languageSelect.value] || copy.en).nearbyAlerts));

document
  .querySelector("[data-action='upload-proof']")
  .addEventListener("click", () =>
    showToast((copy[languageSelect.value] || copy.en).uploadProof)
  );

themeSelect.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeSelect.value === "dark");
});

languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
});

applyLanguage("en");

if (routeOriginInput && routeDestinationInput) {
  if (!routeOriginInput.value.trim()) routeOriginInput.value = "Current Location";
  if (!routeDestinationInput.value.trim()) routeDestinationInput.value = "City Center";
  generateAndRenderRoutes();
}
