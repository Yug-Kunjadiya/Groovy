require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function test() {
    const { data, error } = await supabase
        .from("documents")
        .insert([
            {
                content: "RAG stands for Retrieval Augmented Generation",
                source: "test.txt"
            }
        ]);

    if (error) {
        console.log(error);
        return;
    }

    console.log("Supabase Connected Successfully!");
}

test();