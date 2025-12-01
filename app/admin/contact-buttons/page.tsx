"use client";

import { useEffect, useMemo, useState } from "react";

interface ChannelBase {
  enabled: boolean;
  label_zh: string;
  label_en: string;
}

interface ContactButtonSettings {
  line: ChannelBase & {
    url: string;
  };
  whatsapp: ChannelBase & {
    number: string;
  };
  email: ChannelBase & {
    address: string;
  };
  updatedAt?: string;
}

const defaultSettings: ContactButtonSettings = {
  line: {
    enabled: true,
    url: "https://lin.ee/JRPBhOm",
    label_zh: "LINE 詢價",
    label_en: "LINE Quote",
  },
  whatsapp: {
    enabled: true,
    number: "+886963581855",
    label_zh: "WhatsApp",
    label_en: "WhatsApp",
  },
  email: {
    enabled: true,
    address: "morningbeachtw@gmail.com",
    label_zh: "Email",
    label_en: "Email",
  },
  updatedAt: undefined,
};

type ChannelKey = keyof Pick<ContactButtonSettings, "line" | "whatsapp" | "email">;

const channelDescriptions: Record<ChannelKey, { title: string; description: string }> = {
  line: {
    title: "LINE",
    description: "設定官方 LINE 的分享連結與按鈕文字",
  },
  whatsapp: {
    title: "WhatsApp",
    description: "輸入國碼開頭的電話號碼（含 + 號）",
  },
  email: {
    title: "Email",
    description: "設定電子郵件地址以及按鈕顯示文字",
  },
};

export default function ContactButtonsPage() {
  const [settings, setSettings] = useState<ContactButtonSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastUpdated = useMemo(() => {
    if (!settings.updatedAt) return null;
    const date = new Date(settings.updatedAt);
    return date.toLocaleString();
  }, [settings.updatedAt]);

  const loadSettings = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/contact-buttons", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("載入失敗");
      }
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      } else {
        throw new Error(data.error || "無法取得設定");
      }
    } catch (err: any) {
      console.error("載入聯絡按鈕設定失敗", err);
      setError(err.message || "載入設定時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  function updateChannel<K extends ChannelKey>(
    channel: K,
    field: keyof ContactButtonSettings[K],
    value: string | boolean,
  ) {
    setSettings((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [field]: value,
      },
    }));
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/contact-buttons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) {
        throw new Error("儲存失敗");
      }
      const data = await res.json();
      if (data.success) {
        setMessage("設定已儲存並同步到前台");
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        throw new Error(data.error || "儲存失敗");
      }
    } catch (err: any) {
      setError(err.message || "儲存設定時發生錯誤");
    } finally {
      setSaving(false);
    }
  };

  const channels: ChannelKey[] = ["line", "whatsapp", "email"];

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">聯絡按鈕編輯器</h1>
            <p className="text-sm text-zinc-500">
              控制前台右下角浮動聯絡按鈕的內容與顯示狀態
            </p>
            {lastUpdated && (
              <p className="text-xs text-zinc-400 mt-1">最後更新：{lastUpdated}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading || saving}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              重新載入
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "儲存中..." : "儲存設定"}
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20 text-zinc-500">載入中...</div>
        ) : (
          <div className="space-y-6">
            {channels.map((channel) => {
              const channelSetting = settings[channel];
              const meta = channelDescriptions[channel];
              return (
                <section key={channel} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900">{meta.title}</h2>
                      <p className="text-sm text-zinc-500">{meta.description}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-600">
                      <input
                        type="checkbox"
                        checked={channelSetting.enabled}
                        onChange={(e) => updateChannel(channel, "enabled", e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                      />
                      啟用此按鈕
                    </label>
                  </div>

                  {channel === "line" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">LINE URL</label>
                        <input
                          type="url"
                          value={channelSetting.url}
                          onChange={(e) => updateChannel("line", "url", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                          placeholder="https://lin.ee/..."
                        />
                      </div>
                    </div>
                  )}

                  {channel === "whatsapp" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">電話號碼（含國碼 +886...）</label>
                        <input
                          type="tel"
                          value={channelSetting.number}
                          onChange={(e) => updateChannel("whatsapp", "number", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                          placeholder="例如 +886963581855"
                        />
                      </div>
                    </div>
                  )}

                  {channel === "email" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">Email Address</label>
                        <input
                          type="email"
                          value={channelSetting.address}
                          onChange={(e) => updateChannel("email", "address", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">中文按鈕文字</label>
                      <input
                        type="text"
                        value={channelSetting.label_zh}
                        onChange={(e) => updateChannel(channel, "label_zh", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">English Label</label>
                      <input
                        type="text"
                        value={channelSetting.label_en}
                        onChange={(e) => updateChannel(channel, "label_en", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
