import { createElement } from '../../../utils/dom.js';

function normalizeStr(str) {
  return str.toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o');
}

function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function setupAutoComplete(inputElement, dataList) {
  const listContainer = createElement('div', { class: 'autocomplete-list' });

  inputElement.parentNode.style.position = 'relative';
  inputElement.parentNode.appendChild(listContainer);

  let selectionMade = false;

  const updateList = debounce(() => {
    if (selectionMade) {
      selectionMade = false;
      return;
    }

    const val = normalizeStr(inputElement.value.trim());
    listContainer.innerHTML = '';
    if (val.length < 3) return;

    const searchTerms = val.split(/\s+/); // Kullanıcının yazdığı tüm kelimeler

    const matches = dataList
      .filter(item => {
        const normalizedName = normalizeStr(item.name);
        return searchTerms.every(term => normalizedName.includes(term));
      })
      .sort((a, b) => {
        const commaCountA = (a.name.match(/,/g) || []).length;
        const commaCountB = (b.name.match(/,/g) || []).length;
        return commaCountA !== commaCountB
          ? commaCountA - commaCountB
          : a.name.localeCompare(b.name, 'tr');
      })
      .slice(0, 15);

    for (const match of matches) {
      const div = createElement('div', {
        class: 'autocomplete-item',
        textContent: match.name
      });

      div.onclick = () => {
        inputElement.value = match.name;
        inputElement.setAttribute('data-coordinate', match.coordinates);
        listContainer.innerHTML = '';
        selectionMade = true;
        inputElement.dispatchEvent(new Event('change'));
      };

      listContainer.appendChild(div);
    }
  }, 500);

  inputElement.addEventListener('input', () => {
    inputElement.removeAttribute('data-coordinate');
    selectionMade = false;
    updateList();
  });

  document.addEventListener('click', e => {
    if (!inputElement.contains(e.target) && !listContainer.contains(e.target)) {
      listContainer.innerHTML = '';
    }
  });
}
