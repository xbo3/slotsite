import crypto from 'crypto';
import { config } from '../config';

const API_URL = config.bipays.apiUrl;
const API_KEY = config.bipays.apiKey;
const API_SECRET = config.bipays.secret;

// BiPays API 키가 설정되어 있는지
export function isConfigured(): boolean {
  return !!(API_URL && API_KEY && API_SECRET);
}

// HMAC-SHA256 서명 생성
export function createSignature(body: any): string {
  return crypto.createHmac('sha256', API_SECRET).update(JSON.stringify(body)).digest('hex');
}

// 웹훅 서명 검증
export function verifyWebhookSignature(body: any, signature: string): boolean {
  const expected = crypto.createHmac('sha256', API_SECRET).update(JSON.stringify(body)).digest('hex');
  return signature === expected;
}

// 공통 API 호출 래퍼
async function bipaysFetch(method: string, path: string, body?: any, needSignature = false): Promise<any> {
  const url = `${API_URL}${path}`;
  const hdrs: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    'X-API-Secret': API_SECRET,
  };

  if (needSignature && body) {
    hdrs['X-Signature'] = createSignature(body);
  }

  const opts: RequestInit = { method, headers: hdrs };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(url, opts);
    const data: any = await res.json();
    if (!data.success) {
      console.error(`[BiPays API] ${method} ${path} failed:`, data.error);
      throw new Error(data.error || `BiPays API error: ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.error(`[BiPays API] ${method} ${path} exception:`, err.message);
    throw err;
  }
}

// ===== 회원 관리 =====

// 회원 등록 → 입금 주소 자동 생성
export async function registerMember(memberId: number, username: string, name: string) {
  return bipaysFetch('POST', '/api/partner/members', {
    member_id: memberId,
    username,
    name,
  });
}

// 회원 조회
export async function getMember(id: number) {
  return bipaysFetch('GET', `/api/partner/members/${id}`);
}

// 회원 목록
export async function getMembers(limit = 50, offset = 0) {
  return bipaysFetch('GET', `/api/partner/members?limit=${limit}&offset=${offset}`);
}

// 회원 잔액 조회
export async function getMemberBalance(memberId: number) {
  return bipaysFetch('GET', `/api/partner/members/${memberId}/balance`);
}

// 회원 잔액 조작
export async function updateMemberBalance(memberId: number, amount: number, action: 'add' | 'subtract' | 'set') {
  return bipaysFetch('POST', `/api/partner/members/${memberId}/balance`, { amount, action });
}

// ===== 입금 =====

// 입금 내역 조회
export async function getDeposits(memberId?: number, limit = 100) {
  let path = `/api/partner/deposits?limit=${limit}`;
  if (memberId !== undefined) path += `&member_id=${memberId}`;
  return bipaysFetch('GET', path);
}

// 입금 확인 응답
export async function confirmDeposit(depositId: number) {
  return bipaysFetch('POST', `/api/partner/deposits/${depositId}/confirm`);
}

// ===== 출금 =====

// 업체 출금 (HMAC 서명 필수)
export async function requestWithdraw(amount: number, address: string) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const body = { amount, address, timestamp, nonce };
  const signature = createSignature(body);

  return bipaysFetch('POST', '/api/partner/withdraw', {
    ...body,
    signature,
  });
}

// 회원별 출금 요청 (HMAC 서명 필수)
export async function requestMemberWithdraw(memberId: number, address: string, amount: number) {
  const body = { address, amount };
  return bipaysFetch('POST', `/api/partner/members/${memberId}/withdraw`, body, true);
}

// 출금 내역 조회
export async function getWithdrawals(status?: string, limit = 50) {
  let path = `/api/partner/withdrawals?limit=${limit}`;
  if (status) path += `&status=${status}`;
  return bipaysFetch('GET', path);
}

// ===== 업체 =====

// 업체 잔액 조회
export async function getCompanyBalance() {
  return bipaysFetch('GET', '/api/partner/balance');
}

// 웹훅 로그 조회
export async function getWebhookLogs() {
  return bipaysFetch('GET', '/api/partner/webhook-logs');
}
