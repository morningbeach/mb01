"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type InquiryStatus = "NEW" | "IN_PROGRESS" | "REPLIED" | "QUOTED" | "CONVERTED" | "CLOSED" | "SPAM";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  inquiryType: string;
  productType?: string;
  quantity?: string;
  timeline?: string;
  budget?: string;
  message: string;
  status: InquiryStatus;
  notes?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  repliedAt?: string;
};

const STATUS_COLORS: Record<InquiryStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  REPLIED: "bg-purple-100 text-purple-800",
  QUOTED: "bg-indigo-100 text-indigo-800",
  CONVERTED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  SPAM: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<InquiryStatus, string> = {
  NEW: "新訊息",
  IN_PROGRESS: "處理中",
  REPLIED: "已回覆",
  QUOTED: "已報價",
  CONVERTED: "已成交",
  CLOSED: "已結案",
  SPAM: "垃圾訊息",
};

export default function ContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadInquiries = async (status: string = statusFilter, page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (status !== "ALL") {
        params.append("status", status);
      }

      const res = await fetch(`/api/admin/contact-inquiries?${params}`);
      const data = await res.json();

      if (data.success) {
        setInquiries(data.inquiries);
        setPagination(data.pagination);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Failed to load inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch(`/api/admin/contact-inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          repliedAt: newStatus === "REPLIED" ? new Date().toISOString() : undefined,
        }),
      });

      if (res.ok) {
        loadInquiries(statusFilter, pagination.page);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這則訊息嗎？")) return;

    try {
      const res = await fetch(`/api/admin/contact-inquiries/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadInquiries(statusFilter, pagination.page);
      }
    } catch (error) {
      console.error("Failed to delete inquiry:", error);
    }
  };

  const openDetailModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">客戶詢價管理</h1>
          <p className="text-gray-600 mt-2">查看和管理所有客戶留言</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <button
            onClick={() => {
              setStatusFilter("ALL");
              loadInquiries("ALL", 1);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === "ALL"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">
              {Object.values(stats).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-sm text-gray-600">全部</div>
          </button>
          
          {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                loadInquiries(status, 1);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                statusFilter === status
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{stats[status] || 0}</div>
              <div className="text-sm text-gray-600">{STATUS_LABELS[status]}</div>
            </button>
          ))}
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">目前沒有詢價訊息</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      客戶
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      類型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      訊息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(inquiry.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                        <div className="text-sm text-gray-500">{inquiry.email}</div>
                        {inquiry.company && (
                          <div className="text-xs text-gray-400">{inquiry.company}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {inquiry.inquiryType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                          {inquiry.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusChange(inquiry.id, e.target.value as InquiryStatus)}
                          className={`text-xs px-2 py-1 rounded border-0 font-medium ${
                            STATUS_COLORS[inquiry.status]
                          }`}
                        >
                          {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[120px]">
                        <button
                          onClick={() => openDetailModal(inquiry)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          查看
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => loadInquiries(statusFilter, pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一頁
                </button>
                <span className="px-4 py-2">
                  第 {pagination.page} / {pagination.totalPages} 頁
                </span>
                <button
                  onClick={() => loadInquiries(statusFilter, pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">詢價詳情</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">客戶姓名</label>
                    <p className="text-gray-900">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.company && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">公司</label>
                      <p className="text-gray-900">{selectedInquiry.company}</p>
                    </div>
                  )}
                  {selectedInquiry.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                      <p className="text-gray-900">{selectedInquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">詢價類型</label>
                    <p className="text-gray-900">{selectedInquiry.inquiryType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">來源</label>
                    <p className="text-gray-900">{selectedInquiry.source}</p>
                  </div>
                  {selectedInquiry.productType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">產品類型</label>
                      <p className="text-gray-900">{selectedInquiry.productType}</p>
                    </div>
                  )}
                  {selectedInquiry.quantity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">數量</label>
                      <p className="text-gray-900">{selectedInquiry.quantity}</p>
                    </div>
                  )}
                  {selectedInquiry.timeline && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">時間表</label>
                      <p className="text-gray-900">{selectedInquiry.timeline}</p>
                    </div>
                  )}
                  {selectedInquiry.budget && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">預算</label>
                      <p className="text-gray-900">{selectedInquiry.budget}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">訊息內容</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">收到時間</label>
                    <p className="text-gray-900">{formatDate(selectedInquiry.createdAt)}</p>
                  </div>
                  {selectedInquiry.repliedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">回覆時間</label>
                      <p className="text-gray-900">{formatDate(selectedInquiry.repliedAt)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">當前狀態</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedInquiry.status]}`}>
                    {STATUS_LABELS[selectedInquiry.status]}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  關閉
                </button>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: 您的詢價 - ${selectedInquiry.name}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  回覆郵件
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
