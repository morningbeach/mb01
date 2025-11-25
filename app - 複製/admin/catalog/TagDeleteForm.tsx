// app/admin/tags/TagDeleteForm.tsx
"use client";

import * as React from "react";

type TagDeleteFormProps = {
  tagId: string;
  usageCount: number;
};

export function TagDeleteForm({ tagId, usageCount }: TagDeleteFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const message =
      usageCount > 0
        ? `This tag is used in ${usageCount} product(s). Delete anyway?`
        : "Delete this tag?";

    if (!confirm(message)) {
      e.preventDefault();
    }
  };

  return (
    <form
      action="/api/admin/tags/delete"
      method="POST"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="id" value={tagId} />
      <button
        type="submit"
        className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:border-red-400"
      >
        Delete
      </button>
    </form>
  );
}
