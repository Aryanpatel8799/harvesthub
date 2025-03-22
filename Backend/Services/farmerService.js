const Farmer = require('../db_models/farmerModel');

module.exports.createFarmer = async ({fullName,email,password}) => {
    
    if(!fullName || !email || !password){
        throw new Error('All fields are required');
    }
     
    try{
        const farmer = await Farmer.create({
            fullName,
            email,
            password,
        })
        return farmer;
        
    }
    catch(error){
        throw new Error(error);
    } 
    

    
}