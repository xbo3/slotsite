'use client';

import { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';

// ===== Types =====
type CouponType = 'bonus_money' | 'free_spin' | 'deposit_bonus';
type CouponStatus = 'active' | 'inactive' | 'expired';
type SortField = 'code' | 'amount' | 'used_count' | 'created_at';
type SortDir = 'asc' | 'desc';

interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  amount: number;
  min_deposit: number;
  max_uses: number;
  used_count: number;
  status: CouponStatus;
  start_date: string;
  end_date: string;
  description: string;
  target_user_id?: number;
  created_at: string;
}

interface CouponUsage {
  id: number;
  user_id: number;
  username: string;
  used_at: string;
  amount_received: number;
}

// ===== Dummy Data =====
const DUMMY_COUPONS: Coupon[] = [
  { id: 1, code: 'WELCOME2026', type: 'deposit_bonus', amount: 15, min_deposit: 50000, max_uses: 0, used_count: 247, status: 'active', start_date: '2026-01-01', end_date: '2026-12-31', description: '신규 가입자 첫 충전 15% 보너스', created_at: '2026-01-01' },
  { id: 2, code: 'FREESPIN50', type: 'free_spin', amount: 50, min_deposit: 0, max_uses: 100, used_count: 88, status: 'active', start_date: '2026-03-01', end_date: '2026-03-31', description: '3월 프리스핀 이벤트', created_at: '2026-02-28' },
  { id: 3, code: 'VIP10K', type: 'bonus_money', amount: 10000, min_deposit: 100000, max_uses: 50, used_count: 50, status: 'inactive', start_date: '2026-02-01', end_date: '2026-02-28', description: 'VIP 전용 보너스 머니', created_at: '2026-01-25' },
  { id: 4, code: 'MARCH20', type: 'deposit_bonus', amount: 20, min_deposit: 30000, max_uses: 500, used_count: 134, status: 'active', start_date: '2026-03-01', end_date: '2026-03-31', description: '3월 입금 보너스 20%', created_at: '2026-02-27' },
  { id: 5, code: 'CASHBACK5K', type: 'bonus_money', amount: 5000, min_deposit: 0, max_uses: 200, used_count: 78, status: 'active', start_date: '2026-03-10', end_date: '2026-04-10', description: '주간 캐시백 보너스', created_at: '2026-03-09' },
  { id: 6, code: 'NEWYEAR2026', type: 'bonus_money', amount: 20000, min_deposit: 200000, max_uses: 30, used_count: 30, status: 'expired', start_date: '2026-01-01', end_date: '2026-01-07', description: '새해 이벤트 보너스', created_at: '2025-12-31' },
  { id: 7, code: 'SPIN100', type: 'free_spin', amount: 100, min_deposit: 50000, max_uses: 0, used_count: 312, status: 'active', start_date: '2026-03-01', end_date: '2026-06-30', description: '프리스핀 100회 대방출', created_at: '2026-02-28' },
  { id: 8, code: 'LOYALTY3K', type: 'bonus_money', amount: 3000, min_deposit: 0, max_uses: 1, used_count: 0, status: 'active', start_date: '2026-03-15', end_date: '2026-03-20', description: '충성 고객 전용 (user:1042)', target_user_id: 1042, created_at: '2026-03-14' },
];

const DUMMY_USAGE: CouponUsage[] = [
  { id: 1, user_id: 101, username: 'player_kim', used_at: '2026-03-15 14:30:00', amount_received: 7500 },
  { id: 2, user_id: 205, username: 'lucky_park', used_at: '2026-03-15 12:10:00', amount_received: 15000 },
  { id: 3, user_id: 312, username: 'vip_lee', used_at: '2026-03-14 22:45:00', amount_received: 10000 },
];

const TYPE_LABELS: Record<CouponType, string> = {
  bonus_money: '보너스머니',
  free_spin: '프리스핀',
  deposit_bonus: '입금보너스',
};

const STATUS_LABELS: Record<CouponStatus, string> = {
  active: '활성',
  inactive: '비활성',
  expired: '만료',
};

const STATUS_COLORS: Record<CouponStatus, string> = {
  active: 'bg-success/20 text-success',
  inactive: 'bg-warning/20 text-warning',
  expired: 'bg-danger/20 text-danger',
};

const TYPE_COLORS: Record<CouponType, string> = {
  bonus_money: 'bg-accent-gold/20 text-accent-gold',
  free_spin: 'bg-amber-500/20 text-amber-500',
  deposit_bonus: 'bg-info/20 text-info',
};

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(DUMMY_COUPONS);
  const [filterStatus, setFilterStatus] = useState<'all' | CouponStatus>('all');
  const [filterType, setFilterType] = useState<'all' | CouponType>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showUsage, setShowUsage] = useState<Coupon | null>(null);
  const [showEdit, setShowEdit] = useState<Coupon | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    code: '',
    type: 'bonus_money' as CouponType,
    amount: 0,
    min_deposit: 0,
    max_uses: 0,
    start_date: '',
    end_date: '',
    target_user_id: '',
    description: '',
  });

  // Bulk form
  const [bulkForm, setBulkForm] = useState({ count: 10, prefix: 'PROMO' });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let list = [...coupons];
    if (filterStatus !== 'all') list = list.filter(c => c.status === filterStatus);
    if (filterType !== 'all') list = list.filter(c => c.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'code') cmp = a.code.localeCompare(b.code);
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'used_count') cmp = a.used_count - b.used_count;
      else cmp = a.created_at.localeCompare(b.created_at);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [coupons, filterStatus, filterType, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleCreate = () => {
    const newCoupon: Coupon = {
      id: coupons.length + 1,
      code: createForm.code || generateCode(),
      type: createForm.type,
      amount: createForm.amount,
      min_deposit: createForm.min_deposit,
      max_uses: createForm.max_uses,
      used_count: 0,
      status: 'active',
      start_date: createForm.start_date,
      end_date: createForm.end_date,
      description: createForm.description,
      target_user_id: createForm.target_user_id ? parseInt(createForm.target_user_id) : undefined,
      created_at: new Date().toISOString().split('T')[0],
    };
    setCoupons(prev => [newCoupon, ...prev]);
    setShowCreate(false);
    setCreateForm({ code: '', type: 'bonus_money', amount: 0, min_deposit: 0, max_uses: 0, start_date: '', end_date: '', target_user_id: '', description: '' });
  };

  const handleBulkCreate = () => {
    const newCoupons: Coupon[] = Array.from({ length: bulkForm.count }, (_, i) => ({
      id: coupons.length + i + 1,
      code: `${bulkForm.prefix}-${generateCode(6)}`,
      type: 'bonus_money' as CouponType,
      amount: 5000,
      min_deposit: 0,
      max_uses: 1,
      used_count: 0,
      status: 'active' as CouponStatus,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '2026-12-31',
      description: `벌크 생성 보너스 #${i + 1}`,
      created_at: new Date().toISOString().split('T')[0],
    }));
    setCoupons(prev => [...newCoupons, ...prev]);
    setShowBulk(false);
  };

  const handleToggleStatus = (coupon: Coupon) => {
    setCoupons(prev => prev.map(c =>
      c.id === coupon.id
        ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
        : c
    ));
  };

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-[10px] text-text-muted">
      {sortField === field ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25BC'}
    </span>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">보너스 관리</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="px-4 py-2.5 bg-dark-elevated hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors">
            벌크 생성
          </button>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 btn-cta text-sm rounded-lg">
            보너스 생성
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="코드 또는 설명 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value as typeof filterStatus); setCurrentPage(1); }}
          className="px-4 py-2.5 bg-dark-card border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
        >
          <option value="all">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
          <option value="expired">만료</option>
        </select>
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value as typeof filterType); setCurrentPage(1); }}
          className="px-4 py-2.5 bg-dark-card border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
        >
          <option value="all">전체 유형</option>
          <option value="bonus_money">보너스머니</option>
          <option value="free_spin">프리스핀</option>
          <option value="deposit_bonus">입금보너스</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-dark-card rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('code')}>
                코드 <SortIcon field="code" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">유형</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('amount')}>
                금액 <SortIcon field="amount" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('used_count')}>
                사용 <SortIcon field="used_count" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">유효기간</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">상태</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">관리</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(coupon => (
              <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-white font-medium">{coupon.code}</span>
                  {coupon.target_user_id && (
                    <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">
                      user:{coupon.target_user_id}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[coupon.type]}`}>
                    {TYPE_LABELS[coupon.type]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  {coupon.type === 'deposit_bonus' ? `${coupon.amount}%` : coupon.type === 'free_spin' ? `${coupon.amount}회` : `${coupon.amount.toLocaleString()}원`}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-white">{coupon.used_count}</span>
                  <span className="text-text-muted">/{coupon.max_uses || '\u221E'}</span>
                </td>
                <td className="px-4 py-3 text-xs text-text-secondary">
                  {coupon.start_date} ~ {coupon.end_date}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[coupon.status]}`}>
                    {STATUS_LABELS[coupon.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => setShowUsage(coupon)} className="px-2 py-1 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded transition-colors">
                      내역
                    </button>
                    <button onClick={() => setShowEdit(coupon)} className="px-2 py-1 text-xs text-info hover:bg-info/10 rounded transition-colors">
                      수정
                    </button>
                    <button onClick={() => handleToggleStatus(coupon)} className="px-2 py-1 text-xs text-warning hover:bg-warning/10 rounded transition-colors">
                      {coupon.status === 'active' ? '비활성화' : '활성화'}
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="px-2 py-1 text-xs text-danger hover:bg-danger/10 rounded transition-colors">
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginated.map(coupon => (
          <div key={coupon.id} className="bg-dark-card rounded-xl border border-white/5 p-4 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-mono text-sm text-white font-medium">{coupon.code}</span>
                <div className="flex gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[coupon.type]}`}>
                    {TYPE_LABELS[coupon.type]}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[coupon.status]}`}>
                    {STATUS_LABELS[coupon.status]}
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold text-white">
                {coupon.type === 'deposit_bonus' ? `${coupon.amount}%` : coupon.type === 'free_spin' ? `${coupon.amount}회` : `${coupon.amount.toLocaleString()}원`}
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-2">{coupon.description}</p>
            <div className="flex items-center justify-between text-[11px] text-text-muted mb-3">
              <span>사용: {coupon.used_count}/{coupon.max_uses || '\u221E'}</span>
              <span>{coupon.start_date} ~ {coupon.end_date}</span>
            </div>
            <div className="flex gap-2 border-t border-white/5 pt-3">
              <button onClick={() => setShowUsage(coupon)} className="flex-1 py-1.5 text-xs text-text-secondary hover:text-white bg-dark-elevated/50 hover:bg-dark-elevated rounded-lg transition-colors">내역</button>
              <button onClick={() => handleToggleStatus(coupon)} className="flex-1 py-1.5 text-xs text-warning bg-warning/5 hover:bg-warning/10 rounded-lg transition-colors">
                {coupon.status === 'active' ? '비활성화' : '활성화'}
              </button>
              <button onClick={() => handleDelete(coupon.id)} className="flex-1 py-1.5 text-xs text-danger bg-danger/5 hover:bg-danger/10 rounded-lg transition-colors">삭제</button>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* ===== Create Modal ===== */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="보너스 생성" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">코드</label>
            <div className="flex gap-2">
              <input
                value={createForm.code}
                onChange={e => setCreateForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="비워두면 자동 생성"
                className="flex-1 px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
              <button
                onClick={() => setCreateForm(f => ({ ...f, code: generateCode() }))}
                className="px-3 py-2.5 bg-dark-elevated hover:bg-white/10 text-text-secondary text-sm rounded-lg transition-colors whitespace-nowrap"
              >
                자동생성
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">유형</label>
            <select
              value={createForm.type}
              onChange={e => setCreateForm(f => ({ ...f, type: e.target.value as CouponType }))}
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            >
              <option value="bonus_money">보너스머니</option>
              <option value="free_spin">프리스핀</option>
              <option value="deposit_bonus">입금보너스 (%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {createForm.type === 'deposit_bonus' ? '비율 (%)' : createForm.type === 'free_spin' ? '횟수' : '금액 (원)'}
            </label>
            <input
              type="number"
              value={createForm.amount || ''}
              onChange={e => setCreateForm(f => ({ ...f, amount: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">최소 입금 조건 (원)</label>
            <input
              type="number"
              value={createForm.min_deposit || ''}
              onChange={e => setCreateForm(f => ({ ...f, min_deposit: parseInt(e.target.value) || 0 }))}
              placeholder="0 = 조건 없음"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">사용 횟수 제한</label>
            <input
              type="number"
              value={createForm.max_uses || ''}
              onChange={e => setCreateForm(f => ({ ...f, max_uses: parseInt(e.target.value) || 0 }))}
              placeholder="0 = 무제한"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">시작일</label>
              <input
                type="date"
                value={createForm.start_date}
                onChange={e => setCreateForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">종료일</label>
              <input
                type="date"
                value={createForm.end_date}
                onChange={e => setCreateForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">특정 유저 ID (선택)</label>
            <input
              type="text"
              value={createForm.target_user_id}
              onChange={e => setCreateForm(f => ({ ...f, target_user_id: e.target.value }))}
              placeholder="비워두면 전체 대상"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">설명</label>
            <input
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              placeholder="보너스 설명"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          <button onClick={handleCreate} className="w-full py-3 btn-cta text-sm rounded-lg mt-2">
            보너스 생성
          </button>
        </div>
      </Modal>

      {/* ===== Bulk Create Modal ===== */}
      <Modal isOpen={showBulk} onClose={() => setShowBulk(false)} title="벌크 보너스 생성" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">생성 수량</label>
            <input
              type="number"
              value={bulkForm.count}
              onChange={e => setBulkForm(f => ({ ...f, count: parseInt(e.target.value) || 1 }))}
              min={1}
              max={1000}
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">코드 접두사 (Prefix)</label>
            <input
              value={bulkForm.prefix}
              onChange={e => setBulkForm(f => ({ ...f, prefix: e.target.value.toUpperCase() }))}
              placeholder="PROMO"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>
          <p className="text-xs text-text-muted">
            미리보기: <span className="font-mono text-text-secondary">{bulkForm.prefix}-XXXXXX</span> x {bulkForm.count}개
          </p>
          <button onClick={handleBulkCreate} className="w-full py-3 btn-cta text-sm rounded-lg">
            {bulkForm.count}개 일괄 생성
          </button>
        </div>
      </Modal>

      {/* ===== Usage Modal ===== */}
      <Modal isOpen={!!showUsage} onClose={() => setShowUsage(null)} title={`사용 내역 - ${showUsage?.code}`} size="md">
        {showUsage && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-dark-input rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">총 사용</p>
                <p className="text-lg font-bold text-white">{showUsage.used_count}</p>
              </div>
              <div className="bg-dark-input rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">최대</p>
                <p className="text-lg font-bold text-white">{showUsage.max_uses || '\u221E'}</p>
              </div>
              <div className="bg-dark-input rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">잔여</p>
                <p className="text-lg font-bold text-success">
                  {showUsage.max_uses ? showUsage.max_uses - showUsage.used_count : '\u221E'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {DUMMY_USAGE.map(u => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2.5 bg-dark-input rounded-lg">
                  <div>
                    <span className="text-sm text-white font-medium">{u.username}</span>
                    <span className="text-xs text-text-muted ml-2">ID: {u.user_id}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-accent-gold font-medium">{u.amount_received.toLocaleString()}원</p>
                    <p className="text-[10px] text-text-muted">{u.used_at}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ===== Edit Modal ===== */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title={`보너스 수정 - ${showEdit?.code}`} size="md">
        {showEdit && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">설명</label>
              <input
                defaultValue={showEdit.description}
                className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">시작일</label>
                <input type="date" defaultValue={showEdit.start_date} className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">종료일</label>
                <input type="date" defaultValue={showEdit.end_date} className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">사용 횟수 제한</label>
              <input type="number" defaultValue={showEdit.max_uses} className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50" />
            </div>
            <button onClick={() => setShowEdit(null)} className="w-full py-3 btn-cta text-sm rounded-lg">
              저장
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
