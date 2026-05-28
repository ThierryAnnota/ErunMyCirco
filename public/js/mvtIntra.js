import { clearMarkers, createEcoleMarker, createHomeMarker } from "./map.js";
import { closeSidebarRight, deleteSidebarRight } from "./sidebar.js";
import { closeSidebarLeft, deleteSidebarLeft, sidebarLeftFilling } from "./sidebarLeft.js";
import { state } from "./state.js";

let mvtMenu = null;
let modaleOverlay = null;
let closeBtn = null;

let mvtIntraInterface = null;
let inputAdressToCheck = null;
let suggestionsAdresses = null;
let contenuSuggestions = "";
let selectedAdresseSuggestion = null;
let indexAdresseSuggestion = -1;

let modaleStepAdresse = null;
let modaleStepAdresseBtn = null;
let modaleStepFiltres = null;
let modaleReinitAdress = null;

let maternelle = null;
let elementaire = null;
let primaire = null;

let nbMinClasses = null;
let nbMaxClasses = null;

let repYes = null;
let repNo = null;
let repIndiff = null;

export function initMvtMenu () {
    mvtMenu = document.querySelector(".mvtIntra");
    modaleOverlay = document.querySelector(".modale--overlay");
    closeBtn = document.querySelector(".modale--closeBtn");

    mvtIntraInterface = document.querySelector(".mvtIntraInteface");
    inputAdressToCheck = document.querySelector(".modale--inputAdresse");
    suggestionsAdresses = document.querySelector(".adressesSuggestions");
    

    modaleStepAdresse = document.querySelector(".modale--stepAdresse");
    modaleStepAdresseBtn = document.querySelector(".modale--stepAdresse--btn");
    modaleStepFiltres = document.querySelector(".modale--stepFilres");
    modaleReinitAdress = document.getElementById("modifierAdresse");

    maternelle = document.getElementById("maternelle");
    elementaire = document.getElementById("elementaire");
    primaire = document.getElementById("primaire");

    nbMinClasses = document.getElementById("min");
    nbMaxClasses = document.getElementById("max");

    repYes = document.getElementById("oui");
    repNo = document.getElementById("non");
    repIndiff = document.getElementById("indiff");



    mvtMenu.addEventListener("click", toggleOpenMvtMenu);
    closeBtn.addEventListener("click", toggleOpenMvtMenu);
    inputAdressToCheck.addEventListener("input", completion );
    inputAdressToCheck.addEventListener("submit", selectAdresse );
    inputAdressToCheck.addEventListener("keydown", handleKeydown)
    modaleStepAdresseBtn.addEventListener("click", adresseValidation);
    mvtIntraInterface.addEventListener("submit", sendForm);
    nbMinClasses.addEventListener("change", () => {
        if (parseInt(nbMinClasses.value) > parseInt(nbMaxClasses.value)) {
            nbMaxClasses.value = nbMinClasses.value ; 
        }
    });
    modaleReinitAdress.addEventListener("click", reinitModale);
};

export function handleKeydown (e) {
    let suggestionsElements = document.querySelectorAll(".suggestionsAdresses");
    if(e.key === "ArrowDown") {
        if (indexAdresseSuggestion < (suggestionsElements.length -1)) {
            indexAdresseSuggestion ++ ; 
            suggestionsElements.forEach((e) => {
                e.classList.remove("active");
            });
        } else {
            indexAdresseSuggestion = -1;
            suggestionsElements.forEach((e) => {
                e.classList.remove("active");
            });
            return;
        };
    };
    if(e.key === "ArrowUp"){
        if(indexAdresseSuggestion === -1){
            return;
        } else {
            indexAdresseSuggestion --;
            suggestionsElements.forEach((e) => {
                e.classList.remove("active");
            });
        };
    };
    if(indexAdresseSuggestion !== -1) {
        selectedAdresseSuggestion = suggestionsElements[indexAdresseSuggestion];
        selectedAdresseSuggestion.classList.add("active");
    };
    if(e.key === "Enter"){
        e.preventDefault();
        selectAdresse();
        return;
    }
}

export function reinitModale () {
    modaleStepAdresse.classList.remove("hiddenModale");
    modaleStepFiltres.classList.add("hiddenModale");
    inputAdressToCheck.value = "";
    state.ecolesParDistances = [];
    indexAdresseSuggestion = -1;
    inputAdressToCheck.removeEventListener("keydown", handleKeydown);
    inputAdressToCheck.addEventListener("keydown", handleKeydown);
    deleteSidebarLeft();
    closeSidebarLeft();
}

export function toggleOpenMvtMenu () {
    modaleOverlay.classList.toggle("hiddenModale");
};

async function completion () {
    let test = inputAdressToCheck.value.trim();

    if(contenuSuggestions!== ""){
        contenuSuggestions = "";
    };
    if (test.length > 5) {
        const url = `https://data.geopf.fr/geocodage/completion/?text=${test}&maximumResponses=15`
        const response = await fetch(url);
        const data = await response.json();
        data.results.forEach((e) => {
            contenuSuggestions += `<div class="suggestionsAdresses">${e.fulltext}</div>`;
        });

        inputAdressToCheck.classList.add("suggestionsAdresseOpen");
    } else {
        inputAdressToCheck.classList.remove("suggestionsAdresseOpen");
    }
    suggestionsAdresses.innerHTML = contenuSuggestions;

    const suggestionsElements = document.querySelectorAll(".suggestionsAdresses");
    suggestionsElements.forEach(e => {
        e.addEventListener("mouseenter", () => {
            e.classList.add("active");
        });
        e.addEventListener("mouseleave", () => {
            e.classList.remove("active");
        });
        e.addEventListener("click", () => {
            selectedAdresseSuggestion = e;
            selectAdresse();
        })
    })
    
}

async function coordonneesGenerate () {
    const adresse = inputAdressToCheck.value;
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.features.length > 0) {
        const result = data.features[0];
        const coordonness = data.features[0].geometry.coordinates;
        return {
            coords: [result.geometry.coordinates[1], result.geometry.coordinates[0]], // [lat, lng]
            adresse: result.properties.label
        };
    }
    return null;
}; 

export async function adresseValidation (e) {
    if(e) e.preventDefault();

    const resultat = await coordonneesGenerate();
    
    if(!resultat) {
        console.error("adresse introuvable");
        return;
    };

    state.depart.coords = resultat.coords;
    state.depart.adresse = resultat.adresse;

    const departPoint = L.latLng(resultat.coords[0], resultat.coords[1]);
    
    function compareDistance (a, b) {
        if (a.distance < b.distance) {
            return -1;
        } else if (a.distance > b.distance) {
            return 1;
        }
        // si a === b 
        return 0
    }
    
    state.ecolesParDistances = state.data.ecoles.map(ecole => {
        const arrivee = L.latLng(ecole.coordonnees[0], ecole.coordonnees[1]);
        const distance = departPoint.distanceTo(arrivee);
        return { ...ecole, distance };
    });
    
    // tri des écoles de la plus proches à la plus lointaines
    state.ecolesParDistances.sort(compareDistance);

    modaleStepAdresse.classList.add("hiddenModale");
    modaleStepFiltres.classList.remove("hiddenModale");

    inputAdressToCheck.classList.remove("suggestionsAdresseOpen");

    document.querySelector(".adresseSelectionnee--label").textContent = inputAdressToCheck.value ;
};


export function sendForm (e) {
    e.preventDefault();

    let ecolesFiltrees = state.ecolesParDistances.filter((ecole) => {
        if (maternelle.checked === false && ecole.type==="Maternelle") return false;
        if (elementaire.checked === false && ecole.type === "Élémentaire") return false;
        if (primaire.checked === false && ecole.type === "Primaire") return false;
        if (parseInt(nbMinClasses.value) > parseInt(ecole.nb_classes)) return false;
        if (parseInt(nbMaxClasses.value) < parseInt(ecole.nb_classes)) return false;
        if (repYes.checked === true && ecole.REP === null) return false;
        if (repNo.checked === true && ecole.REP !== null) return false;
        return true;
    })

    state.map.flyTo(state.depart.coords, 13, {
        padding : [50, 50], 
        animation: true, 
        duration: 1});

    inputAdressToCheck.value = "";

    clearMarkers();
    createEcoleMarker(ecolesFiltrees);

    sidebarLeftFilling(ecolesFiltrees);

    createHomeMarker(state.depart);

    toggleOpenMvtMenu();

    closeSidebarRight();
    deleteSidebarRight();

    // réiniitialisation de l'index du select
    const selectButton = document.getElementById('circoSelect');
    selectButton.selectedIndex = 0;


};

export function selectAdresse () {
    inputAdressToCheck.value = `${selectedAdresseSuggestion.textContent}`;
    suggestionsAdresses.innerHTML = "";
    adresseValidation();
}