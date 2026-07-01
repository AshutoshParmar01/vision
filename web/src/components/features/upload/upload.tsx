"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { FileUpload } from "@/components/ui/file-upload";
import { CanvasRevealEffectDemo4 } from "#components/features/backgrounds/background2";

export function FileUploadDemo() {

  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileUpload = async (files: File[]) => {

    if (!files.length) return;

    setUploading(true);
    setMessage("Uploading...");

    try {

      const authToken = localStorage.getItem("authToken");

      for (const file of files) {

        const formData = new FormData();

        formData.append("photo", file);

        await axios.post(

          "http://localhost:5000/api/photo/upload",

          formData,

          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }

        );

      }

      setMessage("Upload Successful");

      setTimeout(() => {

        navigate("/gallery");

      }, 1000);

    } catch (err) {

      console.error(err);

      setMessage("Upload Failed");

    } finally {

      setUploading(false);

    }

  };

  return (

    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed mt-40 rounded-4xl bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 relative overflow-hidden">

      <div className="absolute inset-0 z-0">
        <CanvasRevealEffectDemo4 hovered={true} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-96">

        <FileUpload onChange={handleFileUpload} />

        <div className="mt-6 h-8">

          {uploading && (

            <p className="text-blue-400 animate-pulse text-lg">

              Uploading...

            </p>

          )}

          {!uploading && message && (

            <p
              className={`text-lg font-medium ${
                message.includes("Successful")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>

          )}

        </div>

      </div>

    </div>

  );

}
