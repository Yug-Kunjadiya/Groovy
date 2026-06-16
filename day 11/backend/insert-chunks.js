require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

console.log("Starting...");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function run() {

    console.log("Inside run()");

    const chunks = [
        "Python is a programming language.",
        "Machine learning is a subset of AI.",
        "RAG stands for Retrieval Augmented Generation."
    ];

    const rows = chunks.map(chunk => ({
        content: chunk,
        source: "test.txt"
    }));

    const { data, error } = await supabase
        .from("document_chunks")
        .insert(rows)
        .select();

    console.log("Data:", data);
    console.log("Error:", error);

    if (error) {
        console.log("Insert failed");
        return;
    }

    console.log("Chunks inserted!");
}

run();