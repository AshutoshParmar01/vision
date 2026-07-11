const supabase = require("../config/supabase");

async function recognizeFace(embedding, email) {

    const { data, error } =
        await supabase.rpc(
            "match_people",
            {
                query_embedding: embedding,
                user_email: email
            }
        );

    if (error)
        throw error;

    if (!data || data.length === 0)
        return null;

    const person = data[0];

    const { data: personData, error: personError } =
        await supabase
            .from("people")
            .select("id, name, avatar_url")
            .eq("id", person.id)
            .single();

    if (personError)
        throw personError;

    return {

        id: personData.id,

        name: personData.name,

        avatar_url: personData.avatar_url,

        confidence: person.similarity

    };

}

module.exports = {
    recognizeFace
};
