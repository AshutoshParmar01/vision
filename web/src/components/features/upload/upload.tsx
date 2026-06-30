"use client";
import  { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { CanvasRevealEffectDemo4 } from "#components/features/backgrounds/background2"; 

export function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed mt-40 rounded-4xl bg-white dark:bg-black border-neutral-200 dark:border-neutral-800">
      <div className="absolute inset-0 z-0">
        <CanvasRevealEffectDemo4 hovered={true} /> 
      </div>
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
}
