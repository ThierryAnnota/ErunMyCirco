import { centerOnSchool } from "./map.js";
import { state } from "./state.js";

let sidebar = null;
let sidebarButton = null;
let sidebarContainer = null;

export function initSidebar() {

    sidebar = document.querySelector(".sidebar");
    sidebarButton = document.querySelector(".sidebarButton");
    sidebarContainer = document.querySelector(".sidebarContainer");

    sidebarButton.addEventListener("click" , toggleSidebar);
};

export function toggleSidebar() {
    sidebar.classList.toggle('hidden');
    sidebarButton.classList.toggle('close');
};

export function openSidebar() {
    sidebar.classList.remove("hidden");
};

export function closeSidebar() {
    sidebar.classList.add("hidden");
}

export function deleteSidebar() {
    sidebarContainer.innerHTML = "";
}

export function createSidebar (ecolesTriees, circo){
    deleteSidebar();

    document.querySelector(".recherche").value = "";

    const circoName = document.createElement("h2")
    circoName.classList.add("circoName");
    circoName.textContent = circo.nom;
    sidebarContainer.append(circoName);

    const nbVilles = Object.keys(ecolesTriees).length;

    for (const city in ecolesTriees){
        if (nbVilles > 1){
        const ville = document.createElement("h3");
        ville.classList.add("ville");
        ville.textContent = city;
        sidebarContainer.append(ville);
        };

        const ul = document.createElement("ul");
        sidebarContainer.append(ul);

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

    openSidebar();
    
};
