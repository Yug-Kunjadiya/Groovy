const { pipeline } = require("@xenova/transformers");

async function run() {
    console.log("Loading model...");

    const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Model loaded!");

    const output = await extractor(
        "Machine learning is a subset of AI.",
        {
            pooling: "mean",
            normalize: true,
        }
    );

    console.log("Vector length:", output.data.length);
}

run();