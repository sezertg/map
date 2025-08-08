import { createTable } from './components/layout.js'
import { loadJson, jsonData } from '../../services/db.js';


export async function istasyonlar(mainContainer) {
    if (!jsonData[0]) await loadJson();
    const table = createTable();
    mainContainer.appendChild(table);
}