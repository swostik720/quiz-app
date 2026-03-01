"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const categoryFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const defaultCategoryValues: CategoryFormValues = {
  title: "",
  description: "",
  image: "",
  isActive: true,
};

type CategoryFormProps = {
  initialValues?: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
};

export default function CategoryForm({
  initialValues = defaultCategoryValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: CategoryFormProps) {
  const [preview, setPreview] = useState(initialValues.image || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    values: initialValues,
  });

  const onSelectFile = (file?: File) => {
    if (!file) {
      setPreview("");
      setValue("image", "", { shouldValidate: true });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const encoded = typeof reader.result === "string" ? reader.result : "";
      setPreview(encoded);
      setValue("image", encoded, { shouldValidate: true });
    };

    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Science" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} placeholder="Questions for all levels" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="image">Category Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(event) => onSelectFile(event.target.files?.[0])}
        />
        <input type="hidden" {...register("image")} />

        {preview ? (
          <div className="relative h-36 w-full max-w-sm overflow-hidden rounded-md border">
            <Image src={preview} alt="Category preview" fill className="object-cover" />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No image selected</p>
        )}
      </div>

      <label className="flex items-center gap-2 md:col-span-2">
        <input type="checkbox" {...register("isActive")} />
        <span className="text-sm">Active</span>
      </label>

      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
