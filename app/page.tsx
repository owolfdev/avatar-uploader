import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

export default async function Home({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("user", user?.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user?.id)
    .single();

  let imageLoading = false;

  const uploadFile = async (formData: FormData) => {
    "use server";

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

    revalidatePath("/");
  };

  const logOut = async (formData: FormData) => {
    "use server";

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("user", user?.id);

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }

    return redirect("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between flex flex-col gap-6 font-mono text-sm">
        <h1 className="text-4xl font-bold text-center">Image Uploader</h1>
        <p className="text-center">
          This is an uploader for images built with Next.js and Supabase.{" "}
        </p>

        {user ? (
          <div className="flex flex-col gap-4 border border-black rounded p-8">
            <h1 className="text-4xl font-bold text-center">Welcome</h1>
            <p className="font-bold">User: {user.email}</p>
            <p className="text-center">You can upload images now.</p>
            <form action={logOut} className="flex justify-center">
              <button
                className="border border-black rounded  py-1 px-2 hover:bg-gray-300"
                type="submit"
              >
                Log out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4 border border-black rounded p-8">
            <h1 className="text-4xl font-bold text-center">Hello</h1>
            <p className="text-center">
              You must{" "}
              <Link className="underline font-bold" href="/login">
                log in
              </Link>{" "}
              before uploading.{" "}
            </p>
          </div>
        )}
        <form action={uploadFile}>
          <input type="file" name="file" />
          <button
            type="submit"
            className="border border-black rounded  py-1 px-2 hover:bg-gray-300"
          >
            Upload
          </button>
        </form>
        <div className=" w-80 h-80 border border-black rounded relative">
          {imageLoading && <p>loading image</p>}
          {profile?.avatar_url ? (
            <Image
              src={profile?.avatar_url}
              alt="avatar"
              fill={true}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex flex-col justify-center">
              <p className="text-center p-8 text-black">
                {user ? (
                  <span>No image</span>
                ) : (
                  <span>You need to be logged in to see your avatar</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
