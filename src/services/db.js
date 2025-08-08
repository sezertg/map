export let jsonData = [];
export let locationData = [];

export async function loadJson() {
  const res = await fetch('/src/data/istasyonlar.json');
  const data = await res.json();
  jsonData = data;
}

export async function loadLocations() {
  const res = await fetch('/src/data/turkey.json');
  locationData = await res.json();
}

export function exportJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'duzenlenmis_ucretler.json';
  a.click();
  URL.revokeObjectURL(url);
}