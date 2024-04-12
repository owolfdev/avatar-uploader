"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import sharp from "sharp";

const IMAGE_SIZE = 600;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const uploadImageToServer = async (formData: FormData) => {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication failed");

    const file = formData.get("file") as File;
    const resizedImage = await resizeImage(file);

    const fileName = file.name.split(".")[0];
    const timestamp = Math.floor(Date.now() / 1000);
    const filePath = `${user.id}/${timestamp}_${fileName}.jpg`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, resizedImage);

    if (error) throw error;

    const avatarUrl = `${SUPABASE_URL}/storage/v1/object/public/uploads/${data.path}`;
    await updateUserProfile(user.id, avatarUrl, supabase);
  } catch (error) {
    console.error("Failed to upload image:", error);
  }
};

const resizeImage = async (file: File): Promise<Buffer> => {
  const buffer = await file.arrayBuffer();
  return sharp(buffer)
    .resize(IMAGE_SIZE, IMAGE_SIZE)
    .toFormat("jpeg")
    .toBuffer();
};

const updateUserProfile = async (
  userId: string,
  avatarUrl: string,
  supabase: any
) => {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);

  if (error) throw error;
};

export const logOutFromSupabase = async () => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    redirect("/login");
  }
};
