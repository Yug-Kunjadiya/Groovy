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

    const question = "What does RAG mean?";

    const output = await extractor(question, {
        pooling: "mean",
        normalize: true,
    });

    const embedding = Array.from(output.data);

    const { data, error } = await supabase.rpc(
        "match_embeddings",
        {
            query_embedding: embedding,
            match_count: 3
        }
    );

    console.log("Results:");
    console.log(data);

    if (error) {
        console.log(error);
    }
}

run();