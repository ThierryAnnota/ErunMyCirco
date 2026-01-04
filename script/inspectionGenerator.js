import {geocodeAdressGouv, } from './utils.js'; 
import { readCSV } from './utils.js';
import { writeJson } from './utils.js';

async function inspectionGenerator() {
    const csvPath = process.argv[2];

    if (!csvPath){
        console.log('il manque le chemin du fichier csv après le script node pour générer les inspections')
        process.exit(1)
        // le code 1 indique qu'on est sorti avec une erreur
    }

    const rows = readCSV(csvPath);

    const circonscriptions = [];
    let nb = 1;

    for (const row of rows) {

        // géocodage de chaque circo
        const addresseComplete = `${row.adresse}, ${row.cp} ${row.commune}`;
        const coords = await geocodeAdressGouv(addresseComplete);

        if (coords) {
            console.log(`coordonnées trouvées : ${coords[0]}, ${coords[1]}`);
        } else {
            console.log(`erreur de géocodage pour : ${row.nom_ecole}`);
        };

        const circo = {
            id: row.circo_code,
            type: row.type,
            nom: row.nom_circo,
            count_ecoles: 0,
            bounds: null,
            inspection: {
                adresse: row.adresse,
                commune: row.commune,
                coordonnees: coords,
                email: row.mail,
                tel : row.telephone, 
                // ien : `${row.titre_ien} ${row.prenom} ${row.nom}`,
            }
        };

        circonscriptions.push(circo);
        nb++;

        // pour respecter les limites de l'api de géocodage
        await new Promise(resolve => setTimeout(resolve, 500));

    };

    const data = {
        circonscriptions: circonscriptions,
        ecoles: []
    }; 

    writeJson('public/data/ecoles.json', data);


};

inspectionGenerator()