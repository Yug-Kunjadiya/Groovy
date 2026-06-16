require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { pipeline } = require("@xenova/transformers");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function run() {

    console.log("Loading model...");

    const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
    );

    const text = "Machine learning is a subset of AI.";

    const output = await extractor(text, {
        pooling: "mean",
        normalize: true,
    });

    const embedding = Array.from(output.data);

    console.log("Embedding size:", embedding.length);

    const { data, error } = await supabase
        .from("embeddings")
        .insert([
            {
                content: text,
                embedding: embedding
            }
        ]);

    console.log("Error:", error);
    console.log("Stored!");
}

run();