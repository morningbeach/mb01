// app/admin/images/page.tsx
import { AdminPageHeader } from "../components/AdminPageHeader";
import { R2ManagerClient } from "./r2-manager-client";

export const dynamic = "force-dynamic";

export default function R2ManagerPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Media"
        title="R2 Image Manager"
        description="Upload, organize, and manage images in your R2 storage with folder-like structure."
      />
      <R2ManagerClient />
    </>
  );
}
