'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { adminApi } from '@/lib/api';
// admin pages: Korean only (no i18n)

// ===== Types =====
type CouponType = 'BONUS_MONEY' | 'FREE_SPIN' | 'DEPOSIT_BONUS';
type CouponStatus = 'active' | 'used' | 'expired' | 'inactive';
type StatusTab = 'all' | 'active' | 'used' | 'expired';
type TypeTab = 'all' | CouponType;
type SortField = 'code' | 'amount' | 'created_at' | 'end_date';
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
  used_at: string | null;
  description: string;
  target_user_id?: number;
  target_username?: string;
  created_at: string;
}

// ===== Dummy Data =====
const DUMMY_COUPONS: Coupon[] = [
  { id: 1, code: 'WELCOME2026', type: 'DEPOSIT_BONUS', amount: 15, min_deposit: 50000, max_uses: 0, used_count: 247, status: 'active', start_date: '2026-01-01', end_date: '2026-12-31', used_at: null, description: '신규 가입자 첫 충전 15% 보너스', created_at: '2026-01-01' },
  { id: 2, code: 'FREESPIN50', type: 'FREE_SPIN', amount: 50, min_deposit: 0, max_uses: 100, used_count: 88, status: 'active', start_date: '2026-03-01', end_date: '2026-03-31', used_at: null, description: '3월 프리스핀 이벤트', created_at: '2026-02-28' },
  { id: 3, code: 'VIP10K', type: 'BONUS_MONEY', amount: 10000, min_deposit: 100000, max_uses: 50, used_count: 50, status: 'used', start_date: '2026-02-01', end_date: '2026-02-28', used_at: '2026-02-25', description: 'VIP 전용 보너스 머니', created_at: '2026-01-25' },
  { id: 4, code: 'MARCH20', type: 'DEPOSIT_BONUS', amount: 20, min_deposit: 30000, max_uses: 500, used_count: 134, status: 'active', start_date: '2026-03-01', end_date: '2026-03-31', used_at: null, description: '3월 입금 보너스 20%', created_at: '2026-02-27' },
  { id: 5, code: 'CASHBACK5K', type: 'BONUS_MONEY', amount: 5000, min_deposit: 0, max_uses: 200, used_count: 78, status: 'active', start_date: '2026-03-10', end_date: '2026-04-10', used_at: null, description: '주간 캐시백 보너스', created_at: '2026-03-09' },
  { id: 6, code: 'NEWYEAR2026', type: 'BONUS_MONEY', amount: 20000, min_deposit: 200000, max_uses: 30, used_count: 30, status: 'expired', start_date: '2026-01-01', end_date: '2026-01-07', used_at: null, description: '새해 이벤트 보너스', created_at: '2025-12-31' },
  { id: 7, code: 'SPIN100', type: 'FREE_SPIN', amount: 100, min_deposit: 50000, max_uses: 0, used_count: 312, status: 'active', start_date: '2026-03-01', end_date: '2026-06-30', used_at: null, description: '프리스핀 100회 대방출', created_at: '2026-02-28' },
  { id: 8, code: 'LOYALTY3K', type: 'BONUS_MONEY', amount: 3000, min_deposit: 0, max_uses: 1, used_count: 1, status: 'used', start_date: '2026-03-15', end_date: '2026-03-20', used_at: '2026-03-16', description: '충성 고객 전용', target_user_id: 1042, target_username: 'player_kim', created_at: '2026-03-14' },
  { id: 9, code: 'BULK-A1B2C3', type: 'BONUS_MONEY', amount: 5000, min_deposit: 0, max_uses: 1, used_count: 0, status: 'active', start_date: '2026-03-20', end_date: '2026-04-20', used_at: null, description: '벌크 생성 보너스', created_at: '2026-03-20' },
  { id: 10, code: 'EXPIRED01', type: 'DEPOSIT_BONUS', amount: 10, min_deposit: 10000, max_uses: 100, used_count: 45, status: 'expired', start_date: '2025-12-01', end_date: '2025-12-31', used_at: null, description: '12월 이벤트', created_at: '2025-11-30' },
  { id: 11, code: 'PERSONALVIP', type: 'BONUS_MONEY', amount: 50000, min_deposit: 0, max_uses: 1, used_count: 1, status: 'used', start_date: '2026-03-01', end_date: '2026-03-31', used_at: '2026-03-05', description: 'VIP 개인 보너스', target_user_id: 205, target_username: 'lucky_park', created_at: '2026-03-01' },
  { id: 12, code: 'FREESPIN20', type: 'FREE_SPIN', amount: 20, min_deposit: 20000, max_uses: 300, used_count: 112, status: 'active', start_date: '2026-03-15', end_date: '2026-04-15', used_at: null, description: '프리스핀 20회 이벤트', created_at: '2026-03-14' },
];

const TYPE_LABELS: Record<CouponType, string> = {
  BONUS_MONEY: '일반',
  FREE_SPIN: '프리스핀',
  DEPOSIT_BONUS: '입금보너스',
};

const STATUS_LABELS: Record<CouponStatus, string> = {
  active: '미사용',
  used: '사용됨',
  expired: '만료됨',
  inactive: '비활성',
};

const STATUS_COLORS: Record<CouponStatus, string> = {
  active: 'bg-success/20 text-success',
  used: 'bg-info/20 text-info',
  expired: 'bg-danger/20 text-danger',
  inactive: 'bg-white/10 text-text-muted',
};

const TYPE_COLORS: Record<CouponType, string> = {
  BONUS_MONEY: 'bg-accent/15 text-accent',
  FREE_SPIN: 'bg-purple-500/20 text-purple-400',
  DEPOSIT_BONUS: 'bg-info/20 text-info',
};

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatAmount(type: CouponType, amount: number): string {
  if (type === 'DEPOSIT_BONUS') return `${amount}%`;
  if (type === 'FREE_SPIN') return `${amount}회`;
  return `${amount.toLocaleString()}원`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return dateStr.split('T')[0];
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(DUMMY_COUPONS);
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [typeTab, setTypeTab] = useState<TypeTab>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({
    code: '',
    type: 'BONUS_MONEY' as CouponType,
    amount: 0,
    min_deposit: 0,
    max_uses: 1,
    end_date: '',
    target_user_id: '',
    description: '',
  });

  // Bulk form
  const [bulkForm, setBulkForm] = useState({
    count: 10,
    prefix: 'PROMO',
    type: 'BONUS_MONEY' as CouponType,
    amount: 5000,
    min_deposit: 0,
    max_uses: 1,
    end_date: '',
  });

  // Fetch from API
  useEffect(() => {
    adminApi.getCoupons().then(res => {
      try {
        if (res.success && res.data) {
          setCoupons(res.data);
        }
      } catch { /* keep dummy */ }
    }).catch(() => {});
  }, []);

  // ===== Stats =====
  const stats = useMemo(() => {
    const total = coupons.length;
    const usedCount = coupons.filter(c => c.status === 'used').length;
    const expiredCount = coupons.filter(c => c.status === 'expired').length;
    const activeCount = coupons.filter(c => c.status === 'active').length;

    // 총 발급 금액: BONUS_MONEY는 금액, DEPOSIT_BONUS는 제외(% 단위), FREE_SPIN은 제외(회 단위)
    const totalIssued = coupons
      .filter(c => c.type === 'BONUS_MONEY')
      .reduce((sum, c) => sum + c.amount, 0);
    const totalUsed = coupons
      .filter(c => c.type === 'BONUS_MONEY' && c.status === 'used')
      .reduce((sum, c) => sum + c.amount, 0);

    return { total, usedCount, expiredCount, activeCount, totalIssued, totalUsed };
  }, [coupons]);

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
    if (statusTab !== 'all') list = list.filter(c => c.status === statusTab);
    if (typeTab !== 'all') list = list.filter(c => c.type === typeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.target_username && c.target_username.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'code') cmp = a.code.localeCompare(b.code);
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'end_date') cmp = (a.end_date || '').localeCompare(b.end_date || '');
      else cmp = a.created_at.localeCompare(b.created_at);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [coupons, statusTab, typeTab, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [statusTab, typeTab, search]);

  const handleCreate = async () => {
    const payload = {
      code: createForm.code || generateCode(),
      type: createForm.type,
      amount: createForm.amount,
      min_deposit: createForm.min_deposit,
      max_uses: createForm.max_uses,
      start_date: new Date().toISOString().split('T')[0],
      end_date: createForm.end_date,
      description: createForm.description,
      target_user_id: createForm.target_user_id ? parseInt(createForm.target_user_id) : undefined,
    };
    const res = await adminApi.createCoupon(payload).catch(() => null);
    const newCoupon: Coupon = {
      id: res?.data?.id || coupons.length + 1,
      ...payload,
      used_count: 0,
      status: 'active',
      used_at: null,
      created_at: new Date().toISOString().split('T')[0],
    };
    setCoupons(prev => [newCoupon, ...prev]);
    setShowCreate(false);
    setCreateForm({ code: '', type: 'BONUS_MONEY', amount: 0, min_deposit: 0, max_uses: 1, end_date: '', target_user_id: '', description: '' });
  };

  const handleBulkCreate = async () => {
    const payload = {
      count: bulkForm.count,
      prefix: bulkForm.prefix,
      type: bulkForm.type,
      amount: bulkForm.amount,
      min_deposit: bulkForm.min_deposit,
      max_uses: bulkForm.max_uses,
      end_date: bulkForm.end_date,
    };
    const res = await adminApi.bulkCreateCoupons(payload).catch(() => null);
    if (res?.success && res.data) {
      setCoupons(prev => [...res.data, ...prev]);
    } else {
      const newCoupons: Coupon[] = Array.from({ length: bulkForm.count }, (_, i) => ({
        id: coupons.length + i + 1,
        code: `${bulkForm.prefix}-${generateCode(6)}`,
        type: bulkForm.type,
        amount: bulkForm.amount,
        min_deposit: bulkForm.min_deposit,
        max_uses: bulkForm.max_uses,
        used_count: 0,
        status: 'active' as CouponStatus,
        start_date: new Date().toISOString().split('T')[0],
        end_date: bulkForm.end_date || '2026-12-31',
        used_at: null,
        description: `벌크 생성 #${i + 1}`,
        created_at: new Date().toISOString().split('T')[0],
      }));
      setCoupons(prev => [...newCoupons, ...prev]);
    }
    setShowBulk(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (coupon: Coupon) => {
    setCoupons(prev => prev.map(c =>
      c.id === coupon.id
        ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
        : c
    ));
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-[10px]">
      {sortField === field ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25BC'}
    </span>
  );

  const STATUS_TABS: { key: StatusTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'active', label: '미사용' },
    { key: 'expired', label: '만료됨' },
    { key: 'used', label: '사용됨' },
  ];

  const TYPE_TABS: { key: TypeTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'BONUS_MONEY', label: '일반' },
    { key: 'FREE_SPIN', label: '프리스핀' },
    { key: 'DEPOSIT_BONUS', label: '입금보너스' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">쿠폰 관리</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="px-4 py-2.5 bg-dark-elevated hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
            벌크 발급
          </button>
          <button onClick={() => { setCreateForm(f => ({ ...f, target_user_id: '' })); setShowCreate(true); }} className="px-4 py-2.5 bg-dark-elevated hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
            전체 발급
          </button>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 btn-cta text-sm rounded-lg font-medium">
            개인 발급
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">총 발급</p>
          <p className="text-xl font-bold text-white">{stats.total}<span className="text-xs text-text-muted ml-1">건</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">사용</p>
          <p className="text-xl font-bold text-info">{stats.usedCount}<span className="text-xs text-text-muted ml-1">건</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">만료</p>
          <p className="text-xl font-bold text-danger">{stats.expiredCount}<span className="text-xs text-text-muted ml-1">건</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">미사용</p>
          <p className="text-xl font-bold text-success">{stats.activeCount}<span className="text-xs text-text-muted ml-1">건</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">발급 금액</p>
          <p className="text-xl font-bold text-white">{stats.totalIssued.toLocaleString()}<span className="text-xs text-text-muted ml-1">원</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">사용 금액</p>
          <p className="text-xl font-bold text-accent">{stats.totalUsed.toLocaleString()}<span className="text-xs text-text-muted ml-1">원</span></p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 mb-4 bg-dark-card rounded-xl border border-white/5 p-1 overflow-x-auto">
        {STATUS_TABS.map(tab => {
          const count = tab.key === 'all' ? coupons.length
            : coupons.filter(c => c.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`flex-1 min-w-[80px] px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusTab === tab.key
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${statusTab === tab.key ? 'text-accent/70' : 'text-text-muted/50'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Type Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-dark-card rounded-lg border border-white/5 p-0.5">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTypeTab(tab.key)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="코드, 설명, 유저명 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted">
          검색 결과 <span className="text-white font-medium">{filtered.length}</span>건
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-dark-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('code')}>
                  쿠폰코드 <SortIcon field="code" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">종류</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('amount')}>
                  금액 <SortIcon field="amount" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">받는사람</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">최소입금</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('created_at')}>
                  발급일 <SortIcon field="created_at" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('end_date')}>
                  만료일 <SortIcon field="end_date" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">사용일</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">상태</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">관리</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-text-muted text-sm">
                    해당 조건의 쿠폰이 없습니다.
                  </td>
                </tr>
              )}
              {paginated.map((coupon, idx) => (
                <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {(currentPage - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-white font-medium">{coupon.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[coupon.type]}`}>
                      {TYPE_LABELS[coupon.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {formatAmount(coupon.type, coupon.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {coupon.target_user_id ? (
                      <span className="text-accent text-xs">
                        {coupon.target_username || `ID:${coupon.target_user_id}`}
                      </span>
                    ) : (
                      <span className="text-text-muted text-xs">전체</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {coupon.min_deposit > 0 ? `${coupon.min_deposit.toLocaleString()}원` : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {formatDate(coupon.created_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {formatDate(coupon.end_date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {formatDate(coupon.used_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[coupon.status]}`}>
                      {STATUS_LABELS[coupon.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {coupon.status === 'active' && (
                        <button onClick={() => handleToggleStatus(coupon)} className="px-2 py-1 text-xs text-warning hover:bg-warning/10 rounded transition-colors">
                          비활성
                        </button>
                      )}
                      {coupon.status === 'inactive' && (
                        <button onClick={() => handleToggleStatus(coupon)} className="px-2 py-1 text-xs text-success hover:bg-success/10 rounded transition-colors">
                          활성화
                        </button>
                      )}
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
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {paginated.length === 0 && (
          <div className="bg-dark-card rounded-xl border border-white/5 p-8 text-center text-text-muted text-sm">
            해당 조건의 쿠폰이 없습니다.
          </div>
        )}
        {paginated.map((coupon, idx) => (
          <div key={coupon.id} className="bg-dark-card rounded-xl border border-white/5 p-4">
            {/* Top row: number + code + amount */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-5 text-right">{(currentPage - 1) * perPage + idx + 1}</span>
                <div>
                  <span className="font-mono text-sm text-white font-medium">{coupon.code}</span>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[coupon.type]}`}>
                      {TYPE_LABELS[coupon.type]}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[coupon.status]}`}>
                      {STATUS_LABELS[coupon.status]}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-lg font-bold text-white">
                {formatAmount(coupon.type, coupon.amount)}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
              <div className="flex justify-between">
                <span className="text-text-muted">받는사람</span>
                <span className="text-text-secondary">
                  {coupon.target_user_id
                    ? (coupon.target_username || `ID:${coupon.target_user_id}`)
                    : '전체'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">최소입금</span>
                <span className="text-text-secondary">
                  {coupon.min_deposit > 0 ? `${coupon.min_deposit.toLocaleString()}원` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">발급일</span>
                <span className="text-text-secondary">{formatDate(coupon.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">만료일</span>
                <span className="text-text-secondary">{formatDate(coupon.end_date)}</span>
              </div>
              {coupon.used_at && (
                <div className="flex justify-between col-span-2">
                  <span className="text-text-muted">사용일</span>
                  <span className="text-info">{formatDate(coupon.used_at)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t border-white/5 pt-3">
              {coupon.status === 'active' && (
                <button onClick={() => handleToggleStatus(coupon)} className="flex-1 py-1.5 text-xs text-warning bg-warning/5 hover:bg-warning/10 rounded-lg transition-colors">
                  비활성
                </button>
              )}
              {coupon.status === 'inactive' && (
                <button onClick={() => handleToggleStatus(coupon)} className="flex-1 py-1.5 text-xs text-success bg-success/5 hover:bg-success/10 rounded-lg transition-colors">
                  활성화
                </button>
              )}
              <button onClick={() => handleDelete(coupon.id)} className="flex-1 py-1.5 text-xs text-danger bg-danger/5 hover:bg-danger/10 rounded-lg transition-colors">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* ===== Create / Personal Issue Modal ===== */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="쿠폰 발급" size="md">
        <div className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">쿠폰 코드</label>
            <div className="flex gap-2">
              <input
                value={createForm.code}
                onChange={e => setCreateForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="비워두면 자동 생성"
                className="flex-1 px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50 font-mono"
              />
              <button
                onClick={() => setCreateForm(f => ({ ...f, code: generateCode() }))}
                className="px-3 py-2.5 bg-dark-elevated hover:bg-white/10 text-text-secondary text-sm rounded-lg transition-colors whitespace-nowrap border border-white/5"
              >
                자동생성
              </button>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">종류</label>
            <div className="grid grid-cols-3 gap-2">
              {(['BONUS_MONEY', 'FREE_SPIN', 'DEPOSIT_BONUS'] as CouponType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setCreateForm(f => ({ ...f, type: t }))}
                  className={`py-2.5 text-sm rounded-lg border transition-colors ${
                    createForm.type === t
                      ? 'border-accent/50 bg-accent/10 text-accent font-medium'
                      : 'border-white/5 bg-dark-input text-text-muted hover:text-white hover:border-white/10'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {createForm.type === 'DEPOSIT_BONUS' ? '비율 (%)' : createForm.type === 'FREE_SPIN' ? '횟수' : '금액 (원)'}
            </label>
            <input
              type="number"
              value={createForm.amount || ''}
              onChange={e => setCreateForm(f => ({ ...f, amount: parseInt(e.target.value) || 0 }))}
              placeholder={createForm.type === 'DEPOSIT_BONUS' ? '예: 15' : createForm.type === 'FREE_SPIN' ? '예: 50' : '예: 10000'}
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Min deposit - show for DEPOSIT_BONUS always, optional for others */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              최소 입금액 (원)
              {createForm.type !== 'DEPOSIT_BONUS' && <span className="text-text-muted ml-1">선택</span>}
            </label>
            <input
              type="number"
              value={createForm.min_deposit || ''}
              onChange={e => setCreateForm(f => ({ ...f, min_deposit: parseInt(e.target.value) || 0 }))}
              placeholder="0 = 조건 없음"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">만료일</label>
            <input
              type="date"
              value={createForm.end_date}
              onChange={e => setCreateForm(f => ({ ...f, end_date: e.target.value }))}
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Target user */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              특정 유저 전용 <span className="text-text-muted">선택</span>
            </label>
            <input
              type="text"
              value={createForm.target_user_id}
              onChange={e => setCreateForm(f => ({ ...f, target_user_id: e.target.value }))}
              placeholder="유저 ID 입력 (비워두면 전체 대상)"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Max uses */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">최대 사용 횟수</label>
            <input
              type="number"
              value={createForm.max_uses || ''}
              onChange={e => setCreateForm(f => ({ ...f, max_uses: parseInt(e.target.value) || 0 }))}
              placeholder="0 = 무제한"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">설명</label>
            <input
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              placeholder="쿠폰 설명 (관리용)"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Preview */}
          <div className="bg-dark-elevated/50 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-text-muted mb-1">발급 미리보기</p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-white">{createForm.code || '(자동생성)'}</span>
              <span className="text-sm font-medium text-accent">
                {createForm.amount > 0 ? formatAmount(createForm.type, createForm.amount) : '-'}
              </span>
            </div>
            <div className="flex gap-2 mt-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${TYPE_COLORS[createForm.type]}`}>
                {TYPE_LABELS[createForm.type]}
              </span>
              {createForm.target_user_id && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                  유저 {createForm.target_user_id}
                </span>
              )}
              {createForm.end_date && (
                <span className="text-[10px] text-text-muted">~{createForm.end_date}</span>
              )}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={createForm.amount <= 0}
            className="w-full py-3 btn-cta text-sm rounded-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            쿠폰 발급
          </button>
        </div>
      </Modal>

      {/* ===== Bulk Create Modal ===== */}
      <Modal isOpen={showBulk} onClose={() => setShowBulk(false)} title="벌크 쿠폰 발급" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-sm text-text-secondary mb-1">코드 접두사</label>
              <input
                value={bulkForm.prefix}
                onChange={e => setBulkForm(f => ({ ...f, prefix: e.target.value.toUpperCase() }))}
                placeholder="PROMO"
                className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50 font-mono"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">종류</label>
            <div className="grid grid-cols-3 gap-2">
              {(['BONUS_MONEY', 'FREE_SPIN', 'DEPOSIT_BONUS'] as CouponType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setBulkForm(f => ({ ...f, type: t }))}
                  className={`py-2 text-xs rounded-lg border transition-colors ${
                    bulkForm.type === t
                      ? 'border-accent/50 bg-accent/10 text-accent font-medium'
                      : 'border-white/5 bg-dark-input text-text-muted hover:text-white hover:border-white/10'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {bulkForm.type === 'DEPOSIT_BONUS' ? '비율 (%)' : bulkForm.type === 'FREE_SPIN' ? '횟수' : '금액 (원)'}
            </label>
            <input
              type="number"
              value={bulkForm.amount || ''}
              onChange={e => setBulkForm(f => ({ ...f, amount: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Min deposit */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">최소 입금액 (원)</label>
            <input
              type="number"
              value={bulkForm.min_deposit || ''}
              onChange={e => setBulkForm(f => ({ ...f, min_deposit: parseInt(e.target.value) || 0 }))}
              placeholder="0 = 조건 없음"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Max uses */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">최대 사용 횟수 (개당)</label>
            <input
              type="number"
              value={bulkForm.max_uses || ''}
              onChange={e => setBulkForm(f => ({ ...f, max_uses: parseInt(e.target.value) || 0 }))}
              placeholder="1"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">만료일</label>
            <input
              type="date"
              value={bulkForm.end_date}
              onChange={e => setBulkForm(f => ({ ...f, end_date: e.target.value }))}
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Preview */}
          <div className="bg-dark-elevated/50 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-text-muted mb-2">미리보기</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-white">{bulkForm.prefix}-XXXXXX</span>
              <span className="text-xs text-text-muted">x</span>
              <span className="text-sm font-bold text-accent">{bulkForm.count}개</span>
            </div>
            <div className="flex gap-2 mt-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${TYPE_COLORS[bulkForm.type]}`}>
                {TYPE_LABELS[bulkForm.type]}
              </span>
              <span className="text-[10px] text-text-muted">
                각 {bulkForm.amount > 0 ? formatAmount(bulkForm.type, bulkForm.amount) : '-'}
              </span>
            </div>
          </div>

          <button
            onClick={handleBulkCreate}
            disabled={bulkForm.amount <= 0 || bulkForm.count <= 0}
            className="w-full py-3 btn-cta text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkForm.count}개 일괄 발급
          </button>
        </div>
      </Modal>
    </div>
  );
}
