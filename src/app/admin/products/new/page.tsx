// src/app/admin/products/new/page.tsx
// NEW FILE. The "Create a listing" screen. Uses the shared ProductForm.
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Create a listing â€” RosÃ© & Co Admin" };

export default function NewProductPage() {
  return <ProductForm mode="create" />;
}