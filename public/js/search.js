import { centerOnSchool, clearMarkers, createEcoleMarker } from "./map.js";
import { closeSidebar, deleteSidebar } from "./sidebar.js";
import { state } from "./state.js";

let searchInput = null;
let searchButton = null;
let searchBar = null;
let suggestions = null;
let suggestion = "";
let selectedSuggestion = null;
let indexSuggestion = -1;

export function initSearchMenu () {
    searchBar = document.querySelector(".search-bar");
    searchInput = document.querySelector(".recherche");
    searchButton = document.querySelector(".validation");
    suggestions = document.querySelector(".suggestions");
    searchInput.value = "";

    searchInput.addEventListener("input", handleChangeInput);
    searchBar.addEventListener("submit", submitInput);
    searchInput.addEventListener("keydown", (e) => {
        let suggestionsElements = document.querySelectorAll(".suggestion");
        if(e.key === "ArrowDown"){
            if (indexSuggestion < (suggestionsElements.length -1)){
                indexSuggestion ++;
            } else {
                indexSuggestion = -1;
                suggestionsElements.forEach((e) => {
                    e.classList.remove("active");
                });
                return;
            };
        };
        if(e.key === "ArrowUp"){
            if(indexSuggestion === -1){
                return;
            } else{
                indexSuggestion --;
                suggestionsElements.forEach((e) => {
                    e.classList.remove("active");
                });
            };
        };
        suggestionsElements.forEach((e) => {
            e.classList.remove("active");
        });
        if(indexSuggestion !== -1){
            selectedSuggestion = suggestionsElements[indexSuggestion];
            selectedSuggestion.classList.add("active");
        }
    });
};

export function handleChangeInput () {
    const value = searchInput.value
    const result = state.data.ecoles.filter((ecole)=> ecole.nom.toLowerCase().includes(value.toLowerCase()));

    if(suggestion!== ""){
        suggestion = "";
    };

    if(value.length > 2 ){
        result.forEach(ecole => {
            suggestion += `<div class="suggestion" data-id=${ecole.id}>école ${ecole.type} ${ecole.nom} - <span>${ecole.commune}</span></div>`;
        });
        searchBar.classList.add("suggestionsOpen");
    } else {
        searchBar.classList.remove("suggestionsOpen");
    }
    
    suggestions.innerHTML = suggestion;
    indexSuggestion = -1

    const suggestionsElements = document.querySelectorAll(".suggestion");
    suggestionsElements.forEach(e => {
        e.addEventListener("mouseenter", () => {
            e.classList.add("active");
        });
        e.addEventListener("mouseleave", ()=> {
            e.classList.remove("active");
        });
        e.addEventListener("click", ()=> {
            selectedSuggestion = e
            selectEcole();
        });
    });
};  

export function selectEcole() {
    searchInput.value = `${selectedSuggestion.innerText}`;
    let ecole = state.data.ecoles.find((e) => e.id === selectedSuggestion.dataset.id);
    suggestions.innerHTML = "";
    clearMarkers();
    createEcoleMarker([ecole]);
    const marker = state.markers.get(`ecole-${ecole.id}`);
        if(marker) {
            centerOnSchool(marker._latlng.lat, marker._latlng.lng);
            marker.openPopup();
        };
    deleteSidebar();
    closeSidebar();
    searchBar.classList.remove("suggestionsOpen");
}

export function submitInput(event) {
    event.preventDefault();
    selectEcole();
};