import fetch from 'node-fetch';
import fs from 'fs';
import Papa from 'papaparse'

// fonction pour géocoder les adresses des écoles à l'aide de l'API gouvernementale

export async function geocodeAdressGouv(address) {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
    const reponse = await fetch(url);
    const data = await reponse.json();
    console.log('Réponse API:', data);

    if (data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        return [coords[1], coords[0]]; // [lat, lng]
    }
    return null;
};

// fonction pour lire le fichier sur mon disque

export function readCSV(fichierCSV) {
    const contentCSV = fs.readFileSync(fichierCSV, "utf-8");
    const {data} = Papa.parse(contentCSV, {
        header: true,
        skipEmptyLines: true,
    });
    return data
};

// fonction pour lire un json dans la "base de données"

export function readJson(filePath) {
    if (fs.existsSync(filePath)){
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } 
    return {circonscritpions: [], ecoles : [ ]};
}



// fonction pour écrire dans la "base de données"

export function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    // ici, le paramètre null indique qu'il n'y a pas de fonction de remplacement, et "2" concerne l'indentation choisie
}

export function calculateBounds(lats, longs) {
    if (!lats || !longs){
        console.log("il n'y a pas données de longitude et latitude pour calculer les limites");
        process.exit(1);
    } else{
        return { 
            southWest : [Math.min(...lats), Math.min(...longs)],
            northEast : [Math.max(...lats), Math.max(...longs)]
        };
    };
}

// pour mettre une majuscule sur la première lettre
export function capitalize(str) {
    if(!str) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}