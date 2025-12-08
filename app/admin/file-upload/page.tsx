'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, Loader2, CheckCircle, X, Copy, FileVideo, FileImage, File } from 'lucide-react';

interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export default function FileUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newFiles: UploadedFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/file-upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          newFiles.push({
            filename: data.filename,
            url: data.url,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
          });
        } else {
          alert(`上傳失敗: ${file.name} - ${data.error}`);
        }
      }

      setUploadedFiles([...newFiles, ...uploadedFiles]);
    } catch (error) {
      console.error('上傳錯誤:', error);
      alert('上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <FileVideo className="w-5 h-5 text-purple-500" />;
    if (type.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">檔案上傳管理</h1>
          <p className="text-gray-600">上傳影片、圖片等檔案到 R2 CDN，取得永久網址</p>
        </div>

        {/* 上傳區域 */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            accept="video/*,image/*,application/pdf"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-lg text-gray-600">上傳中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  拖放檔案到這裡，或
                </p>
                <label
                  htmlFor="file-upload"
                  className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                >
                  點擊選擇檔案
                </label>
              </div>
              <p className="text-sm text-gray-500">
                支援影片 (MP4, MOV)、圖片 (JPG, PNG) 等格式
              </p>
            </div>
          )}
        </div>

        {/* 已上傳檔案列表 */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">已上傳檔案</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getFileIcon(file.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate mb-1">
                        {file.filename}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatFileSize(file.size)} · {new Date(file.uploadedAt).toLocaleString('zh-TW')}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono truncate">
                          {file.url}
                        </div>
                        <button
                          onClick={() => handleCopy(file.url)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          {copiedUrl === file.url ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              已複製
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              複製網址
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
