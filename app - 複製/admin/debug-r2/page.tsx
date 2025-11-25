'use client';

import { useState, useEffect } from 'react';

export default function DebugR2() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/images?prefix=uploads/');
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">R2 API 調試頁面</h1>
      
      {loading && <p>加載中...</p>}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          錯誤: {error}
        </div>
      )}
      
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">API 響應:</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold">圖片數量: {data.images?.length || 0}</h3>
            
            {data.images && data.images.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">圖片列表:</h3>
                <div className="space-y-2">
                  {data.images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <p><strong>Key:</strong> {img.key || img.id}</p>
                      <p><strong>URL:</strong> <a href={img.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">{img.url}</a></p>
                      <p><strong>Size:</strong> {img.size} bytes</p>
                      {img.url && (
                        <img src={img.url} alt={img.key} className="mt-2 max-w-xs" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
