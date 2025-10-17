import { v2 as cloudinary } from "cloudinary";
import config from "../config/config.js";
import sharp from "sharp";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

/**
 * Upload an image to Cloudinary
 * @param {Buffer} imageBuffer - Image buffer data
 * @param {string} fileName - Name for the file (used as public_id)
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<object>} Upload result with URL and public_id
 */
export const uploadToCloudinary = async (
  imageBuffer,
  fileName,
  options = {}
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "kisaan/products", // Organize in folders
        public_id: fileName,
        overwrite: true,
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" }, // Resize
          { quality: "auto:good" }, // Auto quality optimization
          { fetch_format: "auto" }, // Auto format (WebP when supported)
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      }
    );

    // Pipe the buffer to the upload stream
    uploadStream.end(imageBuffer);
  });
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

/**
 * Get optimized image URL
 * @param {string} publicId - The public ID of the image
 * @param {object} transformations - Cloudinary transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      ...transformations,
    ],
  });
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
};
