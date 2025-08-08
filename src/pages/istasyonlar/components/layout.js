import { createElement } from '../../../utils/dom.js';
import { createPriceTable } from './tables.js';
import { jsonData } from '../../../services/db.js';
import { createMap } from '../../../components/map/map.js';

export let currentStations;
export let currentMode;

export function createTable() {

  // localStorage'dan yükle, yoksa varsayılanları kullan
  let selectedPassType = localStorage.getItem('selectedPassType') === 'true' ? true : false;
  let selectedClassId = Number(localStorage.getItem('selectedClassId')) || 1;
  let savedStationId = Number(localStorage.getItem('selectedStationId')) || jsonData[0].id;

  const stationSelect = createElement('select', { id: 'stations', class: 'station-list' },
    jsonData.map((station) =>
      createElement('option', { value: station.id, textContent: station.isim })
    )
  );

  // Seçilen istasyonu ayarla
  stationSelect.value = savedStationId;

  const standartPrice = createElement('button', { textContent: 'Normal Geçişler' });
  const privatePrice = createElement('button', { textContent: 'Tek Geçişler' });

  // Geçiş türü butonlarını diziye al
  const passTypeButtons = [standartPrice, privatePrice];

  const classButtons = Array.from({ length: 6 }, (_, i) => {
    const id = i + 1;
    const button = createElement('button', {
      textContent: `Sınıf ${id}`,
      className: 'vehicle-class-btn',
      dataset: { id }
    });
    if (id === selectedClassId) button.classList.add('active');

    button.addEventListener('click', () => {
      selectedClassId = id;
      localStorage.setItem('selectedClassId', selectedClassId);
      setActiveButton(classButtons, button);
      updateTable();
    });

    return button;
  });

  const classButtonGroup = createElement('div', { class: 'vehicle-class-group' }, classButtons);
  const selectTable = createElement('div', { class: 'select-table' }, [
    stationSelect,
    standartPrice,
    privatePrice,
    classButtonGroup
  ]);

  const mapContainer = createElement('div', { class: 'station-map'})

  const stationEditTable = createElement('div', { class: 'edit-table' });
  const tableData = createElement('div', { class: 'table-data' }, [
    createElement('div', { class: 'data-1' }, [selectTable, stationEditTable]),
    createElement('div', { class: 'data-1' }, [mapContainer])
  ]);

  standartPrice.addEventListener('click', () => {
    selectedPassType = false;
    localStorage.setItem('selectedPassType', selectedPassType);
    setActiveButton(passTypeButtons, standartPrice);
    updateTable();
  });

  privatePrice.addEventListener('click', () => {
    selectedPassType = true;
    localStorage.setItem('selectedPassType', selectedPassType);
    setActiveButton(passTypeButtons, privatePrice);
    updateTable();
  });

  stationSelect.addEventListener('change', () => {
    localStorage.setItem('selectedStationId', stationSelect.value);
    updateTable();
  });

  // Sayfa açılırken butonları ve seçimi güncelle
  updateTable();

  // Aktif sınıf butonunu ayarla
  setActiveButton(classButtons, classButtons.find(btn => Number(btn.dataset.id) === selectedClassId));

  // Aktif geçiş türü butonunu ayarla
  setActiveButton(passTypeButtons, selectedPassType ? privatePrice : standartPrice);

  requestAnimationFrame(() => {
      createMap(mapContainer);
  });

  return tableData;

  function updateTable() {

    const selectedId = Number(stationSelect.value);
    const station = jsonData.find(s => s.id === selectedId);
    currentStations = station;
    if (!station) return;

    const hasTekGecis = station.tek_gecis.includes(true);
    const hasNormalGecis = station.tek_gecis.includes(false);
    privatePrice.style.display = hasTekGecis ? 'inline-block' : 'none';
    standartPrice.style.display = hasNormalGecis ? 'inline-block' : 'none';

    if (!station.tek_gecis.includes(selectedPassType)) {
      const fallback = !selectedPassType;
      if (station.tek_gecis.includes(fallback)) {
        selectedPassType = fallback;
        localStorage.setItem('selectedPassType', selectedPassType);
        setActiveButton(passTypeButtons, fallback ? privatePrice : standartPrice);
      } else {
        stationEditTable.innerHTML = `<p>Geçiş türü için uygun veri bulunamadı.</p>`;
        return;
      }
    }
    currentMode = selectedPassType;

    stationEditTable.innerHTML = '';
    const table = createPriceTable(station, selectedClassId, selectedPassType);
    stationEditTable.appendChild(table);
  }

}

function setActiveButton(buttonGroup, activeButton) {
  buttonGroup.forEach(btn => btn.classList.remove('active'));
  if (activeButton) activeButton.classList.add('active');
}
