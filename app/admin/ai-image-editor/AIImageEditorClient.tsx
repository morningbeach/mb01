'use client';

import { useState, useEffect } from 'react';

interface ImageItem {
  url: string;
  selected: boolean;
}

interface GeneratedResult {
  originalUrl: string;
  text?: string;
  imageBase64?: string;
  mimeType?: string;
}

export default function AIImageEditorClient() {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [password, setPassword] = useState('');
  const [passwordValidated, setPasswordValidated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });

  // Load folders on mount
  useEffect(() => {
    loadFolders();
    // Load saved API key
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setGeminiApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage
  useEffect(() => {
    if (geminiApiKey) {
      localStorage.setItem('gemini_api_key', geminiApiKey);
    }
  }, [geminiApiKey]);

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/admin/ai-image-editor?action=folders');
      const data = await response.json();
      if (data.folders) {
        setFolders(data.folders);
        if (data.folders.length > 0) {
          setSelectedFolder(data.folders[0]);
        }
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setMessage('載入資料夾失敗');
    }
  };

  const loadImages = async () => {
    if (!selectedFolder) {
      setMessage('請選擇一個資料夾');
      return;
    }

    setLoading(true);
    setMessage('');
    setImages([]);
    setSelectedImages([]);
    setGeneratedResults([]);
    setPasswordValidated(false);

    try {
      const response = await fetch(
        `/api/admin/ai-image-editor?action=images&folder=${encodeURIComponent(selectedFolder)}`
      );
      const data = await response.json();

      if (data.images && data.images.length > 0) {
        if (data.images.length > 10) {
          setImages(data.images.map((url: string) => ({ url, selected: false })));
          setShowPasswordModal(true);
          setMessage(`找到 ${data.images.length} 張圖片，需要輸入密碼才能查看全部`);
        } else {
          setImages(data.images.map((url: string) => ({ url, selected: false })));
          setPasswordValidated(true);
          setMessage(`載入了 ${data.images.length} 張圖片`);
        }
      } else {
        setMessage('此資料夾沒有圖片');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setMessage('載入圖片失敗');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await fetch('/api/admin/ai-image-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate-password',
          password,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setPasswordValidated(true);
        setShowPasswordModal(false);
        setMessage(`已驗證，顯示全部 ${images.length} 張圖片`);
      } else {
        setMessage('密碼錯誤');
      }
    } catch (error) {
      console.error('Error validating password:', error);
      setMessage('驗證失敗');
    }
  };

  const handleToggleImage = (url: string) => {
    if (!passwordValidated) {
      const currentIndex = images.findIndex(img => img.url === url);
      if (currentIndex >= 10) {
        setShowPasswordModal(true);
        setMessage('選擇超過 10 張圖片需要輸入密碼');
        return;
      }
    }

    setSelectedImages(prev =>
      prev.includes(url)
        ? prev.filter(u => u !== url)
        : [...prev, url]
    );
  };

  const handleToggleAll = () => {
    if (!passwordValidated && images.length > 10) {
      setShowPasswordModal(true);
      setMessage('選擇全部圖片需要輸入密碼');
      return;
    }

    const allSelected = selectedImages.length === images.length;
    setSelectedImages(allSelected ? [] : images.map(img => img.url));
  };

  const handleGenerate = async () => {
    if (!geminiApiKey.trim()) {
      setMessage('請輸入 Gemini API Key');
      return;
    }
    if (selectedImages.length === 0) {
      setMessage('請至少選擇一張圖片');
      return;
    }
    if (!passwordValidated && selectedImages.length > 10) {
      setShowPasswordModal(true);
      setMessage('處理超過 10 張圖片需要輸入密碼');
      return;
    }
    if (!prompt.trim()) {
      setMessage('請輸入提示詞');
      return;
    }

    setGenerating(true);
    setMessage('');
    setGeneratedResults([]);
    setCurrentProgress({ current: 0, total: selectedImages.length });

    const results: GeneratedResult[] = [];

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const imageUrl = selectedImages[i];
        setCurrentProgress({ current: i + 1, total: selectedImages.length });
        setMessage(`正在處理第 ${i + 1} / ${selectedImages.length} 張圖片...`);

        try {
          const response = await fetch('/api/admin/ai-image-editor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'analyze',
              geminiApiKey,
              imageUrl,
              prompt,
            }),
          });

          const data = await response.json();

          if (response.ok && data.result) {
            results.push({
              originalUrl: imageUrl,
              text: data.result.text,
              imageBase64: data.result.imageBase64,
              mimeType: data.result.mimeType,
            });
          } else {
            results.push({
              originalUrl: imageUrl,
              text: `錯誤: ${data.error || '處理失敗'}`,
            });
          }
        } catch (error) {
          results.push({
            originalUrl: imageUrl,
            text: `錯誤: ${error instanceof Error ? error.message : '處理失敗'}`,
          });
        }
      }

      setGeneratedResults(results);
      const successCount = results.filter(r => r.imageBase64).length;
      setMessage(`完成處理 ${results.length} 張圖片，成功生成 ${successCount} 張新圖片`);
    } catch (error) {
      console.error('Generation error:', error);
      setMessage('處理時發生錯誤');
    } finally {
      setGenerating(false);
      setCurrentProgress({ current: 0, total: 0 });
    }
  };

  const handleSaveGenerated = async (result: GeneratedResult) => {
    if (!selectedFolder) {
      setMessage('請選擇資料夾');
      return;
    }

    if (!result.imageBase64) {
      setMessage('沒有可儲存的圖片');
      return;
    }

    try {
      const response = await fetch('/api/admin/ai-image-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          imageBase64: result.imageBase64,
          originalUrl: result.originalUrl,
          folderDate: selectedFolder,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`已儲存到 /AItrend/${selectedFolder}/ok/`);
      } else {
        setMessage(`儲存失敗: ${data.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage('儲存時發生錯誤');
    }
  };

  const handleSaveAllGenerated = async () => {
    const generatedWithImages = generatedResults.filter(r => r.imageBase64);
    if (generatedWithImages.length === 0) {
      setMessage('沒有可儲存的圖片');
      return;
    }

    setMessage(`正在儲存 ${generatedWithImages.length} 張圖片...`);

    let savedCount = 0;
    for (const result of generatedWithImages) {
      try {
        const response = await fetch('/api/admin/ai-image-editor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save',
            imageBase64: result.imageBase64,
            originalUrl: result.originalUrl,
            folderDate: selectedFolder,
          }),
        });

        if (response.ok) {
          savedCount++;
        }
      } catch (error) {
        console.error('Save error:', error);
      }
    }

    setMessage(`成功儲存 ${savedCount} / ${generatedWithImages.length} 張圖片到 /AItrend/${selectedFolder}/ok/`);
  };

  const displayImages = passwordValidated ? images : images.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">需要密碼驗證</h3>
            <p className="text-sm text-gray-600 mb-4">
              查看或處理超過 10 張圖片需要輸入密碼
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <div className="flex space-x-3">
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                確認
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">AI 圖片編輯器 (Gemini 2.0 Flash)</h1>
        <p className="text-sm text-gray-500 mb-6">
          使用 Gemini 2.0 Flash 模型進行圖片分析與生成
        </p>

        {/* Gemini API Key */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Gemini API Key <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="請輸入您的 Gemini API Key"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            從 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a> 取得
          </p>
        </div>

        {/* Folder Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            選擇資料夾
          </label>
          <div className="flex space-x-3">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">請選擇日期資料夾</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
            <button
              onClick={loadImages}
              disabled={loading || !selectedFolder}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '載入中...' : '載入圖片'}
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            提示詞 (用於圖片編輯/生成)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`例如：\n- 將這個包裝盒的顏色改成紅色\n- 分析這個設計的風格並生成類似的設計\n- 移除背景並添加白色背景`}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || selectedImages.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-md hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {generating 
            ? `處理中 (${currentProgress.current}/${currentProgress.total})...` 
            : `🎨 AI 生成/編輯圖片 (${selectedImages.length} 張)`}
        </button>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('成功') || message.includes('完成') || message.includes('載入') || message.includes('已')
              ? 'bg-green-50 text-green-800'
              : message.includes('正在')
              ? 'bg-blue-50 text-blue-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Images Section */}
      {images.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              原始圖片 ({displayImages.length} / {images.length})
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedImages.length === images.length ? '取消全選' : '全選'}
              </button>
              <span className="text-sm text-gray-600">
                已選擇: {selectedImages.length} 張
              </span>
            </div>
          </div>

          {!passwordValidated && images.length > 10 && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
              ⚠️ 此資料夾有 {images.length} 張圖片，目前只顯示前 10 張。輸入密碼可查看全部。
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayImages.map((image, index) => {
              const isSelected = selectedImages.includes(image.url);

              return (
                <div
                  key={index}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggleImage(image.url)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Results Section */}
      {generatedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              🎨 生成結果 ({generatedResults.length} 張)
            </h2>
            {generatedResults.some(r => r.imageBase64) && (
              <button
                onClick={handleSaveAllGenerated}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
              >
                💾 儲存所有生成的圖片
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedResults.map((result, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                {/* Original vs Generated */}
                <div className="grid grid-cols-2 gap-1 bg-gray-100">
                  <div className="relative">
                    <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      原始
                    </div>
                    <img
                      src={result.originalUrl}
                      alt="Original"
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      生成
                    </div>
                    {result.imageBase64 ? (
                      <img
                        src={`data:${result.mimeType || 'image/png'};base64,${result.imageBase64}`}
                        alt="Generated"
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                        無圖片
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Response */}
                {result.text && (
                  <div className="p-3 bg-gray-50 border-t">
                    <p className="text-sm text-gray-700 line-clamp-4">
                      {result.text}
                    </p>
                  </div>
                )}

                {/* Save Button */}
                {result.imageBase64 && (
                  <div className="p-3 border-t">
                    <button
                      onClick={() => handleSaveGenerated(result)}
                      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      💾 儲存到 /ok/
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
