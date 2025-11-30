'use client';

import { useState } from 'react';

interface SiteConfig {
  id: string;
  name: string;
  category: 'design' | 'factory';
}

interface SearchResult {
  title: string;
  imageUrl: string;
  sourceUrl: string;
  site: string;
  selected?: boolean;
}

export default function TrendScannerV2Client() {
  const [apifyApiKey, setApifyApiKey] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultCount, setResultCount] = useState(20);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const sites: SiteConfig[] = [
    { id: 'pinterest', name: 'Pinterest', category: 'design' },
    { id: 'behance', name: 'Behance', category: 'design' },
    { id: 'dribbble', name: 'Dribbble', category: 'design' },
    { id: 'artstation', name: 'ArtStation', category: 'design' },
    { id: 'amazon', name: 'Amazon B2B', category: 'factory' },
    { id: '1688', name: '1688', category: 'factory' },
    { id: 'alibaba', name: 'Alibaba', category: 'factory' },
  ];

  const designSites = sites.filter(s => s.category === 'design');
  const factorySites = sites.filter(s => s.category === 'factory');

  const handleSiteToggle = (siteId: string) => {
    setSelectedSites(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSelectAll = (category: 'design' | 'factory') => {
    const categoryIds = sites.filter(s => s.category === category).map(s => s.id);
    const allSelected = categoryIds.every(id => selectedSites.includes(id));
    
    if (allSelected) {
      setSelectedSites(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedSites(prev => [...new Set([...prev, ...categoryIds])]);
    }
  };

  const handleSearch = async () => {
    if (!apifyApiKey.trim()) {
      setMessage('請輸入 Apify API Key');
      return;
    }
    if (!searchTerm.trim()) {
      setMessage('請輸入搜尋關鍵字');
      return;
    }
    if (selectedSites.length === 0) {
      setMessage('請至少選擇一個網站');
      return;
    }

    setLoading(true);
    setMessage('');
    setResults([]);

    try {
      const response = await fetch('/api/admin/trend-scanner-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          apifyApiKey,
          searchTerm,
          sites: selectedSites,
          limit: resultCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '搜尋失敗');
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results.map((r: SearchResult) => ({ ...r, selected: false })));
        setMessage(`找到 ${data.results.length} 筆結果`);
      } else {
        setMessage('未找到結果');
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage(error instanceof Error ? error.message : '搜尋時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResult = (index: number) => {
    setResults(prev =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleToggleAll = () => {
    const allSelected = results.every(r => r.selected);
    setResults(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  const handleSaveToR2 = async () => {
    const selectedResults = results.filter(r => r.selected);
    
    if (selectedResults.length === 0) {
      setMessage('請至少選擇一張圖片');
      return;
    }

    if (!apifyApiKey.trim()) {
      setMessage('請輸入 Apify API Key');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/trend-scanner-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          apifyApiKey,
          images: selectedResults.map(r => ({
            url: r.imageUrl,
            title: r.title,
            site: r.site,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '儲存失敗');
      }

      setMessage(`成功儲存 ${data.savedCount} 張圖片到 ${data.folder}`);
      
      // Clear selected images after successful save
      setResults(prev => prev.map(r => ({ ...r, selected: false })));
    } catch (error) {
      console.error('Save error:', error);
      setMessage(error instanceof Error ? error.message : '儲存時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = results.filter(r => r.selected).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">AI 趨勢掃描器 V2 (Apify)</h1>

        {/* API Key Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Apify API Key <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={apifyApiKey}
            onChange={(e) => setApifyApiKey(e.target.value)}
            placeholder="請輸入您的 Apify API Key"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            從 <a href="https://console.apify.com/account/integrations" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Apify Console</a> 取得
          </p>
        </div>

        {/* Search Term */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            搜尋關鍵字 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="例如: packaging design, gift box, 包裝盒設計"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Result Count */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            結果數量
          </label>
          <input
            type="number"
            value={resultCount}
            onChange={(e) => setResultCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 20)))}
            min="1"
            max="100"
            className="w-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-500">(1-100)</span>
        </div>

        {/* Site Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            選擇搜尋網站 <span className="text-red-500">*</span>
          </label>

          {/* Design Sites */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">設計類網站</h3>
              <button
                onClick={() => handleSelectAll('design')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {designSites.every(s => selectedSites.includes(s.id)) ? '取消全選' : '全選'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {designSites.map(site => (
                <label key={site.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSites.includes(site.id)}
                    onChange={() => handleSiteToggle(site.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">{site.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Factory Sites */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">工廠類網站</h3>
              <button
                onClick={() => handleSelectAll('factory')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {factorySites.every(s => selectedSites.includes(s.id)) ? '取消全選' : '全選'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {factorySites.map(site => (
                <label key={site.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSites.includes(site.id)}
                    onChange={() => handleSiteToggle(site.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">{site.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '搜尋中...' : '開始搜尋'}
        </button>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('成功') || message.includes('找到')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              搜尋結果 ({results.length} 筆)
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {results.every(r => r.selected) ? '取消全選' : '全選'}
              </button>
              <span className="text-sm text-gray-600">
                已選擇: {selectedCount} 張
              </span>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            {results.map((result, index) => (
              <div
                key={index}
                className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  result.selected
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleResult(index)}
              >
                <div className="aspect-square relative">
                  <img
                    src={result.imageUrl}
                    alt={result.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {result.selected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-gray-50">
                  <p className="text-xs font-medium text-gray-700 truncate" title={result.title}>
                    {result.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.site}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveToR2}
            disabled={saving || selectedCount === 0}
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '儲存中...' : `儲存選中的圖片到 R2 (${selectedCount} 張)`}
          </button>
        </div>
      )}
    </div>
  );
}
