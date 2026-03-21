import { config } from '../config';

const BOT_TOKEN = config.telegram.botToken;
const CHAT_ID = config.telegram.chatId;

/**
 * 텔레그램 메시지 전송 (Bot API 직접 호출)
 * 토큰 없으면 콘솔 로그만 하고 에러 안 던짐
 */
async function sendTelegramMessage(message: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log('[Telegram] 토큰/채팅ID 미설정. 콘솔 출력:', message);
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[Telegram] 전송 실패:', res.status, body);
    }
  } catch (err) {
    console.error('[Telegram] 전송 에러:', err);
  }
}

/** 충전 알림 */
async function notifyDeposit(username: string, amount: number, method: string): Promise<void> {
  const msg = `💰 <b>충전 요청</b>\n👤 ${username}\n💵 ${amount.toLocaleString()}원\n📌 ${method}`;
  await sendTelegramMessage(msg);
}

/** 환전 알림 */
async function notifyWithdraw(username: string, amount: number, status: string): Promise<void> {
  const msg = `🏧 <b>환전 요청</b>\n👤 ${username}\n💵 ${amount.toLocaleString()}원\n📌 ${status}`;
  await sendTelegramMessage(msg);
}

/** 신규 가입 알림 */
async function notifyNewUser(username: string): Promise<void> {
  const msg = `🆕 <b>신규 가입</b>\n👤 ${username}`;
  await sendTelegramMessage(msg);
}

/** 빅윈 알림 */
async function notifyBigWin(username: string, gameName: string, amount: number): Promise<void> {
  const msg = `🎰 <b>BIG WIN!</b>\n👤 ${username}\n🎮 ${gameName}\n💵 ${amount.toLocaleString()}원`;
  await sendTelegramMessage(msg);
}

/** 에러 알림 */
async function notifyError(error: string): Promise<void> {
  const msg = `🚨 <b>서버 에러</b>\n${error}`;
  await sendTelegramMessage(msg);
}

export {
  sendTelegramMessage,
  notifyDeposit,
  notifyWithdraw,
  notifyNewUser,
  notifyBigWin,
  notifyError,
};
