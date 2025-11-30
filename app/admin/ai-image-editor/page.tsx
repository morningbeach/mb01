import { Metadata } from 'next';
import AIImageEditorClient from './AIImageEditorClient';

export const metadata: Metadata = {
  title: 'AI 圖片編輯器 | 管理後台',
  description: 'Gemini AI 圖片編輯與處理',
};

export default function AIImageEditorPage() {
  return <AIImageEditorClient />;
}
