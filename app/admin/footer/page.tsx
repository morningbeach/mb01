"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type FooterData = {
  id: string;
  companyInfo: {
    taiwan: {
      name: string;
      taxId: string;
    };
    china: {
      name: string;
    };
  };
  addresses: {
    taiwan: string;
    china: string;
  };
  contact: {
    phone: string[];
    mobile: string;
    email: string;
  };
  clients: string[];
  qrCode: {
    enabled: boolean;
    url: string;
    description: string;
    imageUrl?: string;
  };
  socialLinks: {
    line: string;
    facebook?: string;
    instagram?: string;
  };
};

export default function FooterEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footerData, setFooterData] = useState<FooterData>({
    id: "main-footer",
    companyInfo: {
      taiwan: {
        name: "明日島嶼有限公司",
        taxId: "89188386"
      },
      china: {
        name: "天玎纸品包装有限公司"
      }
    },
    addresses: {
      taiwan: "台灣高雄市左營區立大路377巷6弄3號 (來訪請先預約)",
      china: "广东省深圳市龙岗区平湖镇峨公岭湖田路16号盈冠工业园1栋3楼"
    },
    contact: {
      phone: ["(07)3450928"],
      mobile: "0963581855",
      email: "morningbeachtw@gmail.com"
    },
    clients: [
      "碳佐麻里", "斑鳩的窩", "鮮乳坊", "喫茶小舖", "老牛皮La New", 
      "91app", "四皇國際有限公司", "誠品生活", "迪卡儂", "薰衣草森林",
      "新北市政府文化局", "余靜萍工作室有限公司", "統一棒球隊股份有限公司"
    ],
    qrCode: {
      enabled: true,
      url: "https://lin.ee/JRPBhOm",
      description: "掃碼加 LINE 好友",
      imageUrl: "https://img.mbpack.co/uploads/homepage/1764300510856-73b4be9a.png"
    },
    socialLinks: {
      line: "https://lin.ee/JRPBhOm"
    }
  });

  const [newClient, setNewClient] = useState("");

  useEffect(() => {
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      const res = await fetch("/api/admin/footer");
      if (res.ok) {
        const data = await res.json();
        if (data.footer) {
          setFooterData(data.footer);
        }
      }
    } catch (error) {
      console.error("載入頁腳資料失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ footerData }),
      });

      if (res.ok) {
        alert("頁腳設定已儲存！");
      } else {
        alert("儲存失敗，請重試");
      }
    } catch (error) {
      console.error("儲存失敗:", error);
      alert("儲存失敗，請重試");
    } finally {
      setSaving(false);
    }
  };

  const addClient = () => {
    if (newClient.trim()) {
      setFooterData(prev => ({
        ...prev,
        clients: [...prev.clients, newClient.trim()]
      }));
      setNewClient("");
    }
  };

  const removeClient = (index: number) => {
    setFooterData(prev => ({
      ...prev,
      clients: prev.clients.filter((_, i) => i !== index)
    }));
  };

  const addPhone = () => {
    setFooterData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        phone: [...prev.contact.phone, ""]
      }
    }));
  };

  const updatePhone = (index: number, value: string) => {
    setFooterData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        phone: prev.contact.phone.map((p, i) => i === index ? value : p)
      }
    }));
  };

  const removePhone = (index: number) => {
    setFooterData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        phone: prev.contact.phone.filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 mx-auto"></div>
          <p className="mt-2 text-sm text-zinc-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">頁腳編輯器</h1>
            <p className="mt-1 text-sm text-zinc-600">
              管理網站頁腳資訊、公司資料、客戶名單與 QR Code
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              返回
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "儲存中..." : "儲存設定"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* 公司資訊 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">公司資訊</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  台灣公司名稱
                </label>
                <input
                  type="text"
                  value={footerData.companyInfo.taiwan.name}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    companyInfo: {
                      ...prev.companyInfo,
                      taiwan: { ...prev.companyInfo.taiwan, name: e.target.value }
                    }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  統一編號
                </label>
                <input
                  type="text"
                  value={footerData.companyInfo.taiwan.taxId}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    companyInfo: {
                      ...prev.companyInfo,
                      taiwan: { ...prev.companyInfo.taiwan, taxId: e.target.value }
                    }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700">
                  中國公司名稱
                </label>
                <input
                  type="text"
                  value={footerData.companyInfo.china.name}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    companyInfo: {
                      ...prev.companyInfo,
                      china: { name: e.target.value }
                    }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* 地址資訊 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">地址資訊</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  台灣地址
                </label>
                <textarea
                  value={footerData.addresses.taiwan}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    addresses: { ...prev.addresses, taiwan: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  中國地址
                </label>
                <textarea
                  value={footerData.addresses.china}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    addresses: { ...prev.addresses, china: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* 聯絡資訊 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">聯絡資訊</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  電話號碼
                </label>
                {footerData.contact.phone.map((phone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => updatePhone(index, e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-300 px-3 py-2"
                      placeholder="(07)1234567"
                    />
                    {footerData.contact.phone.length > 1 && (
                      <button
                        onClick={() => removePhone(index)}
                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addPhone}
                  className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
                >
                  + 新增電話
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  手機號碼
                </label>
                <input
                  type="text"
                  value={footerData.contact.mobile}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, mobile: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="0963581855"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  電子郵件
                </label>
                <input
                  type="email"
                  value={footerData.contact.email}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="contact@company.com"
                />
              </div>
            </div>
          </div>

          {/* QR Code 設定 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">QR Code 設定</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="qr-enabled"
                  checked={footerData.qrCode.enabled}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    qrCode: { ...prev.qrCode, enabled: e.target.checked }
                  }))}
                  className="rounded border-zinc-300"
                />
                <label htmlFor="qr-enabled" className="text-sm font-medium text-zinc-700">
                  顯示 QR Code
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  LINE URL
                </label>
                <input
                  type="url"
                  value={footerData.qrCode.url}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    qrCode: { ...prev.qrCode, url: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="https://lin.ee/JRPBhOm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  QR Code 圖片網址 (選填)
                </label>
                <input
                  type="url"
                  value={footerData.qrCode.imageUrl || ''}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    qrCode: { ...prev.qrCode, imageUrl: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="https://img.mbpack.co/uploads/homepage/1764300510856-73b4be9a.png"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  如果填入圖片網址，將使用此圖片而不是自動產生的 QR Code
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  QR Code 說明文字
                </label>
                <input
                  type="text"
                  value={footerData.qrCode.description}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    qrCode: { ...prev.qrCode, description: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="掃碼加 LINE 好友"
                />
              </div>
            </div>
          </div>

          {/* 客戶名單 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">客戶名單</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addClient()}
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="新增客戶名稱..."
                />
                <button
                  onClick={addClient}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  新增
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {footerData.clients.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                  >
                    <span className="text-sm text-zinc-700">{client}</span>
                    <button
                      onClick={() => removeClient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}