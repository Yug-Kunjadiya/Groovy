require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { pipeline } = require("@xenova/transformers");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function run() {

    const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
    );

    const texts = [
        "Python is a programming language.",
        "RAG stands for Retrieval Augmented Generation.",
        "FastAPI is used for building APIs."
    ];

    for (const text of texts) {

        const output = await extractor(text, {
            pooling: "mean",
            normalize: true,
        });

        const embedding = Array.from(output.data);

        await supabase
            .from("embeddings")
            .insert([
                {
                    content: text,
                    embedding
                }
            ]);

        console.log("Stored:", text);
    }
}

run();