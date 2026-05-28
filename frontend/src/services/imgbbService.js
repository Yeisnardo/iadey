// src/services/imgbbService.js

const IMGBB_API_KEY = '09b5479106c1d5bd6370e88c8d9c70f9'; // 👈 ¡Pon tu key aquí!

/**
 * Sube una imagen a ImgBB
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} URL de la imagen subida
 */
export const uploadToImgBB = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();

    if (data.success) {
      return {
        url: data.data.url,
        thumbnail: data.data.thumb?.url,
        delete_url: data.data.delete_url,
        size: data.data.size,
        name: data.data.image?.filename || file.name
      };
    } else {
      throw new Error('Error al subir imagen');
    }
  } catch (error) {
    console.error('ImgBB Upload Error:', error);
    throw error;
  }
};

/**
 * Sube múltiples imágenes a ImgBB
 * @param {File[]} files - Array de archivos
 * @returns {Promise<Array>} Array con las URLs
 */
export const uploadMultipleToImgBB = async (files) => {
  const uploadPromises = files.map(file => uploadToImgBB(file));
  return Promise.all(uploadPromises);
};