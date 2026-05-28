import { centerOnSchool } from "./map.js";
import { state } from "./state.js";


let sidebarLeft = null;
let sidebarButtonLeft = null;
let sidebarContainerLeft = null;

export function initSidebarLeft () {
    sidebarLeft = document.querySelector(".sidebar--left");
    sidebarButtonLeft = document.querySelector(".sidebarButton--left");
    sidebarContainerLeft = document.querySelector(".sidebarContainer--left");

    sidebarButtonLeft.addEventListener("click", toggleSidebarLeft);

};

export function toggleSidebarLeft () {
    sidebarLeft.classList.toggle('hidden--left');
    sidebarButtonLeft.classList.toggle('closeLeft');
};

export function openSidebarLeft() {
    sidebarLeft.classList.remove("hidden--left");
    sidebarButtonLeft.classList.add("closeLeft");
};

export function closeSidebarLeft () {
    sidebarLeft.classList.add("hidden--left");
}

export function deleteSidebarLeft() {
    sidebarContainerLeft.innerHTML = "";
};

export function sidebarLeftFilling (ecoles) {

    deleteSidebarLeft();

    ecoles.forEach((ecole) => {
        const divEcole = document.createElement("div");
        divEcole.classList.add("ecole");
        const nomEcole = document.createElement("div");
        nomEcole.classList.add("nomEcole");
        nomEcole.textContent = `${ecole.type} ${ecole.nom}`;
        const villeEcole = document.createElement("div");
        villeEcole.classList.add("villeEcole");
        villeEcole.textContent = `${ecole.commune}`
        divEcole.append(nomEcole);
        divEcole.append(villeEcole);
        sidebarContainerLeft.append(divEcole);
        divEcole.dataset.schoolId = ecole.id;
        divEcole.addEventListener("mouseenter", () => {
            const marker = state.markers.get(`ecole-${divEcole.dataset.schoolId}`);
            if (marker) {
                marker.openTooltip();
            };
        });
        divEcole.addEventListener("mouseleave", ()=> {
            const marker = state.markers.get(`ecole-${divEcole.dataset.schoolId}`);
            if(marker) {
                marker.closeTooltip();
            };
        });
        divEcole.addEventListener("click", ()=> {
            const marker = state.markers.get(`ecole-${divEcole.dataset.schoolId}`);
            if(marker) {
                centerOnSchool(marker._latlng.lat, marker._latlng.lng);
                marker.openPopup();
            }
        })

    })

    openSidebarLeft();

};


export function routeCalculation (ecole) {
    // e.preventDefault();

    deleteSidebarLeft();

    const divEcole = document.createElement("div");
    divEcole.classList.add("PointA");
    const nomEcole = document.createElement("div");
    nomEcole.classList.add("nomEcole");
    nomEcole.textContent = `${ecole.type} ${ecole.nom}`;
    divEcole.append(nomEcole);
    sidebarContainerLeft.append(divEcole);

    openSidebarLeft();
    
};