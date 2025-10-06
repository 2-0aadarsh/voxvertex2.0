import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

export const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log('Successfully connected to Cloudinary');
  } catch (error) {
    console.log(error)
    console.log("Error connecting to Cloudinary:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export const uploadToCloudinary = async (file, folder = 'events') => {
  try {
    // Handle both buffer and file path uploads
    let uploadOptions = {
      folder: folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
      overwrite: true
    };

    // If file is a buffer, upload directly from buffer
    if (Buffer.isBuffer(file)) {
      uploadOptions = {
        ...uploadOptions,
        resource_type: "auto"
      };
      
      // For buffer uploads, we need to handle the promise differently
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', result.secure_url);
            resolve(result.secure_url);
          }
        }).end(file);
      });
    } else {
      // Handle file path uploads (legacy support)
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result.secure_url;
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};