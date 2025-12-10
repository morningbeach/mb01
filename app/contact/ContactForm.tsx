"use client";

import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { fireMetaContactEvent, fireGTMEvent } from "@/lib/analytics";

type FormData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  inquiryType: string;
  productType: string;
  quantity: string;
  timeline: string;
  budget: string;
  message: string;
};

type ContactFormProps = {
  variant?: "full" | "compact";
  source?: string;
  onSuccess?: () => void;
};

export default function ContactForm({ variant = "full", source = "website", onSuccess }: ContactFormProps) {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    inquiryType: "QUOTE",
    productType: "",
    quantity: "",
    timeline: "",
    budget: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const inquiryTypes = [
    { value: "QUOTE", label: lang === "zh" ? "詢價" : "Request Quote" },
    { value: "SAMPLE", label: lang === "zh" ? "索取樣品" : "Request Sample" },
    { value: "CUSTOM_DESIGN", label: lang === "zh" ? "客製化設計" : "Custom Design" },
    { value: "BULK_ORDER", label: lang === "zh" ? "大量訂購" : "Bulk Order" },
    { value: "PARTNERSHIP", label: lang === "zh" ? "合作洽談" : "Partnership" },
    { value: "GENERAL", label: lang === "zh" ? "一般詢問" : "General Inquiry" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source }),
      });

      const data = await res.json();

      if (data.success) {
        // GTM 會處理 Google Ads 轉換追蹤
        fireMetaContactEvent("Lead");
        fireGTMEvent("form_submit", { 
          form_id: source === "footer" ? "footer_form" : "contact_page_form",
          inquiry_type: formData.inquiryType 
        });
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          inquiryType: "QUOTE",
          productType: "",
          quantity: "",
          timeline: "",
          budget: "",
          message: "",
        });
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || (lang === "zh" ? "提交失敗，請稍後再試" : "Submission failed, please try again"));
      }
    } catch (err) {
      setError(lang === "zh" ? "網路錯誤，請稍後再試" : "Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">
          {lang === "zh" ? "提交成功！" : "Thank you!"}
        </h3>
        <p className="text-green-700 mb-4">
          {lang === "zh" 
            ? "我們已收到您的訊息，將在 24 小時內回覆您。" 
            : "We've received your message and will get back to you within 24 hours."}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-green-600 hover:text-green-800 font-medium"
        >
          {lang === "zh" ? "再發送一則訊息" : "Send another message"}
        </button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={lang === "zh" ? "您的姓名 *" : "Your name *"}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={lang === "zh" ? "電子郵件 *" : "Email *"}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder={lang === "zh" ? "Phone / WhatsApp / LINE（選填）" : "Phone / WhatsApp / LINE (optional)"}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={lang === "zh" ? "您的需求或問題 *" : "Your inquiry *"}
          required
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading 
            ? (lang === "zh" ? "提交中..." : "Submitting...") 
            : (lang === "zh" ? "立即詢價" : "Send Inquiry")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === "zh" ? "姓名" : "Name"} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === "zh" ? "電子郵件" : "Email"} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === "zh" ? "公司名稱" : "Company"}
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone / WhatsApp / LINE
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 詢價類型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {lang === "zh" ? "詢價類型" : "Inquiry Type"} <span className="text-red-500">*</span>
        </label>
        <select
          name="inquiryType"
          value={formData.inquiryType}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {inquiryTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 專案詳情 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === "zh" ? "產品類型" : "Product Type"}
          </label>
          <input
            type="text"
            name="productType"
            value={formData.productType}
            onChange={handleChange}
            placeholder={lang === "zh" ? "例如：禮盒、手提袋" : "e.g. Gift box, Tote bag"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === "zh" ? "預估數量" : "Quantity"}
          </label>
          <input
            type="text"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder={lang === "zh" ? "例如：1000 個" : "e.g. 1000 pcs"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === "zh" ? "交貨時間" : "Timeline"}
          </label>
          <input
            type="text"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            placeholder={lang === "zh" ? "例如：2 個月" : "e.g. 2 months"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 預算 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {lang === "zh" ? "預算範圍（選填）" : "Budget Range (optional)"}
        </label>
        <input
          type="text"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          placeholder={lang === "zh" ? "例如：USD 5,000 - 10,000" : "e.g. USD 5,000 - 10,000"}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* 訊息內容 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {lang === "zh" ? "詳細需求" : "Message"} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          placeholder={lang === "zh" ? "請描述您的需求，例如：尺寸、材質、印刷方式、特殊要求等" : "Please describe your requirements, e.g. dimensions, materials, printing method, special requests, etc."}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* 提交按鈕 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
      >
        {loading 
          ? (lang === "zh" ? "提交中..." : "Submitting...") 
          : (lang === "zh" ? "🚀 立即提交詢價" : "🚀 Submit Inquiry")}
      </button>

      <p className="text-sm text-gray-500 text-center">
        {lang === "zh" 
          ? "我們將在 24 小時內回覆您的詢價" 
          : "We'll respond to your inquiry within 24 hours"}
      </p>
    </form>
  );
}
