import crypto from 'crypto';
import { config } from '../config';

const API_URL = config.bipays.apiUrl;
const API_KEY = config.bipays.apiKey;
const API_SECRET = config.bipays.secret;

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
  'X-API-Secret': API_SECRET,
};

async function apiCall(method: string, path: string, body?: any): Promise<any> {
  const url = `${API_URL}${path}`;
  const opts: RequestInit = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const data: any = await res.json();
  if (!data.success) {
    throw new Error(data.error || `BiPays API error: ${res.status}`);
  }
  return data;
}

// 회원 등록 → bipays에 슬롯사이트 유저 연동, 입금 주소 받기
export async function registerMember(memberId: number, username: string, name: string) {
  return apiCall('POST', '/api/partner/members', {
    member_id: memberId,
    username,
    name,
  });
}

// 회원 목록 조회
export async function getMembers(limit = 50, offset = 0) {
  return apiCall('GET', `/api/partner/members?limit=${limit}&offset=${offset}`);
}

// 회원 상세 조회
export async function getMember(id: number) {
  return apiCall('GET', `/api/partner/members/${id}`);
}

// 입금 내역 조회
export async function getDeposits(memberId?: number, limit = 100) {
  let path = `/api/partner/deposits?limit=${limit}`;
  if (memberId !== undefined) path += `&member_id=${memberId}`;
  return apiCall('GET', path);
}

// 잔액 조회 (업체 전체)
export async function getBalance() {
  return apiCall('GET', '/api/partner/balance');
}

// 회원 잔액 조작 (add/subtract/set)
export async function updateMemberBalance(memberId: number, amount: number, action: 'add' | 'subtract' | 'set') {
  return apiCall('POST', `/api/partner/members/${memberId}/balance`, { amount, action });
}

// 회원 잔액 조회
export async function getMemberBalance(memberId: number) {
  return apiCall('GET', `/api/partner/members/${memberId}/balance`);
}

// 출금 요청 (HMAC 서명 필요)
export async function requestWithdraw(amount: number, address: string) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = JSON.stringify({ amount, address, timestamp, nonce });
  const signature = crypto.createHmac('sha256', API_SECRET).update(payload).digest('hex');

  return apiCall('POST', '/api/partner/withdraw', {
    amount,
    address,
    timestamp,
    nonce,
    signature,
  });
}

// 출금 내역 조회
export async function getWithdrawals(status?: string, limit = 50) {
  let path = `/api/partner/withdrawals?limit=${limit}`;
  if (status) path += `&status=${status}`;
  return apiCall('GET', path);
}

// 웹훅 로그 조회
export async function getWebhookLogs() {
  return apiCall('GET', '/api/partner/webhook-logs');
}

// 입금 확인 (webhook 수신 후 확인 응답)
export async function confirmDeposit(depositId: number) {
  return apiCall('POST', `/api/partner/deposits/${depositId}/confirm`);
}
