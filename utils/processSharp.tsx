import sharp from "sharp";

export const processImage = async (fileField: any) => {
  const image = sharp(await fileField.arrayBuffer())
    .resize(800, 800)
    .toBuffer();

  console.log("image", image);
  return image;
};
