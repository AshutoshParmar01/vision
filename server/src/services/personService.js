const supabase = require("../config/supabase");

const THRESHOLD = 0.6;

async function findOrCreatePerson(embedding, email) {

    const embeddingString =
        "[" + embedding.join(",") + "]";

    const { data, error } =
        await supabase.rpc(
            "match_people",
            {
                query_embedding: embeddingString,
                user_email: email
            }
        );

    if (error) {
        throw error;
    }

    // ------------------------
    // No person exists yet
    // ------------------------

    if (!data || data.length === 0) {

        const {
            data: person,
            error: insertError
        } =
        await supabase
            .from("people")
            .insert({
                email,
                representative_embedding: embedding
            })
            .select()
            .single();

        if (insertError)
            throw insertError;

        return {
            id: person.id,
            isNew: true
        };

    }

    const nearestPerson = data[0];

    console.log(
        "Nearest Distance:",
        nearestPerson.distance
    );

    // ------------------------
    // Existing Person
    // ------------------------

    if (nearestPerson.distance < THRESHOLD) {

        return {
            id: nearestPerson.id,
            isNew: false
        };

    }

    // ------------------------
    // New Person
    // ------------------------

    const {
        data: person,
        error: insertError
    } =
    await supabase
        .from("people")
        .insert({
            email,
            representative_embedding: embedding
        })
        .select()
        .single();

    if (insertError)
        throw insertError;

    return {
        id: person.id,
        isNew: true
    };

}

module.exports = {
    findOrCreatePerson
};
