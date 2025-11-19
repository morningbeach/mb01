// app/admin/tags/DeleteTagButton.tsx
"use client";

type Props = {
  tagId: string;
  tagName: string;
};

export function DeleteTagButton({ tagId, tagName }: Props) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (
      !confirm(
        `確定要刪除這個 tag「${tagName}」嗎？刪除後會從所有產品關聯中移除。`
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <form
      action={`/api/admin/tags/${tagId}`}
      method="POST"
      className="md:pt-6"
    >
      <input type="hidden" name="_action" value="delete" />
      <button
        type="submit"
        onClick={handleClick}
        className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs text-zinc-600 hover:border-red-500 hover:text-red-600"
      >
        Delete
      </button>
    </form>
  );
}
