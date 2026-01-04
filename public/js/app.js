import { loadData } from "./data.js";
import { initMap } from "./map.js";
import { initSearchMenu } from "./search.js";
import { initCircoSelector } from "./select.js";
import { initSidebar } from "./sidebar.js";

async function init() {
    try {

        await loadData();

        initMap();
        initCircoSelector();
        initSidebar();
        initSearchMenu();
        
    } catch (error) {
        console.error('Erreur : ', error);
        document.body.innerHTML ='<h1>Erreur de chargement</h1>';
    }
};

init();