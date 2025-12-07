'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Trash2, Save, Loader2, 
  GripVertical, ToggleLeft, ToggleRight 
} from 'lucide-react';

interface PromptTemplate {
  id: string;
  name_zh: string;
  name_en: string;
  prompt: string;
  order: number;
  isActive: boolean;
}

export default function AiPromptsPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 新增表單
  const [newTemplate, setNewTemplate] = useState({
    name_zh: '',
    name_en: '',
    prompt: '',
  });

  // 載入範本
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/admin/ai-prompts');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('載入失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  // 新增範本
  const handleAdd = async () => {
    if (!newTemplate.name_zh || !newTemplate.prompt) {
      setError('請填寫名稱和提示詞');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const res = await fetch('/api/admin/ai-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTemplate,
          order: templates.length,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setTemplates([...templates, data.template]);
        setNewTemplate({ name_zh: '', name_en: '', prompt: '' });
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 更新範本
  const handleUpdate = async (template: PromptTemplate) => {
    try {
      const res = await fetch('/api/admin/ai-prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 切換啟用狀態
  const toggleActive = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    const updated = { ...template, isActive: !template.isActive };
    setTemplates(templates.map(t => t.id === id ? updated : t));
    await handleUpdate(updated);
  };

  // 刪除範本
  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此範本嗎？')) return;
    
    try {
      const res = await fetch(`/api/admin/ai-prompts?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (data.success) {
        setTemplates(templates.filter(t => t.id !== id));
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 更新範本欄位
  const updateTemplateField = (id: string, field: string, value: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  // 儲存單一範本
  const saveTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      await handleUpdate(template);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">AI 提示詞範本</h1>
          </div>
          <Link 
            href="/admin/ai-usage" 
            className="text-blue-600 hover:text-blue-800"
          >
            查看使用統計 →
          </Link>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* 載入中 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* 範本列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              {templates.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  尚無範本，請新增第一個
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {templates.map((template) => (
                    <div key={template.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <GripVertical className="w-5 h-5 text-gray-300 mt-2 cursor-grab" />
                        
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={template.name_zh}
                              onChange={(e) => updateTemplateField(template.id, 'name_zh', e.target.value)}
                              onBlur={() => saveTemplate(template.id)}
                              placeholder="中文名稱"
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={template.name_en}
                              onChange={(e) => updateTemplateField(template.id, 'name_en', e.target.value)}
                              onBlur={() => saveTemplate(template.id)}
                              placeholder="英文名稱"
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <textarea
                            value={template.prompt}
                            onChange={(e) => updateTemplateField(template.id, 'prompt', e.target.value)}
                            onBlur={() => saveTemplate(template.id)}
                            placeholder="提示詞（使用 {input} 作為使用者輸入佔位符）"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(template.id)}
                            className={`p-2 rounded-lg ${template.isActive ? 'text-green-600' : 'text-gray-400'}`}
                            title={template.isActive ? '已啟用' : '已停用'}
                          >
                            {template.isActive ? (
                              <ToggleRight className="w-6 h-6" />
                            ) : (
                              <ToggleLeft className="w-6 h-6" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 新增表單 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">新增範本</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newTemplate.name_zh}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name_zh: e.target.value })}
                    placeholder="中文名稱 *"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newTemplate.name_en}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name_en: e.target.value })}
                    placeholder="英文名稱"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  value={newTemplate.prompt}
                  onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
                  placeholder="提示詞 *（例如：將 logo 改為 {input}）"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  新增範本
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
