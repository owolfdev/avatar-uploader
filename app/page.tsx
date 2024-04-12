"use client";
import { useTransition, useEffect, useState } from "react";
import {
  uploadImageToServer,
  logOutFromSupabase,
} from "@/actions/serverActions";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function AvatarUploader() {
  let [isPending, startTransition] = useTransition();
  const [loggingOut, setLoggingOut] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isPending) return;

    const supabase = createClient();

    const getAvatarImageFromSupabase = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("user", user?.id);
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select()
        .eq("id", user?.id)
        .single();

      setImageUrl(profile?.avatar_url);
    };

    getAvatarImageFromSupabase();
  }, [isPending]);

  const uploadAction = async (formData: FormData) => {
    startTransition(() => {
      uploadImageToServer(formData);
    });
  };

  const logOutAction = async () => {
    await logOutFromSupabase();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-12">
      <div className="z-10 max-w-xl w-full items-center justify-between flex flex-col gap-4 font-mono">
        <h1 className="text-4xl font-bold text-center">Image Uploader</h1>
        <p className="text-center">
          This is an uploader for images built with Next.js and Supabase.{" "}
        </p>

        {user ? (
          <div className="flex flex-col gap-2">
            <p className="font-bold">User: {user.email}</p>

            <form action={logOutAction} className="flex justify-center">
              <button
                className="border border-black rounded  py-1 px-2 hover:bg-gray-300"
                type="submit"
                onClick={() => setLoggingOut(true)}
              >
                {loggingOut ? <p>Logging Out...</p> : <p>Log Out</p>}
              </button>
            </form>
          </div>
        ) : (
          <div className="">
            <p className="text-center">
              You must{" "}
              <Link className="underline font-bold" href="/login">
                log in
              </Link>{" "}
              to use this app.{" "}
            </p>
          </div>
        )}
        <form action={uploadAction} className="flex flex-col gap-4 pt-4">
          <input type="file" name="file" />

          <button
            type="submit"
            className="border border-black rounded  py-1 px-2 hover:bg-gray-300"
            onClick={() => {
              setImageUrl(null);
            }}
          >
            {isPending ? "uploading..." : "upload"}{" "}
          </button>
        </form>
        <div className=" w-80 h-80 border border-black rounded relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="avatar"
              fill={true}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex flex-col justify-center">
              <p className="text-center p-8 text-black">
                {user ? (
                  <span>Avatar Image</span>
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
