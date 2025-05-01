// scripts/convertDatasets.js
// node scripts/convertDatasets.js
import fs   from "fs";
import path from "path";
import csv  from "csv-parser";

/* ---------- helper: normalise BOM’d headers ---------- */
const stripBom = h => h.replace(/^\uFEFF/, "").trim();

/* ---------- where files live ---------- */
const rootIn  = "./datasets";       // raw CSVs
const rootOut = "./public/data";    // JSON output

/* ---------- job list ---------- */
const jobs = [
    /* 3.2.2 – Global Icons ------------------------------ */
    {
        src:  "Celebrities.csv",
        dest: "celebrities.json",
        map:  r => ({
            country:    r.country?.trim(),
            name:       (r.person_name ?? r["﻿person_name"])?.trim(),   // handles BOM
            occupation: r.person_occupation?.trim()
        })
    },

    /* 3.2.3 – Traditional Arts --------------------------- */
    {
        src:  "Arts_cleaned.csv",
        dest: "arts.json",
        map:  r => ({
            country:     r.country?.trim(),
            craft:       r["Arts/Crafts"]?.trim(),
            description: r.description?.trim() || ""
        })
    },

    /* 3.2.4 – Cultural Festivals ------------------------- */
    {
        src:  "Festivals_cleaned.csv",
        dest: "festivals.json",
        map:  r => ({
            country:  (r.Country ?? r["﻿Country"])?.trim(),
            festival: r.Festival?.trim()
        })
    },

    /* 3.2.6 – Worldwide Dishes -------------------------- */
    {
        src:  "Dishes_cleaned.csv",
        dest: "dishes.json",
        map:  r => ({
            country:     r.country?.trim(),
            localName:   r.local_name?.trim(),
            englishName: r.english_name?.trim(),
            type:        r.type_of_dish?.trim(),
            image:       r.public_cc_image_url?.trim(),
            note:        r.note?.trim() || ""
        })
    }
];

/* ---------- CSV → JSON pipeline ---------- */
jobs.forEach(({ src, dest, map }) => {
    const records = [];

    fs.createReadStream(path.join(rootIn, src))
        .pipe(csv({ mapHeaders: ({ header }) => stripBom(header) }))
        .on("data", row => records.push(map(row)))
        .on("end", () => {
            fs.mkdirSync(rootOut, { recursive: true });
            fs.writeFileSync(
                path.join(rootOut, dest),
                JSON.stringify(records, null, 2)
            );
            console.log(`✓ ${dest}  (${records.length} rows)`);
        });
});
