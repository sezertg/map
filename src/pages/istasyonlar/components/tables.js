import { createElement } from '../../../utils/dom.js';
import { currentStations, currentMode } from './layout.js';
import { updateMap } from '../../../components/map/map.js';


export function createPriceTable(station, classId, passType) {
  return passType
    ? createTekGecisTable(station, classId)
    : createNormalGecisTable(station, classId);
}

function createTekGecisTable(station, classId) {
  
  const headerRow = createElement('tr');
  headerRow.innerHTML = '<th>İstasyonlar</th><th>Tek Geçiş Ücreti</th>';
  const thead = createElement('thead', {},[headerRow]);
  
  const tbody = createElement('tbody');
  const ücretler = station.ucret[classId];

  station.tek_gecis.forEach((isTek, idx) => {
    if (isTek) {
      const input = createElement('input', {
        type: 'number',
        value: ücretler[idx]?.[0] ?? '',
        min: 0,
        step: 0.01
      });

      input.addEventListener('focus', () => {
        updateMap(currentStations, currentMode, idx, 0);
      });

      input.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          if (!ücretler[idx]) ücretler[idx] = [];
          ücretler[idx][0] = val;
        } else {
          e.target.value = ücretler[idx]?.[0] ?? '';
        }
      });
      
      const priceTd = createElement('td', {}, [input]);
      const stationNameTd = createElement('th', { textContent: station.istasyon_sirasi[idx] });
      const tr = createElement('tr', {}, [stationNameTd, priceTd]);
      tbody.appendChild(tr);
    }
  });

  const table = createElement('table', { className: 'price-table' }, [thead, tbody]);
  return table;
}


function createNormalGecisTable(station, classId) {
  
  const matrix = station.ucret[classId];
  const indices = station.tek_gecis.map((isTek, i) => (!isTek ? i : -1)).filter(i => i !== -1);

  const headers = indices.map(i => {
    const name = station.istasyon_sirasi[i];
    return createElement('th', { textContent: name });
  });
  const headerLabel = createElement('th', { textContent: 'İstasyonlar' });
  const headerRow = createElement('tr', {}, [headerLabel, ...headers]);


  const thead = createElement('thead', {}, [headerRow])
  const tbody = createElement('tbody');
  indices.forEach(rowIdx => {
    
    const rowHeader = createElement('th', { textContent: station.istasyon_sirasi[rowIdx] });
    const tr = createElement('tr', {}, [rowHeader]);
    indices.forEach(colIdx => {
      const td = createElement('td');
      const input = createElement('input', {
        type: 'number',
        value: matrix[rowIdx]?.[colIdx] ?? '',
        min: 0,
        step: 0.01,
        readOnly: true
      });

      input.addEventListener('focus', () => {
        updateMap(currentStations, currentMode, rowIdx, colIdx);
      });

      input.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          if (!matrix[rowIdx]) matrix[rowIdx] = [];
          matrix[rowIdx][colIdx] = val;
        } else {
          e.target.value = matrix[rowIdx]?.[colIdx] ?? '';
        }
      });

      td.appendChild(input);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  const table = createElement('table', { className: 'price-table' }, [thead, tbody]);
  return table;
}

