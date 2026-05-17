'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  // 100MB limit check (100 * 1024 * 1024 bytes)
  const MAX_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('File too large (Max 100MB). Please use an external link instead.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        resource_type: 'auto',
        folder: 'ringzone',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url);
      }
    ).end(buffer);
  });
}
