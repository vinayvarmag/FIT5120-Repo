/* src/lib/learningModules.js  – runtime-fetch version */

export const learningModules = [
    {
        id: "global-icons",
        title: "Global Icons (2025)",
        overview:
            "Meet the public figures that shaped politics, science, sport and pop-culture in 2025.",
        objectives: [
            "Identify at least one influential figure for every UN member state.",
            "Describe how their work affects global culture or policy.",
            "Compare contemporary influencers with historic icons from the same country."
        ],
        datasetKey: "celebrities"          // <── tells UI which JSON to fetch
    },

    {
        id: "traditional-arts",
        title: "Traditional Arts & Handicrafts",
        overview:
            "Explore artisan skills that embody cultural identity and community memory.",
        objectives: [
            "Match a craft to its country/region of origin.",
            "Explain the social or ritual role each craft plays locally.",
            "Evaluate how globalisation affects craft sustainability."
        ],
        datasetKey: "arts"
    },

    {
        id: "cultural-festivals",
        title: "Global Festival Almanac",
        overview:
            "Discover celebrations—ancient and modern—that bring communities together.",
        objectives: [
            "Locate major annual festivals on a world map.",
            "Outline each festival’s historical roots and key rituals.",
            "Compare cross-cultural themes such as harvest, new-year, or rites-of-passage."
        ],
        datasetKey: "festivals"
    },

    {
        id: "world-dishes",
        title: "World Cuisine Explorer",
        overview:
            "A pantry of recipes, flavours and food customs for interactive quizzes and games.",
        objectives: [
            "Identify signature dishes in a timed challenge.",
            "Discuss quiz around eating and serving food in different cultures.",
            "Relate dishes to climate, geography and trade history."
        ],
        datasetKey: "dishes",
        resources: {}
    }
];

/* alias + fast look-up, same names your UI already uses */
export const modulesIndex = learningModules;
export const modulesById  = Object.fromEntries(
    learningModules.map(m => [m.id, m])
);

export default modulesIndex;
