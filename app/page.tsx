"use client";
import { useTransition, useEffect, useState } from "react";
import {
  uploadImageToServer,
  logOutFromSupabase,
} from "@/actions/serverActions";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function ClientComponent() {
  let [isPending, startTransition] = useTransition();
  const [loggingOut, setLoggingOut] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isPending) return;

    // THIS CODE WILL RUN AFTER THE SERVER ACTION

    const supabase = createClient();

    const getImageFromSupabase = async () => {
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

    getImageFromSupabase();
  }, [isPending]);

  const uploadAction = async (formData: FormData) => {
    startTransition(() => {
      uploadImageToServer(formData);
    });
  };

  const logOutAction = async (formData: FormData) => {
    await logOutFromSupabase(formData);
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
        <form action={uploadAction}>
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
