'use client';

import { useState, useRef, useEffect } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    question: '입금은 어떻게 하나요?',
    answer: '로그인 후 [지갑] 메뉴에서 충전하기를 클릭하세요. USDT(TRC20) 또는 은행 계좌이체로 입금이 가능합니다. 입금 주소 또는 계좌번호가 자동 안내되며, 송금 후 보통 1~10분 내에 잔액에 반영됩니다.',
  },
  {
    question: '출금은 얼마나 걸리나요?',
    answer: '출금 신청 후 관리자 확인을 거쳐 처리됩니다. 일반적으로 평일 기준 30분~2시간 이내에 처리되며, 야간이나 주말에는 다소 지연될 수 있습니다. 출금 최소 금액은 10,000원입니다.',
  },
  {
    question: '보너스 조건은 어떻게 되나요?',
    answer: '입금 보너스는 해당 보너스 금액의 일정 배수만큼 배팅해야 출금이 가능합니다. 보너스별 롤링 조건은 쿠폰 상세 정보에서 확인할 수 있으며, 마이페이지 > 쿠폰에서 현재 진행 상황을 확인하세요.',
  },
  {
    question: 'VIP 등급은 어떻게 올라가나요?',
    answer: 'VIP 등급은 누적 배팅 금액에 따라 자동으로 승급됩니다. Bronze > Silver > Gold > Platinum > Diamond 순서이며, 등급이 높을수록 더 많은 혜택(캐시백, 전용 보너스, 우선 출금 등)을 받을 수 있습니다.',
  },
  {
    question: '계정 보안은 어떻게 관리하나요?',
    answer: '마이페이지에서 비밀번호 변경 및 보안 비밀번호 설정이 가능합니다. 보안 비밀번호는 출금 시 필요하며, 타인에게 절대 공유하지 마세요. 로그인 기록도 마이페이지에서 확인할 수 있습니다.',
  },
  {
    question: '게임이 로딩되지 않아요.',
    answer: '먼저 인터넷 연결 상태를 확인해주세요. 브라우저 캐시를 삭제하거나 다른 브라우저(Chrome 권장)로 시도해보세요. 그래도 해결되지 않으면 고객센터로 문의해주시면 빠르게 도와드리겠습니다.',
  },
  {
    question: '입금했는데 잔액에 반영이 안 돼요.',
    answer: '은행 이체의 경우 최대 10분 정도 소요될 수 있습니다. USDT의 경우 네트워크 컨펌 횟수에 따라 다소 지연될 수 있습니다. 30분이 지나도 반영되지 않으면 고객센터로 입금 증빙과 함께 문의해주세요.',
  },
  {
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 통해 재설정이 가능합니다. 등록된 연락처로 인증 후 새 비밀번호를 설정하세요. 해결이 어려운 경우 고객센터로 문의해주세요.',
  },
  {
    question: '최소/최대 배팅 금액은 얼마인가요?',
    answer: '최소/최대 배팅 금액은 게임마다 다릅니다. 각 게임에 입장하면 화면에 표시되며, 일반적으로 슬롯 게임은 최소 100원부터 배팅이 가능합니다.',
  },
  {
    question: '여러 기기에서 동시 로그인이 되나요?',
    answer: '보안을 위해 동시 로그인은 제한됩니다. 다른 기기에서 로그인하면 기존 세션은 자동으로 종료됩니다. 비정상적인 로그인이 감지되면 계정이 일시 제한될 수 있으니 주의해주세요.',
  },
];

interface ChatMessage {
  id: number;
  sender: 'user' | 'system';
  text: string;
  time: string;
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'system', text: '안녕하세요! DR.SLOT 고객센터입니다. 무엇을 도와드릴까요?', time: getCurrentTime() },
    { id: 2, sender: 'system', text: '현재 상담원이 응답 준비 중입니다. 잠시만 기다려주세요.', time: getCurrentTime() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: chatInput.trim(),
      time: getCurrentTime(),
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Auto reply after delay
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'system',
        text: '감사합니다. 상담원이 확인 후 빠르게 답변드리겠습니다. 잠시만 기다려주세요.',
        time: getCurrentTime(),
      }]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white mb-2">고객센터</h1>
        <p className="text-sm text-white/40">궁금하신 점이 있으시면 FAQ를 확인하시거나 실시간 채팅으로 문의해주세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: FAQ */}
        <div>
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            자주 묻는 질문
          </h2>
          <div className="space-y-2">
            {FAQ_LIST.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden transition-colors"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm text-white/80 pr-4">{faq.question}</span>
                  <svg
                    className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-sm text-white/50 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat + Contact */}
        <div className="flex flex-col gap-6">
          {/* Live Chat */}
          <div>
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              실시간 채팅
              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/30">온라인</span>
              </span>
            </h2>
            <div className="rounded-xl overflow-hidden flex flex-col" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', height: '400px' }}>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-blue-600/80 text-white rounded-br-md'
                            : 'bg-white/[0.06] text-white/70 rounded-bl-md'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p className={`text-[10px] text-white/20 mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-4 py-2.5 text-sm text-white rounded-xl focus:outline-none"
                    style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
                    style={{ background: 'rgba(59,130,246,0.8)', color: '#fff' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              연락처
            </h2>
            <div className="space-y-3">
              {/* Email */}
              <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">이메일</p>
                  <p className="text-sm text-white/70">support@drslot.com</p>
                </div>
              </div>

              {/* Telegram */}
              <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,136,204,0.15)' }}>
                  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">텔레그램</p>
                  <p className="text-sm text-white/70">@drslot_support</p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.15)' }}>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">운영 시간</p>
                  <p className="text-sm text-white/70">24시간 연중무휴</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
