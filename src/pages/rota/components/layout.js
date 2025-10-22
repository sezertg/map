// Copyright (c) 2025 Sezer Tığ
// All rights reserved.
// This file may not be reproduced, distributed, or transmitted
// without the prior written permission of the author.

import { createElement } from '../../../utils/dom.js';
import { createMap, createRoute, onDistanceChanged, onStationsPassed } from '../../../components/map/map.js';
import { setupAutoComplete } from './autocomplete.js';
import { locationData, jsonData } from '../../../services/db.js';
import { extractSearchListWithCoordinates } from '../utils/extract.js';

let fuelPriceGlobal = 0;
let sidebarVisible = true;
let vehicleValueGlobal = 4;
let vehicleSpeedGlobal = 60;
let fuelBurnGlobal = 30;
let fromInputGlobal = null;
let fromCoordGlobal = null
let toInputGlobal = null;
let toCoordGlobal = null
let waypointListGlobal = null;
let waypointCoordsGlobal = null;
let passedStationsGlobal = [];
let maxBurnGlobal = 50;
let minBurnGlobal = 1;
let maxSpeedGlobal = 300;
let minSpeedGlobal = 30;

export function createMain() {  
    const cityList = extractSearchListWithCoordinates(locationData);
    let passedStations = [];
    
    if (fuelPriceGlobal == 0){
        fetchFuelPriceWithBackup().then(fiyat => {
            fuelPriceGlobal = fiyat
            updateAllBoxes();
        });
    }
    

    const {
        fromInput,
        waypointList,
        toInput,
        addBtn,
        routesBtn,
        vehicleSelect,
        speedInput,
        burnInput,
        sidebar,
    } = createSidebar(cityList);

    const {
        fuelText,
        fromText,
        toText,
        distanceText,
        etaBreakText,
        etaText,
        vehicleText,
        speedText,
        burnText,
        totalStationText,
        totalFuelText,
        totalPriceText,
        routeBox,
        infoBoxContainer,
        stationsBox
    } = createInfoBox();

    const { legendBox } = createLegendBox();

    fromInput.onchange = () => {
        fromCoordGlobal = fromInput.getAttribute('data-coordinate');
        if (fromCoordGlobal != null){
            fromInputGlobal = fromInput.value; 
            //updateAllBoxes(); 
        }
    }
    toInput.onchange = () => {
        toCoordGlobal = toInput.getAttribute('data-coordinate');
        if (toCoordGlobal != null){
            toInputGlobal = toInput.value; 
            //updateAllBoxes();
        }
     }
        
    const toggleBtn = createElement('button', { class: 'sidebar-toggle', 'aria-label': 'Toggle Sidebar' }, ['☰']);

    const mapContainer = createElement('div', { class: 'routes-map' }, [
        sidebar,
        toggleBtn,
        infoBoxContainer,
        legendBox
    ]);

    const tableData = createElement('div', { class: 'table-data' }, [
        createElement('div', { class: 'data-1' }, [mapContainer])
    ]);

    if (sidebarVisible) {
        sidebar.classList.remove('collapsed'); // göster
    } else {
        sidebar.classList.add('collapsed'); // gizle
    }

    toggleBtn.onclick = () => {
        sidebar.classList.toggle('collapsed');
        if (sidebarVisible){
            sidebarVisible = false;
        }else{
            sidebarVisible = true;
        }
        saveGlobalsToStorage();
    };

    addBtn.onclick = () => {
        waypointList.appendChild(createWaypointInput());
    };

    let distance = 0;
    
    routesBtn.onclick = () => {
        const fromCoord = fromInput.getAttribute('data-coordinate');
        const toCoord = toInput.getAttribute('data-coordinate');
        const waypointInputs = Array.from(waypointList.querySelectorAll('input.waypoint-input'));
        passedStations = [];

        const waypointCoords = waypointInputs
            .map(i => ({
                coord: i.getAttribute('data-coordinate'),
                name: i.value.trim()
            }))
            .filter(i => i.coord);

        const waypointNames = waypointCoords.map(wp => wp.name);

        if (fromCoord && toCoord) {
            const allCoords = [
                fromCoord,
                ...waypointCoords.map(wp => wp.coord),
                toCoord
            ];

            createRoute(allCoords,fromInput.value, toInput.value, waypointNames, jsonData, vehicleValueGlobal);
            onDistanceChanged((distanceKm) => {
                distance = distanceKm;
                updateAllBoxes();
            });
            
            
            onStationsPassed((stations) => {
                passedStations = stations;
                updateAllBoxes();
            });

        } else {
            alert('Lütfen hem çıkış hem de varış noktası seçin.');
        }
    };

    function createWaypointInput() {
        const input = createElement('input', { type: 'text', placeholder: 'Ara Nokta', class: 'waypoint-input' });
        const removeBtn = createElement('button', { type: 'button', class: 'remove-point bx bx-trash' });

        removeBtn.onclick = () => {
            waypointList.removeChild(wrapper);
        };

        const wrapper = createElement('div', { class: 'waypoint-wrapper' }, [input, removeBtn]);
        setupAutoComplete(input, cityList);
        return wrapper;
    }
    
    vehicleSelect.onchange = () => {
        if (vehicleSelect.value <= 1 || vehicleSelect.value == 6){
            maxBurnGlobal = 18;
            minBurnGlobal = 2;
        }else if(vehicleSelect.value == 2){
            maxBurnGlobal = 24;
            minBurnGlobal = 12;
        }else if(vehicleSelect.value == 3){
            maxBurnGlobal = 30;
            minBurnGlobal = 20;
        }else if(vehicleSelect.value == 4){
            maxBurnGlobal = 40;
            minBurnGlobal = 30;
        }else{
            maxBurnGlobal = 50;
            minBurnGlobal = 40;
        }
        if (burnInput.value > maxBurnGlobal){
            burnInput.value = (maxBurnGlobal+minBurnGlobal)/2;
        }else if (burnInput.value < minBurnGlobal){
            burnInput.value = (maxBurnGlobal+minBurnGlobal)/2;
        }
        burnInput.max = maxBurnGlobal;
        burnInput.min = minBurnGlobal;
        fuelBurnGlobal = burnInput.value;
        vehicleValueGlobal = vehicleSelect.value;  
        updateAllBoxes(); 
    };

    speedInput.onchange = () => {

        if (speedInput.value > maxSpeedGlobal){
            speedInput.value = maxSpeedGlobal;
        }else if (speedInput.value < minSpeedGlobal){
            speedInput.value = minSpeedGlobal;
        }
        vehicleSpeedGlobal = speedInput.value;
        updateAllBoxes(); 
    };

    burnInput.onchange = () => {

        if (burnInput.value > maxBurnGlobal){
            burnInput.value = maxBurnGlobal;
        }else if (burnInput.value < minBurnGlobal){
            burnInput.value = minBurnGlobal;
        }
        fuelBurnGlobal = burnInput.value;
        updateAllBoxes();
    };

    setupAutoComplete(fromInput, cityList);
    setupAutoComplete(toInput, cityList);

    function updateAllBoxes() {
        const waypoints = Array.from(waypointList.querySelectorAll('input.waypoint-input')).map(i => i.value.trim()).filter(v => v.length > 0);
        updateInfoBox(stationsBox, fuelText, fromText, toText, distanceText, etaBreakText, etaText, vehicleText, speedText, routeBox, burnText, totalStationText, totalFuelText, totalPriceText, fuelPriceGlobal, fromInput.value, toInput.value, distance, vehicleSelect[vehicleValueGlobal-1], speedInput.value, burnInput.value, waypoints, passedStations);
        saveGlobalsToStorage();
    }

    requestAnimationFrame(
        () => createMap(mapContainer)
    );

    updateAllBoxes();
    return tableData;

}

function createSidebar(cityList) {
    const title = createElement('h3', {}, ['📍 Rota Ayarları']);
    
    const fromInput = createElement('input', { type: 'text', placeholder: 'Çıkış Noktası', class: 'waypoint-input' });
    fromInput.value = fromInputGlobal;
    fromInput.setAttribute('data-coordinate', fromCoordGlobal);
    const fromRow = createElement('div', {style: 'position: relative;'}, [fromInput]);

    const waypointList = createElement('div', { class: 'waypoint-list' });

    const toInput = createElement('input', { type: 'text', placeholder: 'Varış Noktası', class: 'waypoint-input' });
    toInput.value = toInputGlobal;
    toInput.setAttribute('data-coordinate', toCoordGlobal);
    const toRow = createElement('div', {style: 'position: relative;'}, [toInput]);

    const addBtn = createElement('button', { type: 'button', class: 'add-waypoint' }, ['➕ Nokta Ekle']);
    const routesBtn = createElement('button', { type: 'button', class: 'route-create' }, ['Rota Oluştur']);

    const title2 = createElement('h3', {}, ['🚛 Araç Bilgisi']);

    const vehicleTypes = [
        { value: 1, label: 'Sınıf 1 (2 akslı Otomobil vb.)', text: 'Otomobil' },
        { value: 2, label: 'Sınıf 2 (2 akslı Kamyonet vb.)', text: 'Kamyonet' },
        { value: 3, label: 'Sınıf 3 (3 akslı Kamyon vb.)', text: 'Kamyon' },
        { value: 4, label: 'Sınıf 4 (4-5 akslı Tır vb.)', text: 'Tır' },
        { value: 5, label: 'Sınıf 5 (6+ akslı Çift Dorse vb.)', text: 'Treyler' },
        { value: 6, label: 'Sınıf 6 (Motosiklet)', text: 'Motosiklet' }
    ];

    const vehicleSelect = createElement('select', { class: 'vehicle-list' }, vehicleTypes.map(type => createElement('option', { value: type.value, label: type.label, textContent: type.text })));
    vehicleSelect.value = vehicleValueGlobal;
    const vehicleLabel = createElement('label', {}, ['Araç Tipi:']);
    const vehicleRow = createElement('div', { class: 'form-row' }, [vehicleLabel, vehicleSelect]);

    const speedLabel = createElement('label', {}, ['Araç Hızı km/s:']);
    const speedInput = createElement('input', { type: 'number', value: vehicleSpeedGlobal, step: '1', min: minSpeedGlobal, max: maxSpeedGlobal });
    const speedRow = createElement('div', { class: 'form-row' }, [speedLabel, speedInput]);

    const burnLabel = createElement('label', {}, ['Yakıt Tüketimi (lt/100km):']);
    const burnInput = createElement('input', { type: 'number', value: fuelBurnGlobal, step: '1', min: minBurnGlobal, max: maxBurnGlobal  });
    const burnRow = createElement('div', { class: 'form-row' }, [burnLabel, burnInput]);

    const sidebar = createElement('div', { class: 'map-sidebar' }, [title, fromRow, waypointList, toRow, addBtn, routesBtn, title2, vehicleRow, speedRow, burnRow]);

    return {
        fromInput,
        waypointList,
        toInput,
        addBtn,
        routesBtn,
        vehicleSelect,
        speedInput,
        burnInput,
        sidebar,
    };
}


function createInfoBox(){
    const fuelIcon = createElement('i', { class: 'bx bx-gas-pump' });
    const fuelText = createElement('span', {}, ['Yakıt Fiyatı: 50.50₺']);
    const fuelRow = createElement('div', { class: 'info-row' }, [fuelIcon, fuelText]);

    const fromIcon = createElement('i', { class: 'bx bx-map' });
    const fromText = createElement('span', { class: 'from-text' }, ['Çıkış Noktası: -']);
    const fromRow = createElement('div', { class: 'info-row' }, [fromIcon, fromText]);

    const toIcon = createElement('i', { class: 'bx bx-flag' });
    const toText = createElement('span', { class: 'to-text' }, ['Varış Noktası: -']);
    const toRow = createElement('div', { class: 'info-row to-row' }, [toIcon, toText]);

    const distanceIcon = createElement('i', { class: 'bx bx-ruler' });
    const distanceText = createElement('span', { class: 'distance-text' }, ['Mesafe: 0 km']);
    const distanceRow = createElement('div', { class: 'info-row' }, [distanceIcon, distanceText]);

    const etaBreakIcon = createElement('i', { class: 'bx bx-coffee' });
    const etaBreakText = createElement('span', { class: 'eta-break-text' }, ['Dinlenme Süresi: -']);
    const etaBreakRow = createElement('div', { class: 'info-row break-row' }, [etaBreakIcon, etaBreakText]);

    const etaIcon = createElement('i', { class: 'bx bx-time' });
    const etaText = createElement('span', { class: 'eta-text' }, ['Tahmini Varış: -']);
    const etaRow = createElement('div', { class: 'info-row' }, [etaIcon, etaText]);

    const vehicleIcon = createElement('i', { class: 'bx bx-car' });
    const vehicleText = createElement('span', { class: 'vehicle-text' }, ['Araç Tipi: -']);
    const vehicleRow = createElement('div', { class: 'info-row' }, [vehicleIcon, vehicleText]);

    const speedIcon = createElement('i', { class: 'bx bx-tachometer' });
    const speedText = createElement('span', { class: 'speed-text' }, ['Araç Hızı: 0']);
    const speedRow = createElement('div', { class: 'info-row' }, [speedIcon, speedText]);

    const burnIcon = createElement('i', { class: 'bx bxs-flame' });
    const burnText = createElement('span', { class: 'burn-text' }, ['Yakıt Tüketimi: 0 km/s']);
    const burnRow = createElement('div', { class: 'info-row' }, [burnIcon, burnText]);

    const totalStationIcon = createElement('i', { class: 'bx bx-station' });
    const totalStationText = createElement('span', { class: 'station-text' }, ['İstasyon Maliyeti: 0 ₺']);
    const totalStationRow = createElement('div', { class: 'info-row' }, [totalStationIcon, totalStationText]);

    const totalFuelIcon = createElement('i', { class: 'bx bxs-credit-card' });
    const totalFuelText = createElement('span', { class: 'burn-text' }, ['Yakıt Maliyeti: 0 ₺']);
    const totalFuelRow = createElement('div', { class: 'info-row' }, [totalFuelIcon, totalFuelText]);
    
    const totalPriceIcon = createElement('i', { class: 'bx bx-receipt' });
    const totalPriceText = createElement('span', { class: 'total-text' }, ['Toplam Maliyet: 0 ₺']);
    const totalPriceRow = createElement('div', { class: 'info-row' }, [totalPriceIcon, totalPriceText]);


    const fuelBox = createElement('div', { class: 'info-box fuel-box' }, [fuelRow]);
    const routeBox = createElement('div', { class: 'info-box route-box' }, [fromRow, toRow, distanceRow, etaBreakRow,etaRow]);
    const vehicleBox = createElement('div', { class: 'info-box vehicle-box' }, [vehicleRow, speedRow, burnRow]);
    const stationsBox = createElement('div', { class: 'info-box stations-box' , id: 'station_prices' }, []);
    const priceBox = createElement('div', { class: 'info-box price-box' }, [totalStationRow, totalFuelRow, totalPriceRow]);

    const infoBoxContainer = createElement('div', { class: 'info-box-container' }, [fuelBox, routeBox, vehicleBox, stationsBox, priceBox]);

    return {
        fuelText,
        fromText,
        toText,
        distanceText,
        etaBreakText,
        etaText,
        vehicleText,
        speedText,
        burnText,
        totalStationText,
        totalFuelText,
        totalPriceText,
        routeBox,
        infoBoxContainer,
        stationsBox
    };

}

function createLegendBox() {
    const entry = (color, label) =>
        createElement('div', { class: 'legend-entry' }, [
            createElement('span', {
                style: `display:inline-block;width:12px;height:12px;background:${color};border-radius:50%;border:1px solid #000;margin-right:6px;`
            }),
            document.createTextNode(label)
        ]);

    const legendBox = createElement('div', { class: 'legend-box' }, [
        entry('yellow', 'Giriş Gişesi'),
        entry('green', 'Çıkış Gişesi'),
        entry('cyan', 'Tek Geçiş')
    ]);

    return {legendBox};
}

// Yardımcı fonksiyon: Dakikayı saat ve dakika olarak formatlar
function formatMinutesToHMS(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  
  if (h > 0 && m > 0) return `${h} saat ${m} dakika`;
  if (h > 0) return `${h} saat`;
  if (m > 0) return `${m} dakika`;
  return '-';
}
// Mola sürelerini hesaplayan fonksiyon (saat cinsinden mola toplamını da döner)
function calculateBreaks(eta) {
  const shortBreaksCount = Math.floor(eta / 4.48);
  const longBreaksCount = Math.floor(eta / 23.58);

  const shortBreakDurationMinutes = 45;
  const longBreakDurationMinutes = 8 * 60;

  const totalShortBreakMinutes = shortBreaksCount * shortBreakDurationMinutes;
  const totalLongBreakMinutes = longBreaksCount * longBreakDurationMinutes;

  const totalBreakMinutes = totalShortBreakMinutes + totalLongBreakMinutes;

  return {
    shortBreaksCount,
    longBreaksCount,
    totalShortBreakMinutes,
    totalLongBreakMinutes,
    totalBreakMinutes
  };
}

// updateInfoBox fonksiyonu
function updateInfoBox(stationsBox, fuelText, fromText, toText, distanceText, etaBreakText, etaText, vehicleText, speedText, routeBox, burnText, totalStationText, totalFuelText, totalPriceText, fuel, from, to, distance, vehicleType, speed, burn, waypoints, passedStations = [] ) {
  let eta = distance / speed; // Saat cinsinden tahmini sürüş süresi

    // İndirme süresi: her ara nokta için 2 saat
  let downloadingDuration = waypoints.length * 2; // saat

  // Mola sürelerini hesapla
  let breaks = calculateBreaks(eta + downloadingDuration);

  // Toplam süre: sürüş + mola + indirme
  let totalDuration = eta + (breaks.totalBreakMinutes / 60) + downloadingDuration;

  // Saat ve dakika olarak formatla
  let etaFormatted = formatMinutesToHMS(Math.round(totalDuration * 60));
  let totalBreakFormatted = formatMinutesToHMS(breaks.totalBreakMinutes);
  let downloadingFormatted = formatMinutesToHMS(downloadingDuration * 60);



  //let shortBreaksStr = `${breaks.shortBreaksCount} × 45 dk = ${formatMinutesToHMS(breaks.totalShortBreakMinutes)}`;
  //let longBreaksStr = `${breaks.longBreaksCount} × 11 saat = ${formatMinutesToHMS(breaks.totalLongBreakMinutes)}`;

  // Yakıt ve maliyet hesapları
  let totalFuelCost = ((burn * distance / 100) * fuel) / 1.2;
  let totalStationCost = 0;

  stationsBox.innerHTML = '';
  passedStations.forEach(st => {
    let cost = st.prices[vehicleType.value - 1];
    if (cost > 0) {
      let totalStationIcon = createElement('i', { class: 'bx bx-station' });
      let totalStationText = createElement('span', { class: 'station-text' }, [st.from + ' - ' + st.to + ' : ' + cost + ' ₺']);
      if (st.to == null) {
        totalStationText = createElement('span', { class: 'station-text' }, [st.from + ' : ' + cost + ' ₺']);
      }
      let totalStationRow = createElement('div', { class: 'info-row' }, [totalStationIcon, totalStationText]);
      stationsBox.append(totalStationRow);
      totalStationCost += cost;
    }
  });

  totalStationCost = totalStationCost / 1.2;
  let totalPriceCost = totalFuelCost + totalStationCost;

  let totalFuelString = parseFloat(totalFuelCost.toFixed(0)).toLocaleString();
  let totalStationString = parseFloat(totalStationCost.toFixed(0)).toLocaleString();
  let totalPriceString = parseFloat(totalPriceCost.toFixed(0)).toLocaleString();
  let fuelString = parseFloat((fuel / 1.2).toFixed(2)).toLocaleString();

  fuelText.textContent = `Yakıt Fiyatı: ${fuelString || 0} ₺ kdv'siz`;
  fromText.textContent = `Çıkış Noktası: ${from || '-'}`;
  toText.textContent = `Varış Noktası: ${to || '-'}`;
  distanceText.textContent = `Mesafe: ${distance || 0} km`;
  etaBreakText.innerHTML = `Dinlenme Süresi: ${totalBreakFormatted}`;
  etaText.innerHTML = `Tahmini Varış Süresi: ${etaFormatted}`;
  vehicleText.textContent = `Araç Tipi: ${vehicleType.textContent}`;
  speedText.textContent = `Araç Hızı: ${speed} km/s`;
  burnText.textContent = `Yakıt Tüketimi: ${burn} lt/100km`;
  totalFuelText.textContent = `Yakıt Maliyeti: ${totalFuelString || 0} ₺ kdv'siz`;
  totalStationText.textContent = `Otoyol Maliyeti: ${totalStationString || 0} ₺ kdv'siz`;
  totalPriceText.textContent = `Toplam Maliyet: ${totalPriceString || 0} ₺ kdv'siz`;

  // Waypoint (ara noktalar) listesini güncelle
  const oldWaypointRows = routeBox.querySelectorAll('.dynamic-row');
  oldWaypointRows.forEach(row => row.remove());

  const insertBeforeEl = routeBox.querySelector('.to-row');
  const insertBeforeBreak = routeBox.querySelector('.break-row');
  if (waypoints.length > 0) {
    waypoints.forEach(wp => {
      const icon = createElement('i', { class: 'bx bx-dots-horizontal-rounded' });
      const text = createElement('span', {}, [`Ara Nokta: ${wp}`]);
      const row = createElement('div', { class: 'info-row dynamic-row' }, [icon, text]);
      routeBox.insertBefore(row, insertBeforeEl);
    });
    const downloadTimeIcon = createElement('i', { class: 'bx bx-download' });
    const downloadTimeText = createElement('span', { class: 'eta-download-text' }, [`Nokta İndirme Süresi: ${downloadingFormatted}`]);
    const downloadTimeRow = createElement('div', { class: 'info-row dynamic-row' }, [downloadTimeIcon, downloadTimeText]);
    routeBox.insertBefore(downloadTimeRow, insertBeforeBreak);
  }
}


async function fetchFuelPriceWithBackup() {
  try {
    const backupResponse = await fetch('https://hasanadiguzel.com.tr/api/akaryakit/sehir=TEKIRDAG');
    if (!backupResponse.ok) throw new Error('Yedek kaynak alınamadı');
    const backupData = await backupResponse.json();
    const key = Object.keys(backupData.data)[0];
    return parseFloat(backupData.data[key]["Motorin(Eurodiesel)_TL/lt"].replace(',', '.'));
  } catch (backupError) {
    console.error('Yedek kaynak da alınamadı:', backupError.message);
    return null;
  }
}

function saveGlobalsToStorage() {
  const data = {
    sidebarVisible,
    vehicleValueGlobal,
    vehicleSpeedGlobal,
    fuelBurnGlobal,
    fromInputGlobal,
    fromCoordGlobal,
    toInputGlobal,
    toCoordGlobal,
    waypointListGlobal,
    waypointCoordsGlobal,
    passedStationsGlobal,
    maxBurnGlobal,
    minBurnGlobal
  };
  localStorage.setItem('routeGlobals', JSON.stringify(data));
}


function loadGlobalsFromStorage() {
  const stored = localStorage.getItem('routeGlobals');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      sidebarVisible = data.sidebarVisible ?? true;
      vehicleValueGlobal = data.vehicleValueGlobal ?? 4;
      vehicleSpeedGlobal = data.vehicleSpeedGlobal ?? 60;
      fuelBurnGlobal = data.fuelBurnGlobal ?? 30;
      fromInputGlobal = data.fromInputGlobal ?? null;
      fromCoordGlobal = data.fromCoordGlobal ?? null;
      toInputGlobal = data.toInputGlobal ?? null;
      toCoordGlobal = data.toCoordGlobal ?? null;
      waypointListGlobal = data.waypointListGlobal ?? null;
      waypointCoordsGlobal = data.waypointCoordsGlobal ?? null;
      passedStationsGlobal = data.passedStationsGlobal ?? [];
      maxBurnGlobal = data.maxBurnGlobal ?? 50;
      minBurnGlobal = data.minBurnGlobal ?? 1;
    } catch (e) {
      console.error('LocalStorage verisi bozuk:', e);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadGlobalsFromStorage();
});


