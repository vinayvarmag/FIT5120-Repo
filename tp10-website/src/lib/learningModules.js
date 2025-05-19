/* src/lib/learningModules.js  – now with thumbnail images, enriched objectives, and section intros */

export const learningModules = [
    {
        id: "global-icons",
        /* ⬇ put the image in /public/images/modules/1-global-icons.webp */
        img: "/modules/1-global-icons.jpg",
        title: "Global Icons",
        overview: [
            "Meet the public figures that shaped politics, science, sport and pop-culture in 2025."
        ],
        objectives: [
            "Identify at least one influential figure for every UN member state.",
            "Describe how their work affects global culture or policy.",
            "Compare contemporary influencers with historic icons from the same country.",
            "Analyze the global impact of a selected icon's contributions."
        ],
        resourcesIntro: "Explore curated articles and videos to deepen your understanding of these influential figures.",
        quizIntro: "Test your knowledge of Global Icons with this short quiz!",
        datasetKey: "celebrities"
    },

    {
        id: "traditional-arts",
        img: "/modules/2-traditional-arts.jpg",
        title: "Traditional Arts",
        overview:
            "Explore artisan skills that embody cultural identity and community memory.",
        objectives: [
            "Match a craft to its country/region of origin.",
            "Explain the social or ritual role each craft plays locally.",
            "Evaluate how globalisation affects craft sustainability.",
            "Research the evolution of one traditional art form over time."
        ],
        resourcesIntro: "Browse supplemental materials—articles, documentaries and galleries—on traditional arts around the world.",
        quizIntro: "Try a quiz to identify crafts and their origins!",
        datasetKey: "arts"
    },

    {
        id: "cultural-festivals",
        img: "/modules/3-cultural-festivals.jpg",
        title: "Global Festivals",
        overview:
            "Discover celebrations—ancient and modern—that bring communities together.",
        objectives: [
            "Locate major annual festivals on a world map.",
            "Outline each festival’s historical roots and key rituals.",
            "Compare cross-cultural themes such as harvest, new-year, or rites-of-passage.",
            "Assess how contemporary festivals adapt tradition for modern audiences."
        ],
        resourcesIntro: "Here are some articles and videos to explore the traditions behind these festivals.",
        quizIntro: "See how well you remember festival histories with our quiz!",
        datasetKey: "festivals"
    },

    {
        id: "world-dishes",
        img: "/modules/4-world-dishes.jpg",
        title: "World Cuisines",
        overview:
            "A pantry of recipes, flavours and food customs for interactive quizzes and games.",
        objectives: [
            "Identify signature dishes in a timed challenge.",
            "Discuss eating and serving customs in different cultures.",
            "Relate dishes to climate, geography and trade history.",
            "Create a recipe plan combining ingredients from multiple cuisines."
        ],
        resourcesIntro: "Check out selected articles, videos, and recipes to expand your culinary horizons.",
        quizIntro: "Put your world cuisine knowledge to the test!",
        datasetKey: "dishes",
        resources: {
            articles: [
                {
                    title: "The Science of Taste",
                    url: "https://example.com/science-of-taste"
                }
            ],
            videos: [
                {
                    title: "Street Food Around the World",
                    url: "https://youtube.com/watch?v=example4"
                }
            ]
        }
    }
];

export const modulesIndex = learningModules;
export const modulesById = Object.fromEntries(
    learningModules.map(m => [m.id, m])
);

export default modulesIndex;
