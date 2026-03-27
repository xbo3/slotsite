'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/hooks/useLang';
import { messageApi } from '@/lib/api';

interface Message {
  id: number;
  title: string;
  content: string;
  sender: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const router = useRouter();
  useLang();
  const [isAuth, setIsAuth] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const fetchMessages = () => {
    messageApi.getMessages().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setMessages(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    messageApi.getUnreadCount().then(res => {
      if (res.success && res.data !== undefined) {
        setUnreadCount(Number(res.data.count ?? res.data ?? 0));
      }
    }).catch(() => {});
  };

  useEffect(() => {
    if (!isAuth) return;
    fetchMessages();
  }, [isAuth]);

  const handleOpen = async (msg: Message) => {
    setSelectedMsg(msg);
    if (!msg.is_read) {
      try {
        await messageApi.markRead(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch { /* ignore */ }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await messageApi.deleteMessage(id);
      if (res.success) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMsg?.id === id) setSelectedMsg(null);
        // Refresh unread count
        messageApi.getUnreadCount().then(r => {
          if (r.success && r.data !== undefined) setUnreadCount(Number(r.data.count ?? r.data ?? 0));
        });
      }
    } catch { /* ignore */ }
  };

  if (!isAuth) {
    return <div className="flex items-center justify-center min-h-[50vh]"><span className="text-white/50 font-light">Loading...</span></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-base font-semibold text-white">Messages</h2>
          {unreadCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted">System notifications and announcements.</p>
      </div>

      {/* Message List */}
      <div className="bg-dark-card rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm text-text-muted">Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-10 h-10 text-white/10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-text-muted">No messages.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages.map(msg => (
              <div
                key={msg.id}
                onClick={() => handleOpen(msg)}
                className="flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                {/* Unread dot */}
                <div className="pt-1.5 flex-shrink-0">
                  {!msg.is_read ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  ) : (
                    <div className="w-2 h-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`text-sm truncate ${!msg.is_read ? 'font-semibold text-white' : 'font-normal text-text-secondary'}`}>
                      {msg.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{msg.sender || 'System'}</span>
                    <span>-</span>
                    <span>{new Date(msg.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(msg.id); }}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-danger transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMsg(null)}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-xl overflow-hidden"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="text-sm font-semibold text-white truncate">{selectedMsg.title}</h3>
                <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                  <span>{selectedMsg.sender || 'System'}</span>
                  <span>-</span>
                  <span>{new Date(selectedMsg.created_at).toLocaleString('ko-KR')}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMsg(null)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {selectedMsg.content}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/5">
              <button
                onClick={() => { handleDelete(selectedMsg.id); setSelectedMsg(null); }}
                className="px-4 py-2 text-xs font-medium text-danger bg-danger/10 rounded-lg hover:bg-danger/20 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedMsg(null)}
                className="px-4 py-2 text-xs font-medium text-white bg-dark-elevated rounded-lg hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
