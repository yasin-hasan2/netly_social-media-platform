import cloudinaryPkg from "cloudinary"; // Importing cloudinary package
//         name: user.name,
const { v2: cloudinary } = cloudinaryPkg; // Importing the v1 version of cloudinary
//         email: user.email,

// import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";

dotenv.config({});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export default cloudinary;
//   const { userId } = req.params;
