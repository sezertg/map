import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
import 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js';
import 'https://unpkg.com/@turf/turf@6/turf.min.js';

export let map;
let markersLayer;
let routingControl = null;
let passedMarkerLayer = null;


const listeners = {
  distanceChanged: null,
  stationsPassed: null
};

export function onDistanceChanged(callback) {
  listeners.distanceChanged = callback;
}

function emitDistanceChanged(distanceKm) {
  if (typeof listeners.distanceChanged === 'function') {
    listeners.distanceChanged(distanceKm);
  }
}

export function onStationsPassed(callback) {
  listeners.stationsPassed = callback;
}

function emitStationsPassed(data) {
  if (typeof listeners.stationsPassed === 'function') {
    listeners.stationsPassed(data);
  }
}


export function createMap(mapContainer) {
  map = L.map(mapContainer, {
    center: [39.2, 35],
    zoom: 6,
    minZoom: 6,
    zoomControl: false,
    dragging: true,
    maxBounds: [[35.0, 20],[43.0, 50.0]],
    maxBoundsViscosity: 1.0
  });

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZHJ4cnRnIiwiYSI6ImNtYXA3dDhyYzBjZmsybHIwcXNqenBsNnkifQ.MsFlHaEsTKKtfHab4lS1NA', {
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    attribution: '&copy; Mapbox &copy; OpenStreetMap contributors'
  }).addTo(map);

  map.doubleClickZoom.disable();
  map.on('contextmenu', function(e) {
    e.originalEvent.preventDefault();
  });
}

export function updateMap(currentStations = null, currentMode = null, selectedRow = null, selectedCol = null) {
  if (!currentStations) return;

  if (markersLayer) {
    map.removeLayer(markersLayer);
  }

  markersLayer = L.layerGroup().addTo(map);

  const stations = currentStations.istasyon_sirasi;
  const coordinates = currentStations.koordinat;

  if (!coordinates || coordinates.length === 0) return;
  if (selectedRow === null || selectedCol === null) return;

  if (!coordinates[selectedRow]) return;
  const startCoords = coordinates[selectedRow][0];
  if (!startCoords) return;

  const greenIcon = L.icon({
    iconUrl: 'src/assets/markers/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  const redIcon = L.icon({
    iconUrl: 'src/assets/markers/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  const startMarker = L.marker(startCoords, {
      draggable: false,
      icon: greenIcon
    }).addTo(markersLayer);

  if (!currentMode) {
    const endCoords = coordinates[selectedCol][0];
    if (!endCoords) return;
    const endMarker = L.marker(endCoords, {
      draggable: false,
      icon: redIcon
    }).addTo(markersLayer);
    startMarker.bindTooltip(`Giriş: ${stations[selectedRow]}`).openTooltip();
    endMarker.bindTooltip(`Çıkış: ${stations[selectedCol]}`).openTooltip();

    const group = new L.featureGroup([startMarker, endMarker]);
    map.fitBounds(group.getBounds().pad(0.2));
  } else {
    startMarker.bindTooltip(`Tek Geçiş: ${stations[selectedRow]}`).openTooltip();
    map.setView(startCoords, 13);
  }
}

export function createRoute(coordinates, fromName='İlk Nokta', toName='Son Nokta', waypointNames=[], stationsData = null, vehicle = 1) {
  // Eski rotaları temizle
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  if (passedMarkerLayer) {
    map.removeLayer(passedMarkerLayer);
    passedMarkerLayer = null;
  }

  // "lat,lng" stringlerini {latLng: L.latLng, isOriginal: true} objesine çevir
  const waypoints = coordinates.map(coord => {
    const [lat, lng] = coord.split(',').map(Number);
    return {
      latLng: L.latLng(lat, lng),
      isOriginal: true
    };
  });

  const greenIcon = L.icon({
    iconUrl: 'src/assets/markers/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  const redIcon = L.icon({
    iconUrl: 'src/assets/markers/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  const grayIcon = L.icon({
    iconUrl: 'src/assets/markers/marker-icon-grey.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  const blueIcon = L.icon({
    iconUrl: 'src/assets/markers/marker-icon-blue.png', // Mavi ikon dosyan olmalı
    iconSize: [13, 20],
    iconAnchor: [6, 20],
    popupAnchor: [1, -17]
  });

  routingControl = L.Routing.control({
    waypoints,
    router: L.Routing.mapbox('pk.eyJ1IjoiZHJ4cnRnIiwiYSI6ImNtYXA3dDhyYzBjZmsybHIwcXNqenBsNnkifQ.MsFlHaEsTKKtfHab4lS1NA', {
    profile: 'mapbox/driving',
    language: 'tr',
    serviceUrl: 'https://api.mapbox.com/directions/v5'
  }),
    lineOptions: {
      styles: [
        { color: 'black', opacity: 0.15, weight: 9 },
        { color: 'white', opacity: 0.8, weight: 6 },
        { color: 'green', opacity: 1, weight: 2 }
      ]
    },
    showAlternatives: false,
    fitSelectedRoutes: true,
    addWaypoints: true,
    routeWhileDragging: false,
    draggableWaypoints: true,
    createMarker: function(i, wp, nWps) {
      let icon;
      let popupText;
      let draggable;

      if (wp.isOriginal) {
        draggable = false;
        if (i === 0) {
          icon = greenIcon;
          popupText = `Çıkış: ${fromName}`;
        } else if (i === nWps - 1) {
          icon = redIcon;
          popupText = `Varış: ${toName}`;
        } else {
          icon = grayIcon;
          popupText = `Uğrama ${i}: ${waypointNames[i - 1] || 'İsim yok'}`;
        }
      } else {
        draggable = true;
        icon = blueIcon;
        popupText = `Kullanılacak Yol ${i} ${wp.latLng.lat.toFixed(5)},${wp.latLng.lng.toFixed(5)}`;
      }

      const marker =  L.marker(wp.latLng, {
        icon,
        draggable: draggable
      }).bindPopup(popupText);

      if (!wp.isOriginal) {
        marker.on('contextmenu', (e) => {
          const wps = routingControl.getWaypoints();
          wps.splice(i, 1);
          routingControl.setWaypoints(wps);
        });
      }
      return marker;
    }
  }).addTo(map);
  

  routingControl.on('routesfound', function(e) {
    const routes = e.routes
    const route = routes[0];
    const distanceKm = (route.summary.totalDistance / 1000).toFixed(2);
    emitDistanceChanged(distanceKm);

    if (passedMarkerLayer) {
      map.removeLayer(passedMarkerLayer);
      passedMarkerLayer = null;
    }

    // Rota koordinatları: turf için [lng, lat] dizisi lazım
    const turfCoords = route.coordinates.map(c => [c.lng, c.lat]);

    passedMarkerLayer = L.layerGroup().addTo(map);

    if (stationsData) {
      let stationText;
      // Turf line string oluştur
      const turfLine = turf.lineString(turfCoords);
      const passedStations = [];
      stationsData.forEach((station) => {
        station.koordinat.forEach((coordPair, index) => {
          coordPair.forEach((center, pointIndex) => {
            const point = turf.point([center[1], center[0]]);
            const tolerans = station.tolerans[index] || 10;
            const dist = turf.pointToLineDistance(point, turfLine, { units: 'meters' });
            
            if (dist <= tolerans) {
              passedStations.push({
                station,
                index,
                center,
                pointIndex,
                dist
              });
            }
          });
        });
      });

      if (passedStations.length > 0) {
        const line = turf.lineString(turfCoords); // rota
        const passedStationsSorted = passedStations.slice().sort((a, b) => {
          const alongA = turf.nearestPointOnLine(line, turf.point([a.center[1], a.center[0]]), { units: 'meters' });
          const alongB = turf.nearestPointOnLine(line, turf.point([b.center[1], b.center[0]]), { units: 'meters' });
          return alongA.properties.location - alongB.properties.location;
        });

        const stationPayments = [];
        let oldStationId = null;
        let oldIndex = null;
        let oldStationName = null;

        passedStationsSorted.forEach(passed => {
          const { station, index, center } = passed;
          const stationName = station.istasyon_sirasi[index]

          let markerColor = 'yellow'; // varsayılan: giriş
          let costs = [];

          if (station.tek_gecis[index]) {
            stationText = `(Tek Geçiş)`;
            markerColor = 'cyan';
            for (let vehicleIndex = 1; vehicleIndex <= 6; vehicleIndex++) {
              const cost = station.ucret[vehicleIndex][index][0];
              costs.push(cost);
            }
            stationPayments.push({
              from: stationName,
              to: null,
              vehicle: vehicle-1,
              prices: costs
            });

          } else {
            if (oldStationId === station.id) {
              stationText = `(Çıkış)`;
              markerColor = 'green';
              for (let vehicleIndex = 1; vehicleIndex <= 6; vehicleIndex++) {
                const cost = station.ucret[vehicleIndex][oldIndex][index];
                costs.push(cost);
              }
              stationPayments.push({
                from: oldStationName,
                to: stationName,
                vehicle: vehicle-1,
                prices: costs
              });

              oldStationId = null;
              oldIndex = null;
              oldStationName = null;
            } else {
              stationText = `(Giriş)`;
              oldStationId = station.id;
              oldIndex = index;
              oldStationName = stationName;
            }
          }

          const marker = L.circleMarker(center, {
            radius: 10,
            color: markerColor,
            fillOpacity: 0.8,
            weight: 4
          }).addTo(passedMarkerLayer);

          marker.bindTooltip(`${station.isim} ${station.istasyon_sirasi[index]} Gişesi ${stationText}`);
        });
        emitStationsPassed(stationPayments);
      }
    }
  });
}
