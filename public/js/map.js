import { state } from "./state.js";

export function initMap() {
    state.map = L.map('map').setView([48.84871, 2.210847], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(state.map);

}; 

export function centerOnCirco(circo) {
    if(circo.bounds) {
        state.map.flyToBounds([circo.bounds.southWest, circo.bounds.northEast], {
            padding : [50, 50], 
            animation: true, 
            duration: 1})
    } else {
        state.map.flyTo([circo.inspection.coordonnees[0], circo.inspection.coordonnees[1]], 15, {
            padding : [50, 50], 
            animation: true, 
            duration: 1})
    }
}; 

export function centerOnSchool(lat, lng) {
    state.map.flyTo([lat, lng], 17, {
        padding : [50, 50], 
        animation: true, 
        duration: 1})
};

function createColoredIcon(color, width, height) {
    return L.divIcon({
        html: `
            <svg width="${width}" height="${height}" viewBox="0 0 32 45" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 29 16 29s16-20.2 16-29c0-8.8-7.2-16-16-16z" 
                      fill="${color}" 
                      stroke="white" 
                      stroke-width="2"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
        `,
        className: '',
        iconSize: [32, 45],
        iconAnchor: [16, 45],
        popupAnchor: [0, -45]
    });
}

// Utilisation
const inspectionIcon = createColoredIcon('#ef4444', 32, 45); // rouge
const ecoleIcon = createColoredIcon('#3b82f6', 24, 35);      // bleu




export function createInspectionMarker (inspection) {
    const markerInpsection = L.marker([inspection.inspection.coordonnees[0]+ 0.0001,inspection.inspection.coordonnees[1]+ 0.0001], {icon: inspectionIcon})
    .bindTooltip(`${inspection.type} de ${inspection.nom}`)
    .bindPopup(`
        <div class="ecolePopup">
                    <h4 class="ienPopup">${inspection.nom}</h4>
                    <p><span>Adresse :</span> ${inspection.inspection.adresse}, ${inspection.inspection.commune}</p>
                    <p><span>Email :</span> ${inspection.inspection.email} <a href="mailto:${inspection.email}">✉️</a></p>
                    <p><span>Tel :</span> ${inspection.inspection.tel} <a href="tel:${inspection.tel}">☎️</a></p>
                    <p><span>Nombre d'école(s) :</span> ${inspection.count_ecoles}</p>
                </div> 
    `)
    .addTo(state.map);

    // ajout du marker au state
    state.markers.set(`inspection-${inspection.id}`, markerInpsection);
};

export function createEcoleMarker (ecoles) {
    ecoles.forEach(ecole => {
        // vérifier si d'autres écoles ont les mêmes coordonées
        const samePosition = ecoles.filter(e => 
            e.coordonnees[0] === ecole.coordonnees[0] &&
            e.coordonnees[1] === ecole.coordonnees[1] &&
            e.id !== ecole.id
        );
        let lat = ecole.coordonnees[0];
        let lng = ecole.coordonnees[1];
        if (samePosition.length > 0) {
            const offset = 0.0001;
            lat += (Math.random() - 0.5) * offset * 2;
            lng += (Math.random() -0.5) * offset * 2;
        };
        // dans la librairie Leaflet, "on" est la méthode de la classe marker qui correspond à "addEvenListener"
        const markerEcole = L.marker([lat, lng], {icon: ecoleIcon})
        .bindTooltip(`école ${ecole.type} ${ecole.nom}`)
        .bindPopup(`
               <div class="ecolePopup">
                    <h4>école ${ecole.type} ${ecole.nom}</h4>
                    <p><span>Adresse :</span> ${ecole.adresse}, ${ecole.commune}</p>
                    <p><span>Email :</span> ${ecole.email} <a href="mailto:${ecole.email}">✉️</a></p>
                    <p><span>Tel :</span> ${ecole.tel} <a href="tel:${ecole.tel}">☎️</a></p>
                    <p><span>Nombre de classes :</span> ${ecole.nb_classes}</p>
                    ${ecole.REP ? `<p><span>REP :</span> ${ecole.REP}</p>` : ''}
                </div> 
        `)
        .on("click", ()=> {
            const lat = markerEcole._latlng.lat;
            const lng = markerEcole._latlng.lng;
            centerOnSchool(lat, lng);
        })
        .addTo(state.map)
    
        // ajout du marker au state
        state.markers.set(`ecole-${ecole.id}`, markerEcole);
    })
}

export function clearMarkers(){
    // retirer les markers de la map
    state.markers.forEach(marker => state.map.removeLayer(marker));
    // vider l'objet Map() du state
    state.markers.clear();
};