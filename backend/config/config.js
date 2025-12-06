require('dotenv').config()
const cloudinary =require('cloudinary').v2;

const Config=function(){
    cloudinary.config({ 
        cloud_name:process.env.CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
      });
    
    }

    module.exports=Config;