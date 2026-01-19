// test-db.js
require('dotenv').config({ path: '.env.local' });
if (!process.env.DATABASE_URL) require('dotenv').config({ path: '.env' });

const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ ERREUR : DATABASE_URL manquant.");
    process.exit(1);
}

// NETTOYAGE : On enlève les paramètres d'URL pour gérer le SSL via le code
if (connectionString.includes('?')) {
    connectionString = connectionString.split('?')[0];
}

console.log("⏳ Tentative de connexion à Render...");
console.log("   (Si la base dort, cela peut prendre jusqu'à 60 secondes...)");

const client = new Client({
    connectionString: connectionString,
    // Configuration SSL OBLIGATOIRE pour Render
    ssl: {
        rejectUnauthorized: false 
    },
    // On attend 60 secondes avant d'abandonner (pour le réveil de la base)
    connectionTimeoutMillis: 60000, 
});

async function test() {
    try {
        await client.connect();
        console.log("✅ CONNEXION RÉUSSIE ! La base est réveillée.");
        const res = await client.query('SELECT version()');
        console.log(`   Version: ${res.rows[0].version}`);
    } catch (err) {
        console.error("❌ ÉCHEC :", err.message);
    } finally {
        await client.end();
    }
}

test();