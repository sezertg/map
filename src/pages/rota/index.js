import {createMain} from './components/layout.js'
import {loadJson, loadLocations, jsonData, locationData} from '../../services/db.js';

export async function rota(mainContainer) {

    if (!jsonData[0]) await loadJson();
    if (!locationData[0]) await loadLocations();
    const main = createMain();
    mainContainer.appendChild(main);
}
