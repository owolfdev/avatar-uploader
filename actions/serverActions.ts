"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";

export const uploadImageToServer = async (formData: FormData) => {
  // redirect("/?message=uploading-image");
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const file = formData.get("file") as File;

  const buffer = await file.arrayBuffer();
  const fileDataForName = file as File;
  const fileName = fileDataForName?.name; // get the file name
  const fileNameWithoutExtension = fileName?.split(".")[0]; // get the file name without the extension

  const imageSize = 600;

  const resizedImage = await sharp(buffer)
    .resize(imageSize, imageSize)
    .toFormat("jpeg")
    .toBuffer();

  const currentDate = new Date();
  const secondsSince1970 = Math.floor(currentDate.getTime() / 1000);

  // Upload the file to the server!!!!!
  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(
      `${user?.id}/${secondsSince1970}_${fileNameWithoutExtension}.jpg`,
      resizedImage
    );

  if (error) {
    console.log(error);
  }
  console.log("data:", data);

  // Update the user profile with the avatar url!!!!!
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: `https://bnjiafgkkggnrizljoso.supabase.co/storage/v1/object/public/uploads/${data?.path}`,
    })
    .eq("id", user?.id);

  if (profileError) {
    console.log(profileError);
  }

  console.log("server action", file);
};

export const logOutFromSupabase = async (formData: FormData) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("user", user?.id);

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
  }

  redirect("/login");
};
