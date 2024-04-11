const sharp = require("sharp");

// Function to resize and convert image to JPEG format
export async function resizeAndConvertToJPEG(fileData, maxWidth) {
  try {
    // Resize the image using Sharp
    const resizedImageBuffer = await sharp(fileData)
      .resize({ width: maxWidth })
      .jpeg() // Convert to JPEG format
      .toBuffer();

    console.log("Image resized and converted to JPEG successfully!");
    return resizedImageBuffer;
  } catch (error) {
    console.error("Error resizing and converting to JPEG:", error);
    throw error;
  }
}
