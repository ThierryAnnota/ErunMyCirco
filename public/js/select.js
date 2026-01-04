import { state } from "./state.js";
import {centerOnCirco, createInspectionMarker, clearMarkers, createEcoleMarker} from "./map.js"
import { closeSidebar, createSidebar, deleteSidebar } from "./sidebar.js";

export function initCircoSelector() {
    const selectButton = document.getElementById('circoSelect');

    state.data.circonscriptions.forEach(circo => {
        const option = document.createElement('option');
        option.value = circo.id;
        option.textContent = `${circo.id} - ${circo.nom} (${circo.count_ecoles} écoles)`;
        
        selectButton.append(option);
    });

    selectButton.addEventListener('change', handleChangeCirco);
}; 

function handleChangeCirco(e) {
    const circoCode = e.target.value;

    if(!circoCode) {
        // réinitialisation
        clearMarkers();
        state.map.setView([48.84871, 2.210847], 12);
        state.currentCirco = null;
        state.currentEcoles = [];
        state.sidebar = null;
        return;
    };

    const circo = state.data.circonscriptions.find(c => c.id === circoCode);

    //fermeture de la sidebar et réinitialisation pour les circos sans école.
    
    if (circo.count_ecoles===0){
        state.currentCirco = circo;
        centerOnCirco(state.currentCirco);
        clearMarkers();
        closeSidebar();
        deleteSidebar();
        createInspectionMarker(state.currentCirco);

    } else {
    const ecoles = state.data.ecoles.filter(e => {
        const ecoleCircoCode = e.id.split('-')[1];
        return ecoleCircoCode === circoCode;
    });

    const ecolesTriees = {};
    ecoles.forEach(e => {
        const ville = e.commune;
        if (ecolesTriees[ville]){
            ecolesTriees[ville].push([e.id, e.type, e.nom]);
        } else {
            ecolesTriees[ville] = [];
            ecolesTriees[ville].push([e.id, e.type, e.nom])
        };
    });
    
    state.currentCirco = circo;
    state.currentEcoles = ecoles;
    state.sidebar = ecolesTriees;

    // appel de la fonction centrer sur la circo
    centerOnCirco(state.currentCirco);
    
    // appel de la fonction pour créer les marqueurs des écoles (dans laquelle il faut que je supprime tous les marqueurs existants)
    clearMarkers();
    createInspectionMarker(state.currentCirco);
    createEcoleMarker(state.currentEcoles);

    // création de la sidebar
    createSidebar(ecolesTriees, circo);
};
}
