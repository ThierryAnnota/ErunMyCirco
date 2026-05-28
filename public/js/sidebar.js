import { centerOnSchool } from "./map.js";
import { state } from "./state.js";

let sidebarRight = null;
let sidebarButtonRight = null;
let sidebarContainerRight = null;

export function initSidebarRight () {

    sidebarRight = document.querySelector(".sidebar--right");
    sidebarButtonRight = document.querySelector(".sidebarButton--right");
    sidebarContainerRight = document.querySelector(".sidebarContainer--right");

    sidebarButtonRight.addEventListener("click" , toggleSidebarRight);
};

export function toggleSidebarRight() {
    sidebarRight.classList.toggle('hidden');
    sidebarButtonRight.classList.toggle('closeRight');
};

export function openSidebarRight() {
    sidebarRight.classList.remove("hidden");
    sidebarButtonRight.classList.add("closeRight");
};

export function closeSidebarRight() {
    sidebarRight.classList.add("hidden");
}

export function deleteSidebarRight() {
    sidebarContainerRight.innerHTML = "";
}

export function createSidebarRight (ecolesTriees, circo){
    deleteSidebarRight();

    document.querySelector(".recherche").value = "";

    const circoName = document.createElement("h2")
    circoName.classList.add("circoName");
    circoName.textContent = circo.nom;
    sidebarContainerRight.append(circoName);

    const nbVilles = Object.keys(ecolesTriees).length;

    for (const city in ecolesTriees){
        if (nbVilles > 1){
        const ville = document.createElement("h3");
        ville.classList.add("ville");
        ville.textContent = city;
        sidebarContainerRight.append(ville);
        };

        const ul = document.createElement("ul");
        sidebarContainerRight.append(ul);

        ecolesTriees[city].forEach(element => {
            const ecole = document.createElement("li");
            ecole.classList.add("ecole");
            ecole.textContent = `${element[1]} ${element[2]}`;
            ecole.dataset.schoolId = element[0];
            ecole.addEventListener("mouseenter", ()=> {
                const marker = state.markers.get(`ecole-${ecole.dataset.schoolId}`);
                if (marker) {
                    marker.openTooltip();
                };
            });
            ecole.addEventListener("mouseleave", ()=> {
                const marker = state.markers.get(`ecole-${ecole.dataset.schoolId}`);
                if(marker) {
                    marker.closeTooltip();
                };
            });
            ecole.addEventListener("click", ()=> {
                const marker = state.markers.get(`ecole-${ecole.dataset.schoolId}`);
                if(marker) {
                    centerOnSchool(marker._latlng.lat, marker._latlng.lng);
                    marker.openPopup();
                }
            })
            ul.append(ecole);
        });
    }

    openSidebarRight();
    
};
