require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

if(supabase){
    console.log("SUPABASE CLIENT CREATED")
}

module.exports = supabase
