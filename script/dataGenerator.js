console.log("script démarré");

import {geocodeAdressGouv, readCSV, writeJson, readJson, calculateBounds, capitalize} from "./utils.js"

// script principal

async function dataGenerate() {
    const csvPath = process.argv[2];

    if (!csvPath) {
        console.log('il manque le chemin du fichier csv après le script node');
        process.exit(1);
        // le code 1 indique qu'on est sorti avec une erreur
    }

    const rows = readCSV(csvPath);

    console.log(` la valeur de rows est : ${rows[0].circo_code}`)

    
    let nb = 1;
    const lats = [];
    const longs = [];
    
    // chargement du JSON
    const data = readJson('public/data/ecoles.json');
    
    // idendification de la bonne circo pour lui fournir les bounds et le nombre d'écoles
    const circoCode = rows[0].circo_code;
    const circo = data.circonscriptions.find((e) => e.id === circoCode);
    const ecoles = data.ecoles;
    
    // le forEach ne n'attend pas les promesses, donc for

    for (const row of rows) {

        const addresseComplete = `${row.adresse}, ${row.cp} ${row.commune}`;
        const coords = await geocodeAdressGouv(addresseComplete);

        if (coords) {
            console.log(`coordonnées trouvées : ${coords[0]}, ${coords[1]}`);
        } else {
            console.log(`erreur de géocodage pour : ${row.nom_ecole}`);
        }

        // j'ajoute des données aux bounds
        lats.push(coords[0])
        longs.push(coords[1]);

        const ecole = {
            circo: {
                code: circoCode,
                nom: capitalize(circo.nom)
            },
            // String(nb) convertit nb en string pour lui appliquer padStart
            // padStart(2, '0') => je veux que ça fasse 2 caractère et que l'on rajoute, si besoin, un 0 devant.
            id: `92-${row.circo_code}-${String(nb).padStart(2, '0')}`,
            type: capitalize(row.type),
            nom: capitalize(row.nom_ecole),
            adresse: capitalize(row.adresse),
            commune: capitalize(row.commune),
            coordonnees: coords,
            email: row.mail,
            tel: row.telephone, 
            // direction : `${capitalize(row.titre_dir)} ${capitalize(row.prenom)} ${capitalize(row.nom)}`,
            nb_classes: row.nb_classes,
            REP: row.rep || null,
        };

        ecoles.push(ecole);
        nb++;

        
        // pour respecter les limites de l'api de géocodage
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    // calcule des bounds
    const bounds = calculateBounds(lats, longs);

    // transmission des infos à l'IEN (bounds et nb écoles)
    circo.bounds = bounds;
    circo.count_ecoles = nb - 1;

    writeJson('public/data/ecoles.json', data);

}

dataGenerate();
