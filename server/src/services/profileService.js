const supabase = require('../config/supabase')

const profile = async (req) => {
    const email = req.email
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if(data){
            return {
                data,
                status : 200
            }
        }else{
            return {
                error,
                status : 500
            }
        }
    } catch (error) {
        return {
            error,
            status : 401
        }
    }
}

module.exports = profile
