'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Package, Gift, FileText, Target, Layers, Sparkles,
  Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Save,
  X, Check, ChevronDown, ChevronUp, Search, AlertCircle
} from 'lucide-react';

// Icon 對照表
const iconMap: Record<string, any> = {
  Package, Gift, FileText, Target, Layers, Sparkles,
};

const availableIcons = ['Package', 'Gift', 'FileText', 'Target', 'Layers', 'Sparkles'];

// 類型定義
interface Tag {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  productCount: number;
}

interface Dimension {
  id: string;
  slug: string;
  category: string;
  name_zh: string;
  name_en: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  allow_multiple: boolean;
  tags: Tag[];
}

// 維度編輯對話框
function DimensionEditModal({
  dimension,
  onSave,
  onClose,
}: {
  dimension: Dimension | null;
  onSave: (data: Partial<Dimension>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name_zh: dimension?.name_zh || '',
    name_en: dimension?.name_en || '',
    slug: dimension?.slug || '',
    icon: dimension?.icon || 'Package',
    allow_multiple: dimension?.allow_multiple ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {dimension ? '編輯維度' : '新增維度'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                中文名稱
              </label>
              <input
                type="text"
                value={formData.name_zh}
                onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                英文名稱
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug（網址識別碼）
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：folding-carton"
              required
              disabled={!!dimension}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖示
            </label>
            <div className="flex gap-2 flex-wrap">
              {availableIcons.map((iconName) => {
                const IconComponent = iconMap[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.icon === iconName
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allow_multiple"
              checked={formData.allow_multiple}
              onChange={(e) => setFormData({ ...formData, allow_multiple: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="allow_multiple" className="text-sm text-gray-700">
              允許多選
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              儲存
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Tag 編輯對話框
function TagEditModal({
  tag,
  dimensionId,
  onSave,
  onClose,
}: {
  tag: Tag | null;
  dimensionId: string;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name_zh: tag?.name_zh || '',
    name_en: tag?.name_en || '',
    slug: tag?.slug || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, dimensionId });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {tag ? '編輯標籤' : '新增標籤'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              中文名稱
            </label>
            <input
              type="text"
              value={formData.name_zh}
              onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              英文名稱
            </label>
            <input
              type="text"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="自動生成或手動輸入"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              儲存
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// 維度卡片組件
function DimensionCard({
  dimension,
  onEdit,
  onToggleActive,
  onDelete,
  onEditTag,
  onAddTag,
  onDeleteTag,
}: {
  dimension: Dimension;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onEditTag: (tag: Tag) => void;
  onAddTag: () => void;
  onDeleteTag: (tagId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = dimension.icon ? iconMap[dimension.icon] : Package;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl border-2 transition-all ${
        dimension.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <div className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        <div className={`p-2 rounded-lg ${dimension.is_active ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <IconComponent className={`w-5 h-5 ${dimension.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{dimension.name_zh}</h3>
          <p className="text-sm text-gray-500">{dimension.name_en} · {dimension.tags.length} 個標籤</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleActive}
            className={`p-2 rounded-lg transition-colors ${
              dimension.is_active
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={dimension.is_active ? '停用' : '啟用'}
          >
            {dimension.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="編輯"
          >
            <Pencil className="w-5 h-5" />
          </button>

          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="刪除"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Tags List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">標籤列表</span>
                <button
                  onClick={onAddTag}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4" />
                  新增標籤
                </button>
              </div>

              <div className="space-y-2">
                {dimension.tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                      <div>
                        <span className="font-medium text-gray-800">{tag.name_zh}</span>
                        <span className="ml-2 text-sm text-gray-500">{tag.name_en}</span>
                      </div>
                      {tag.productCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {tag.productCount} 產品
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTag(tag)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTag(tag.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {dimension.tags.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>尚無標籤</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 主頁面組件
export default function DimensionAdminPage() {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDimension, setEditingDimension] = useState<Dimension | null | 'new'>(null);
  const [editingTag, setEditingTag] = useState<{ tag: Tag | null; dimensionId: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 載入維度
  useEffect(() => {
    loadDimensions();
  }, []);

  const loadDimensions = async () => {
    try {
      const res = await fetch('/api/filter-dimensions?category=print-packaging&includeInactive=true');
      const data = await res.json();
      if (data.success) {
        setDimensions(data.data);
      }
    } catch (error) {
      console.error('Error loading dimensions:', error);
      showMessage('error', '載入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 模擬儲存維度（實際需要後端 API）
  const handleSaveDimension = async (data: Partial<Dimension>) => {
    // TODO: 實作後端 API 呼叫
    showMessage('success', '儲存成功（DEMO 模式）');
    setEditingDimension(null);
    loadDimensions();
  };

  // 模擬切換啟用狀態
  const handleToggleActive = async (dimensionId: string) => {
    setDimensions((prev) =>
      prev.map((d) =>
        d.id === dimensionId ? { ...d, is_active: !d.is_active } : d
      )
    );
    showMessage('success', '狀態已更新（DEMO 模式）');
  };

  // 模擬刪除維度
  const handleDeleteDimension = async (dimensionId: string) => {
    if (!confirm('確定要刪除此維度嗎？相關的標籤關聯也會被移除。')) return;
    setDimensions((prev) => prev.filter((d) => d.id !== dimensionId));
    showMessage('success', '已刪除（DEMO 模式）');
  };

  // 模擬儲存標籤
  const handleSaveTag = async (data: any) => {
    showMessage('success', '標籤已儲存（DEMO 模式）');
    setEditingTag(null);
    loadDimensions();
  };

  // 模擬刪除標籤
  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('確定要從此維度移除此標籤嗎？')) return;
    showMessage('success', '標籤已移除（DEMO 模式）');
    loadDimensions();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">維度管理</h1>
              <p className="text-sm text-gray-500 mt-1">
                管理包裝盒篩選維度與標籤
              </p>
            </div>

            <button
              onClick={() => setEditingDimension('new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增維度
            </button>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
              message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {dimensions.map((dimension) => (
                <DimensionCard
                  key={dimension.id}
                  dimension={dimension}
                  onEdit={() => setEditingDimension(dimension)}
                  onToggleActive={() => handleToggleActive(dimension.id)}
                  onDelete={() => handleDeleteDimension(dimension.id)}
                  onEditTag={(tag) => setEditingTag({ tag, dimensionId: dimension.id })}
                  onAddTag={() => setEditingTag({ tag: null, dimensionId: dimension.id })}
                  onDeleteTag={handleDeleteTag}
                />
              ))}
            </AnimatePresence>

            {dimensions.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">尚無維度</h3>
                <p className="text-gray-400 mt-2">點擊上方「新增維度」開始建立</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dimension Edit Modal */}
      <AnimatePresence>
        {editingDimension && (
          <DimensionEditModal
            dimension={editingDimension === 'new' ? null : editingDimension}
            onSave={handleSaveDimension}
            onClose={() => setEditingDimension(null)}
          />
        )}
      </AnimatePresence>

      {/* Tag Edit Modal */}
      <AnimatePresence>
        {editingTag && (
          <TagEditModal
            tag={editingTag.tag}
            dimensionId={editingTag.dimensionId}
            onSave={handleSaveTag}
            onClose={() => setEditingTag(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
