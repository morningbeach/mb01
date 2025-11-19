// app/admin/products/DeleteProductButton.tsx
"use client";

type Props = {
  id: string;
  name: string;
};

export function DeleteProductButton({ id, name }: Props) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const ok = window.confirm(
      `確定要刪除「${name}」嗎？\n這個動作無法復原，相關套組關聯也會一起刪除。`
    );
    if (!ok) {
      e.preventDefault();
    }
  };

  return (
    <form
      method="POST"
      action={`/admin/products/${id}/delete`}
      onSubmit={onSubmit}
    >
      <button
        type="submit"
        className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:border-red-400 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
