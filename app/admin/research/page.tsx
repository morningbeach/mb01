'use client';

// app/admin/research/page.tsx
// 研究系統主頁面 - 重定向到 v2 Studio

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ResearchPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 重定向到新版本
    router.replace('/admin/research/studio');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      <p className="mt-4 text-zinc-500">正在跳轉到 Research Studio v2...</p>
    </div>
  );
}
