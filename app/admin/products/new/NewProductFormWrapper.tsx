"use client";

import ProductForm from "@/components/admin/ProductForm";
import { useRouter } from "next/navigation";

export default function NewProductFormWrapper() {
  const router = useRouter();

  return (
    <ProductForm onSuccess={() => router.push("/admin/products")} />
  );
}
