'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, Check, X, Film, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function VideoUploaderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
        setFile(null);
      } else {
        setError(data.error || '上傳失敗');
      }
    } catch (err: any) {
      setError(err.message || '上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.url) {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← 返回後台
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Film className="w-8 h-8" />
            影片上傳器
          </h1>
          <p className="text-gray-600 mt-2">
            上傳影片到 R2 CDN，取得網址用於首頁背景影片
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇影片檔案
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <button
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="清除"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {file && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Film className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    大小: {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                上傳中...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                上傳影片
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">上傳失敗</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 text-lg">上傳成功！</p>
                  <p className="text-sm text-green-700 mt-1">
                    {result.filename} ({formatFileSize(result.size)})
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    影片網址
                  </label>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已複製
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        複製網址
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded p-3 font-mono text-sm text-gray-800 break-all">
                  {result.url}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>使用方式：</strong> 將此網址複製到首頁編輯器的「背景影片網址」欄位中
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            注意事項
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• 支援格式：MP4, WebM, MOV 等影片格式</li>
            <li>• 檔案大小限制：100MB</li>
            <li>• 建議影片解析度：1920x1080 或 1280x720</li>
            <li>• 上傳後的影片會儲存在 R2 CDN，取得永久網址</li>
            <li>• 首頁背景影片建議使用較短的循環影片（10-30秒）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
