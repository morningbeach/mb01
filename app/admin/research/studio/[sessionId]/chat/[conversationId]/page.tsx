'use client';

// app/admin/research/studio/[sessionId]/chat/[conversationId]/page.tsx
// 研究對話介面

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
  DocumentTextIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: {
    action?: string;
    results?: any;
    suggestedUrls?: string[];
    suggestedTopics?: string[];
  };
}

interface Conversation {
  id: string;
  sessionId: string;
  topic: string;
  messages: Message[];
  session?: {
    topic: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/admin/research/v2/chat/${conversationId}`);
      const data = await res.json();
      setConversation(data.conversation);
      setMessages(data.conversation?.messages || []);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/admin/research/v2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userMessage
        })
      });

      const data = await res.json();

      // Replace temp message and add assistant response
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        data.userMessage,
        data.assistantMessage
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages: Record<string, string> = {
      search: '幫我搜尋更多相關的資料來源',
      summarize: '總結目前的研究發現',
      gaps: '分析研究中還缺少什麼內容',
      article: '基於目前研究建議文章標題'
    };
    setInput(quickMessages[action] || '');
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-150px)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <Link 
            href={`/admin/research/studio/${sessionId}`}
            className="mb-1 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回研究
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">
            {conversation?.session?.topic || conversation?.topic || '研究對話'}
          </h1>
        </div>
        <Link
          href={`/admin/research/studio/${sessionId}/write`}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          <DocumentTextIcon className="h-4 w-4" />
          生成文章
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <WelcomeScreen onQuickAction={handleQuickAction} />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-zinc-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <SparklesIcon className="h-4 w-4 animate-pulse" />
                    思考中...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length > 0 && (
        <div className="flex gap-2 pb-3 pt-2">
          <QuickActionButton icon={MagnifyingGlassIcon} label="搜尋更多" onClick={() => handleQuickAction('search')} />
          <QuickActionButton icon={LightBulbIcon} label="分析缺口" onClick={() => handleQuickAction('gaps')} />
          <QuickActionButton icon={DocumentTextIcon} label="建議標題" onClick={() => handleQuickAction('article')} />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-zinc-200 pt-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="詢問任何關於這個研究的問題..."
              rows={1}
              className="w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 pr-12 focus:border-zinc-500 focus:outline-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="absolute bottom-2 right-2 rounded-lg bg-zinc-900 p-2 text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-400">
          按 Enter 發送，Shift+Enter 換行
        </p>
      </div>
    </div>
  );
}

// Welcome Screen
function WelcomeScreen({ onQuickAction }: { onQuickAction: (action: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-4">
        <SparklesIcon className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-zinc-900">研究助手</h2>
      <p className="mt-2 max-w-md text-center text-sm text-zinc-500">
        我可以幫助你深入研究、分析資料來源、找出研究缺口，或建議新的研究方向
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <SuggestionCard
          icon={MagnifyingGlassIcon}
          title="搜尋更多資料"
          description="擴展研究範圍"
          onClick={() => onQuickAction('search')}
        />
        <SuggestionCard
          icon={LightBulbIcon}
          title="分析研究缺口"
          description="找出遺漏的面向"
          onClick={() => onQuickAction('gaps')}
        />
        <SuggestionCard
          icon={DocumentTextIcon}
          title="總結研究發現"
          description="整理核心觀點"
          onClick={() => onQuickAction('summarize')}
        />
        <SuggestionCard
          icon={PlusIcon}
          title="建議文章標題"
          description="規劃內容產出"
          onClick={() => onQuickAction('article')}
        />
      </div>
    </div>
  );
}

// Suggestion Card
function SuggestionCard({
  icon: Icon,
  title,
  description,
  onClick
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 text-left transition-all hover:border-zinc-300 hover:shadow-md"
    >
      <div className="rounded-lg bg-zinc-100 p-2">
        <Icon className="h-5 w-5 text-zinc-600" />
      </div>
      <div>
        <div className="font-medium text-zinc-900">{title}</div>
        <div className="text-xs text-zinc-500">{description}</div>
      </div>
    </button>
  );
}

// Quick Action Button
function QuickActionButton({
  icon: Icon,
  label,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

// Message Bubble
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-zinc-900 text-white'
            : 'bg-zinc-100 text-zinc-900'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

        {/* Action Results */}
        {message.metadata?.action && (
          <ActionResult metadata={message.metadata} />
        )}
      </div>
    </div>
  );
}

// Action Result Display
function ActionResult({ metadata }: { metadata: Message['metadata'] }) {
  if (!metadata) return null;

  if (metadata.suggestedUrls && metadata.suggestedUrls.length > 0) {
    return (
      <div className="mt-3 border-t border-zinc-200 pt-3">
        <div className="mb-2 text-xs font-medium text-zinc-500">建議來源</div>
        <div className="space-y-1">
          {metadata.suggestedUrls.slice(0, 3).map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
            >
              <LinkIcon className="h-3 w-3" />
              {new URL(url).hostname}
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (metadata.suggestedTopics && metadata.suggestedTopics.length > 0) {
    return (
      <div className="mt-3 border-t border-zinc-200 pt-3">
        <div className="mb-2 text-xs font-medium text-zinc-500">建議主題</div>
        <div className="flex flex-wrap gap-1">
          {metadata.suggestedTopics.map((topic, i) => (
            <span key={i} className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {topic}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
