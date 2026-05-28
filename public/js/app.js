import { loadData } from "./data.js";
import { initMap } from "./map.js";
import { initSearchMenu } from "./search.js";
import { initCircoSelector } from "./select.js";
import { initSidebarRight } from "./sidebar.js";
import { initSidebarLeft } from "./sidebarLeft.js";
import { initMvtMenu } from "./mvtIntra.js";

async function init() {
    try {

        await loadData();

        initMap();
        initCircoSelector();
        initSidebarRight();
        initSidebarLeft();
        initSearchMenu();
        initMvtMenu();
        
    } catch (error) {
        console.error('Erreur : ', error);
        document.body.innerHTML ='<h1>Erreur de chargement</h1>';
    }
};

init();