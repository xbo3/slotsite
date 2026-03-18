'use client';

import { useEffect } from 'react';
import { collectFingerprint } from '@/lib/fingerprint';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function FingerprintCollector() {
  useEffect(() => {
    const sendFingerprint = async () => {
      try {
        // 같은 세션에서 이미 전송했으면 스킵
        const alreadySent = sessionStorage.getItem('fp_sent');
        const token = localStorage.getItem('token');

        // 비로그인 상태에서 이미 보냈고, 로그인도 안 했으면 스킵
        if (alreadySent && !token) return;

        // 로그인 상태에서 이미 로그인 후 전송했으면 스킵
        if (alreadySent === 'auth' && token) return;

        const data = await collectFingerprint();

        // session_id 유지 (비로그인 추적용)
        const existingSessionId = sessionStorage.getItem('fp_session_id');
        if (existingSessionId) {
          data.session_id = existingSessionId;
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/fingerprint`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const result = await res.json();
          // session_id 저장 (서버가 생성한 것)
          if (result.data?.session_id) {
            sessionStorage.setItem('fp_session_id', result.data.session_id);
          }
          // 전송 플래그 설정
          sessionStorage.setItem('fp_sent', token ? 'auth' : 'anon');
        }
      } catch (e) {
        // 핑거프린트 수집 실패해도 사이트 기능에 영향 없음
        console.warn('Fingerprint collection failed:', e);
      }
    };

    // DOM이 완전히 로드된 후 약간의 딜레이를 두고 실행
    const timer = setTimeout(sendFingerprint, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 로그인 상태 변화 감지 — storage 이벤트
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        // 로그인 됐으면 핑거프린트 다시 전송 (user_id 연결)
        sessionStorage.removeItem('fp_sent');
        const resend = async () => {
          try {
            const data = await collectFingerprint();
            const existingSessionId = sessionStorage.getItem('fp_session_id');
            if (existingSessionId) {
              data.session_id = existingSessionId;
            }
            const res = await fetch(`${API_URL}/fingerprint`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${e.newValue}`,
              },
              body: JSON.stringify(data),
            });
            if (res.ok) {
              sessionStorage.setItem('fp_sent', 'auth');
            }
          } catch (err) {
            console.warn('Fingerprint re-send after login failed:', err);
          }
        };
        setTimeout(resend, 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}
