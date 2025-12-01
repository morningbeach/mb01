"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImagePicker from "../components/ImagePicker";

type FooterData = {
  id: string;
  companyInfo: {
    taiwan: {
      name: string;
      nameEn: string;
      taxId: string;
    };
    china: {
      name: string;
      nameEn: string;
    };
  };
  addresses: {
    taiwan: string;
    taiwanEn: string;
    china: string;
    chinaEn: string;
  };
  contact: {
    phone: string[];
    mobile: string;
    email: string;
  };
  clientLogos: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  qrCodes: {
    line: {
      enabled: boolean;
      url: string;
      imageUrl: string;
      description: string;
      descriptionEn: string;
    };
    whatsapp: {
      enabled: boolean;
      url: string;
      imageUrl: string;
      description: string;
      descriptionEn: string;
    };
  };
  socialLinks: {
    youtube: string;
    pinterest: string;
    instagram: string;
    facebook: string;
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
        nameEn: "Morning Beach Co., Ltd.",
        taxId: "89188386"
      },
      china: {
        name: "天玎纸品包装有限公司",
        nameEn: "Tianding Paper Packaging Co., Ltd."
      }
    },
    addresses: {
      taiwan: "台灣高雄市左營區立大路377巷6弄3號 (來訪請先預約)",
      taiwanEn: "No. 3, Aly. 6, Ln. 377, Lida Rd., Zuoying Dist., Kaohsiung City, Taiwan (By appointment only)",
      china: "广东省深圳市龙岗区平湖镇峨公岭湖田路16号盈冠工业园1栋3楼",
      chinaEn: "3F, Building 1, Yingguan Industrial Park, No.16 Hutian Road, Egongling, Pinghu Town, Longgang District, Shenzhen, Guangdong, China"
    },
    contact: {
      phone: ["(07)3450928"],
      mobile: "0963581855",
      email: "morningbeachtw@gmail.com"
    },
    clientLogos: [],
    qrCodes: {
      line: {
        enabled: true,
        url: "https://lin.ee/JRPBhOm",
        imageUrl: "https://img.mbpack.co/uploads/1764581109210-2d829e59.png",
        description: "掃碼加 LINE 好友",
        descriptionEn: "Scan to add LINE friend"
      },
      whatsapp: {
        enabled: true,
        url: "https://wa.me/886963581855",
        imageUrl: "",
        description: "掃碼聯絡 WhatsApp",
        descriptionEn: "Scan to contact via WhatsApp"
      }
    },
    socialLinks: {
      youtube: "",
      pinterest: "",
      instagram: "",
      facebook: ""
    }
  });

  const [translating, setTranslating] = useState<string>("");

  useEffect(() => {
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      const res = await fetch("/api/admin/footer");
      if (res.ok) {
        const data = await res.json();
        if (data.footer) {
          setFooterData(prev => ({
            ...prev,
            ...data.footer,
            companyInfo: {
              taiwan: { ...prev.companyInfo.taiwan, ...data.footer.companyInfo?.taiwan },
              china: { ...prev.companyInfo.china, ...data.footer.companyInfo?.china }
            },
            addresses: { ...prev.addresses, ...data.footer.addresses },
            qrCodes: {
              line: { ...prev.qrCodes.line, ...data.footer.qrCodes?.line },
              whatsapp: { ...prev.qrCodes.whatsapp, ...data.footer.qrCodes?.whatsapp }
            },
            socialLinks: { ...prev.socialLinks, ...data.footer.socialLinks },
            clientLogos: data.footer.clientLogos || []
          }));
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

  const handleTranslate = async (sourceValue: string, targetPath: string) => {
    if (!sourceValue.trim()) {
      alert("來源文字不能為空");
      return;
    }
    
    setTranslating(targetPath);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceValue,
          from: "zh",
          to: "en",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFooterData(prev => {
          const newData = JSON.parse(JSON.stringify(prev));
          const keys = targetPath.split(".");
          let obj = newData;
          for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
          }
          obj[keys[keys.length - 1]] = data.translatedText;
          return newData;
        });
      } else {
        alert(data.error || "翻譯失敗");
      }
    } catch (error) {
      console.error("翻譯錯誤:", error);
      alert("翻譯時發生錯誤");
    } finally {
      setTranslating("");
    }
  };

  const addClientLogo = (url: string) => {
    if (footerData.clientLogos.length >= 10) {
      alert("最多只能上傳 10 個客戶 Logo");
      return;
    }
    const newLogo = {
      id: Date.now().toString(),
      url,
      name: `客戶 ${footerData.clientLogos.length + 1}`
    };
    setFooterData(prev => ({
      ...prev,
      clientLogos: [...prev.clientLogos, newLogo]
    }));
  };

  const removeClientLogo = (id: string) => {
    setFooterData(prev => ({
      ...prev,
      clientLogos: prev.clientLogos.filter(logo => logo.id !== id)
    }));
  };

  const updateClientLogoName = (id: string, name: string) => {
    setFooterData(prev => ({
      ...prev,
      clientLogos: prev.clientLogos.map(logo =>
        logo.id === id ? { ...logo, name } : logo
      )
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

  const TranslateButton = ({ sourceValue, targetPath }: { sourceValue: string; targetPath: string }) => (
    <button
      type="button"
      onClick={() => handleTranslate(sourceValue, targetPath)}
      disabled={translating === targetPath || !sourceValue.trim()}
      className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {translating === targetPath ? "翻譯中..." : "→ 翻譯"}
    </button>
  );

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
              管理網站頁腳資訊（支援中英文）、QR Code、社群連結與客戶 Logo
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
          {/* 公司資訊 - 中英文 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">公司資訊</h2>
            <div className="space-y-6">
              {/* 台灣公司 */}
              <div className="p-4 bg-zinc-50 rounded-lg">
                <h3 className="font-medium text-zinc-800 mb-3">🇹🇼 台灣公司</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">中文名稱</label>
                    <div className="flex items-center">
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
                        className="mt-1 flex-1 rounded-lg border border-zinc-300 px-3 py-2"
                      />
                      <TranslateButton 
                        sourceValue={footerData.companyInfo.taiwan.name} 
                        targetPath="companyInfo.taiwan.nameEn" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">English Name</label>
                    <input
                      type="text"
                      value={footerData.companyInfo.taiwan.nameEn}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        companyInfo: {
                          ...prev.companyInfo,
                          taiwan: { ...prev.companyInfo.taiwan, nameEn: e.target.value }
                        }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">統一編號</label>
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
                </div>
              </div>

              {/* 中國公司 */}
              <div className="p-4 bg-zinc-50 rounded-lg">
                <h3 className="font-medium text-zinc-800 mb-3">🇨🇳 中國公司</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">中文名稱</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={footerData.companyInfo.china.name}
                        onChange={(e) => setFooterData(prev => ({
                          ...prev,
                          companyInfo: {
                            ...prev.companyInfo,
                            china: { ...prev.companyInfo.china, name: e.target.value }
                          }
                        }))}
                        className="mt-1 flex-1 rounded-lg border border-zinc-300 px-3 py-2"
                      />
                      <TranslateButton 
                        sourceValue={footerData.companyInfo.china.name} 
                        targetPath="companyInfo.china.nameEn" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">English Name</label>
                    <input
                      type="text"
                      value={footerData.companyInfo.china.nameEn}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        companyInfo: {
                          ...prev.companyInfo,
                          china: { ...prev.companyInfo.china, nameEn: e.target.value }
                        }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 地址資訊 - 中英文 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">地址資訊</h2>
            <div className="space-y-6">
              {/* 台灣地址 */}
              <div className="p-4 bg-zinc-50 rounded-lg">
                <h3 className="font-medium text-zinc-800 mb-3">🇹🇼 台灣地址</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">中文地址</label>
                    <div className="flex items-start">
                      <textarea
                        value={footerData.addresses.taiwan}
                        onChange={(e) => setFooterData(prev => ({
                          ...prev,
                          addresses: { ...prev.addresses, taiwan: e.target.value }
                        }))}
                        className="mt-1 flex-1 rounded-lg border border-zinc-300 px-3 py-2"
                        rows={2}
                      />
                      <TranslateButton 
                        sourceValue={footerData.addresses.taiwan} 
                        targetPath="addresses.taiwanEn" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">English Address</label>
                    <textarea
                      value={footerData.addresses.taiwanEn}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        addresses: { ...prev.addresses, taiwanEn: e.target.value }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* 中國地址 */}
              <div className="p-4 bg-zinc-50 rounded-lg">
                <h3 className="font-medium text-zinc-800 mb-3">🇨🇳 中國地址</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">中文地址</label>
                    <div className="flex items-start">
                      <textarea
                        value={footerData.addresses.china}
                        onChange={(e) => setFooterData(prev => ({
                          ...prev,
                          addresses: { ...prev.addresses, china: e.target.value }
                        }))}
                        className="mt-1 flex-1 rounded-lg border border-zinc-300 px-3 py-2"
                        rows={2}
                      />
                      <TranslateButton 
                        sourceValue={footerData.addresses.china} 
                        targetPath="addresses.chinaEn" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">English Address</label>
                    <textarea
                      value={footerData.addresses.chinaEn}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        addresses: { ...prev.addresses, chinaEn: e.target.value }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 聯絡資訊 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">聯絡資訊</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">電話號碼</label>
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
                <label className="block text-sm font-medium text-zinc-700">手機號碼</label>
                <input
                  type="text"
                  value={footerData.contact.mobile}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, mobile: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">電子郵件</label>
                <input
                  type="email"
                  value={footerData.contact.email}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* QR Code 設定 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">QR Code 設定</h2>
            <p className="mb-4 text-sm text-zinc-500">中文版顯示 LINE QR Code，英文版顯示 WhatsApp QR Code</p>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* LINE QR Code */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💬</span>
                  <h3 className="font-medium text-green-800">LINE（中文版顯示）</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="line-enabled"
                      checked={footerData.qrCodes.line.enabled}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        qrCodes: {
                          ...prev.qrCodes,
                          line: { ...prev.qrCodes.line, enabled: e.target.checked }
                        }
                      }))}
                      className="rounded border-zinc-300"
                    />
                    <label htmlFor="line-enabled" className="text-sm font-medium text-zinc-700">啟用</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">LINE URL</label>
                    <input
                      type="url"
                      value={footerData.qrCodes.line.url}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        qrCodes: {
                          ...prev.qrCodes,
                          line: { ...prev.qrCodes.line, url: e.target.value }
                        }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">QR Code 圖片</label>
                    <input
                      type="url"
                      value={footerData.qrCodes.line.imageUrl}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        qrCodes: {
                          ...prev.qrCodes,
                          line: { ...prev.qrCodes.line, imageUrl: e.target.value }
                        }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">說明文字</label>
                    <input
                      type="text"
                      value={footerData.qrCodes.line.description}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        qrCodes: {
                          ...prev.qrCodes,
                          line: { ...prev.qrCodes.line, description: e.target.value }
                        }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                  {footerData.qrCodes.line.imageUrl && (
                    <div className="mt-2">
                      <Image src={footerData.qrCodes.line.imageUrl} alt="LINE QR" width={100} height={100} className="rounded border" />
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp QR Code */}
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📱</span>
                  <h3 className="font-medium text-emerald-800">WhatsApp（英文版顯示）</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="whatsapp-enabled"
                      checked={footerData.qrCodes.whatsapp.enabled}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        qrCodes: {
                          ...prev.qrCodes,
                          whatsapp: { ...prev.qrCodes.whatsapp, enabled: e.target.checked }
                        }
                      }))}
                      className="rounded border-zinc-300"
                    />
                    <label htmlFor="whatsapp-enabled" className="text-sm font-medium text-zinc-700">啟用</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">WhatsApp URL</label>
                    <input
                      type="url"
                      value={footerData.qrCodes.whatsapp.url}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        qrCodes: {
                          ...prev.qrCodes,
                          whatsapp: { ...prev.qrCodes.whatsapp, url: e.target.value }
                        }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">QR Code 圖片</label>
                    <input
                      type="url"
                      value={footerData.qrCodes.whatsapp.imageUrl}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        qrCodes: {
                          ...prev.qrCodes,
                          whatsapp: { ...prev.qrCodes.whatsapp, imageUrl: e.target.value }
                        }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">說明文字</label>
                    <input
                      type="text"
                      value={footerData.qrCodes.whatsapp.descriptionEn}
                      onChange={(e) => setFooterData(prev => ({
                        ...prev,
                        qrCodes: {
                          ...prev.qrCodes,
                          whatsapp: { ...prev.qrCodes.whatsapp, descriptionEn: e.target.value }
                        }
                      }))}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                  {footerData.qrCodes.whatsapp.imageUrl && (
                    <div className="mt-2">
                      <Image src={footerData.qrCodes.whatsapp.imageUrl} alt="WhatsApp QR" width={100} height={100} className="rounded border" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 社群連結 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">社群連結</h2>
            <p className="mb-4 text-sm text-zinc-500">沒有填寫網址的社群連結不會顯示在前台</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  <span className="inline-flex items-center gap-2">🎬 YouTube</span>
                </label>
                <input
                  type="url"
                  value={footerData.socialLinks.youtube}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="https://youtube.com/@yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  <span className="inline-flex items-center gap-2">📌 Pinterest</span>
                </label>
                <input
                  type="url"
                  value={footerData.socialLinks.pinterest}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, pinterest: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="https://pinterest.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  <span className="inline-flex items-center gap-2">📷 Instagram</span>
                </label>
                <input
                  type="url"
                  value={footerData.socialLinks.instagram}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  <span className="inline-flex items-center gap-2">👍 Facebook</span>
                </label>
                <input
                  type="url"
                  value={footerData.socialLinks.facebook}
                  onChange={(e) => setFooterData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
            </div>
          </div>

          {/* 客戶 Logo */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">客戶 Logo</h2>
            <p className="mb-4 text-sm text-zinc-500">最多可上傳 10 個客戶 Logo（目前 {footerData.clientLogos.length}/10）</p>
            
            <div className="space-y-4">
              {footerData.clientLogos.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {footerData.clientLogos.map((logo) => (
                    <div key={logo.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded border">
                        <Image src={logo.url} alt={logo.name} fill className="object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={logo.name}
                          onChange={(e) => updateClientLogoName(logo.id, e.target.value)}
                          className="w-full text-sm border border-zinc-300 rounded px-2 py-1"
                          placeholder="客戶名稱"
                        />
                      </div>
                      <button onClick={() => removeClientLogo(logo.id)} className="text-red-500 hover:text-red-700 p-1">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {footerData.clientLogos.length < 10 && (
                <ImagePicker 
                  onChange={(url) => addClientLogo(url)} 
                  folder="footerlogo"
                  showUpload
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
