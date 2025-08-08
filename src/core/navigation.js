import { createMainHeader } from '../components/mainHeader.js';
import { anasayfa } from '../pages/anasayfa/index.js';
import { rota } from '../pages/rota/index.js';
import { analiz } from '../pages/analiz/index.js';
import { istasyonlar } from '../pages/istasyonlar/index.js';
import { duzenle } from '../pages/duzenle/index.js';
import { ayarlar } from '../pages/ayarlar/index.js';
import { cikis } from '../pages/cikis/index.js';

const pageInitFunctions = {
  anasayfa:    { fn: anasayfa, title: "Anasayfa" },
  rota:        { fn: rota,     title: "Rota Planla" },
  analiz:      { fn: analiz,   title: "Analiz" },
  istasyonlar: { fn: istasyonlar, title: "İstasyonlar" },
  duzenle:     { fn: duzenle, title: "Düzenle" },
  ayarlar:     { fn: ayarlar, title: "Ayarlar" },
  cikis:       { fn: cikis, title: "Çıkış" }
};

export function renderContent(mainContainer) {
  const hash = window.location.hash.replace("#", "") || "anasayfa";
  const page = pageInitFunctions[hash];
  mainContainer.innerHTML = '';

  if (page) {
    const header = createMainHeader("Kontrol Paneli", page.title);
    const title = `Güzergah & Maliyet | ${page.title}`;
    document.title = title;
    mainContainer.appendChild(header);
    updateSelectedMenuItem(hash);
    try {
      page.fn(mainContainer);
    } catch (error) {
      console.error('Sayfa render hatası:', error);
      mainContainer.innerHTML = "<p>Sayfa yüklenirken hata oluştu.</p>";
    }
  } else {
    window.location.hash = '#anasayfa';
  }
}

let menuItems = null;

function updateSelectedMenuItem(currentHash) {
  if (!menuItems) {
    menuItems = document.querySelectorAll(".side-menu [data-page]");
  }
  
  menuItems.forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-page") === currentHash);
  });
}