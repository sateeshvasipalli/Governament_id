"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { UploadCloud, X, File as FileIcon } from "lucide-react";
import { useFormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onChange: (file: File | null) => void;
  value: File | null;
  accept?: Record<string, string[]>;
  acceptLabel?: string;
  disabled?: boolean;
}

export function FileUploader({ 
  onChange, 
  value, 
  accept = { 
    "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    "application/pdf": [".pdf"],
  },
  acceptLabel = "PDF, PNG, JPG, JPEG, WEBP (MAX. 5MB)",
  disabled = false,
}: FileUploaderProps) {
  const { error } = useFormField();
  const [preview, setPreview] = useState<string | null>(
    value && value.type.startsWith("image/") ? URL.createObjectURL(value) : null
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onChange(file);
        if (file.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
    disabled,
  });

  const handleRemove = () => {
    onChange(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const hasImagePreview = preview;
  const hasFileValue = !!value;

  return (
    <div>
      {hasFileValue ? (
        <div className="relative group w-full rounded-lg border p-4 flex items-center gap-4 bg-card">
          {hasImagePreview ? (
             <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                <Image src={preview!} alt="File preview" layout="fill" objectFit="cover" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                <FileIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-grow truncate">
            <p className="font-medium truncate">{value.name}</p>
            <p className="text-sm text-muted-foreground">{(value.size / 1024).toFixed(2)} KB</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors",
            isDragActive && "border-primary bg-primary/10",
            error && "border-destructive",
            disabled && "cursor-not-allowed opacity-50 bg-muted"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">{acceptLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}
