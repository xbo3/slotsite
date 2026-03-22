'use client';

import { useState, useEffect, useCallback } from 'react';
import { partnerApi } from '@/lib/api';

interface Partner {
  id: number;
  username: string;
  name: string;
  code: string;
  commission_rate: number;
  status: string;
  memo: string | null;
  parent_id: number | null;
  created_at: string;
  parent?: { id: number; name: string; code: string } | null;
  _count: { users: number; children: number };
  children?: Partner[];
}

interface PartnerUser {
  id: number;
  username: string;
  nickname: string;
  balance: number;
  status: string;
  created_at: string;
  last_login: string | null;
}

// DUMMY 데이터
const DUMMY_PARTNERS: Partner[] = [
  { id: 1, username: 'partner1', name: '골드파트너', code: 'GOLD01', commission_rate: 5, status: 'ACTIVE', memo: null, parent_id: null, created_at: '2026-01-15T00:00:00Z', parent: null, _count: { users: 25, children: 2 } },
  { id: 2, username: 'partner2', name: '실버파트너', code: 'SILVER01', commission_rate: 3, status: 'ACTIVE', memo: null, parent_id: 1, created_at: '2026-02-01T00:00:00Z', parent: { id: 1, name: '골드파트너', code: 'GOLD01' }, _count: { users: 10, children: 0 } },
  { id: 3, username: 'partner3', name: '브론즈파트너', code: 'BRONZE01', commission_rate: 2, status: 'INACTIVE', memo: '테스트용', parent_id: 1, created_at: '2026-02-15T00:00:00Z', parent: { id: 1, name: '골드파트너', code: 'GOLD01' }, _count: { users: 5, children: 0 } },
];

const DUMMY_TREE: Partner[] = [
  { ...DUMMY_PARTNERS[0], children: [DUMMY_PARTNERS[1], DUMMY_PARTNERS[2]] },
];

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // 모달
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showTree, setShowTree] = useState(false);

  // 생성 폼
  const [form, setForm] = useState({ username: '', password: '', name: '', code: '', commission_rate: 0, parent_id: '', memo: '' });

  // 상세
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerUsers, setPartnerUsers] = useState<PartnerUser[]>([]);
  const [partnerStats, setPartnerStats] = useState<Record<string, number> | null>(null);

  // 트리
  const [treeData, setTreeData] = useState<Partner[]>([]);

  // 수정 모달
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', commission_rate: 0, status: '', memo: '', password: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (search) params.set('search', search);
      const res = await partnerApi.getPartners(params.toString());
      if (res.success && res.data) {
        setPartners(res.data.partners);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } else {
        // DUMMY fallback
        setPartners(DUMMY_PARTNERS);
        setTotal(DUMMY_PARTNERS.length);
        setTotalPages(1);
      }
    } catch {
      setPartners(DUMMY_PARTNERS);
      setTotal(DUMMY_PARTNERS.length);
      setTotalPages(1);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleCreate = async () => {
    const res = await partnerApi.createPartner({
      ...form,
      commission_rate: Number(form.commission_rate),
      parent_id: form.parent_id ? Number(form.parent_id) : null,
    });
    if (res.success) {
      setShowCreate(false);
      setForm({ username: '', password: '', name: '', code: '', commission_rate: 0, parent_id: '', memo: '' });
      fetchPartners();
    } else {
      alert(res.error || '생성 실패');
    }
  };

  const handleDetail = async (p: Partner) => {
    setSelectedPartner(p);
    setShowDetail(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        partnerApi.getPartnerUsers(p.id),
        partnerApi.getPartnerStats(p.id),
      ]);
      if (usersRes.success && usersRes.data) setPartnerUsers(usersRes.data.users);
      if (statsRes.success && statsRes.data) setPartnerStats(statsRes.data.stats);
    } catch {
      setPartnerUsers([]);
      setPartnerStats(null);
    }
  };

  const handleTree = async () => {
    setShowTree(true);
    try {
      const res = await partnerApi.getPartnerTree();
      if (res.success && res.data) {
        setTreeData(res.data);
      } else {
        setTreeData(DUMMY_TREE);
      }
    } catch {
      setTreeData(DUMMY_TREE);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await partnerApi.deletePartner(id);
    if (res.success) {
      fetchPartners();
    } else {
      alert(res.error || '삭제 실패');
    }
  };

  const openEdit = (p: Partner) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, commission_rate: p.commission_rate, status: p.status, memo: p.memo || '', password: '' });
    setShowEdit(true);
  };

  const handleEdit = async () => {
    if (!editingId) return;
    const data: Record<string, string | number> = { name: editForm.name, commission_rate: Number(editForm.commission_rate), status: editForm.status, memo: editForm.memo };
    if (editForm.password) data.password = editForm.password;
    const res = await partnerApi.updatePartner(editingId, data);
    if (res.success) {
      setShowEdit(false);
      fetchPartners();
    } else {
      alert(res.error || '수정 실패');
    }
  };

  const activeCount = partners.filter(p => p.status === 'ACTIVE').length;
  const inactiveCount = partners.filter(p => p.status !== 'ACTIVE').length;
  const totalUsers = partners.reduce((s, p) => s + p._count.users, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">파트너 관리</h1>
        <div className="flex gap-2">
          <button onClick={handleTree} className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
            트리 뷰
          </button>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
            + 파트너 생성
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="총 파트너" value={total} />
        <StatCard label="활성" value={activeCount} color="text-green-400" />
        <StatCard label="비활성" value={inactiveCount} color="text-red-400" />
        <StatCard label="총 하부유저" value={totalUsers} color="text-blue-400" />
      </div>

      {/* 검색 */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="이름, 아이디, 추천코드 검색..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2 bg-[#1A1A2E] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* 목록 */}
      <div className="bg-[#1A1A2E] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-gray-400">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">아이디</th>
                <th className="px-4 py-3">추천코드</th>
                <th className="px-4 py-3">수수료율</th>
                <th className="px-4 py-3">하부유저</th>
                <th className="px-4 py-3">상위</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">가입일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">로딩 중...</td></tr>
              ) : partners.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">파트너가 없습니다</td></tr>
              ) : partners.map((p, i) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{(page - 1) * 20 + i + 1}</td>
                  <td className="px-4 py-3 text-white font-medium cursor-pointer hover:text-purple-400" onClick={() => handleDetail(p)}>{p.name}</td>
                  <td className="px-4 py-3 text-gray-300">{p.username}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-mono">{p.code}</span></td>
                  <td className="px-4 py-3 text-white">{p.commission_rate}%</td>
                  <td className="px-4 py-3 text-white">{p._count.users}명</td>
                  <td className="px-4 py-3 text-gray-400">{p.parent ? p.parent.name : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.status === 'ACTIVE' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30">수정</button>
                      <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-white/5">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-white/10 text-white text-sm rounded disabled:opacity-30">이전</button>
            <span className="px-3 py-1 text-gray-400 text-sm">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-white/10 text-white text-sm rounded disabled:opacity-30">다음</button>
          </div>
        )}
      </div>

      {/* 생성 모달 */}
      {showCreate && (
        <Modal title="파트너 생성" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <Input label="아이디 *" value={form.username} onChange={v => setForm({ ...form, username: v })} />
            <Input label="비밀번호 *" value={form.password} onChange={v => setForm({ ...form, password: v })} type="password" />
            <Input label="이름 *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Input label="추천코드 *" value={form.code} onChange={v => setForm({ ...form, code: v })} />
            <Input label="수수료율 (%)" value={String(form.commission_rate)} onChange={v => setForm({ ...form, commission_rate: Number(v) })} type="number" />
            <Input label="상위 파트너 ID" value={form.parent_id} onChange={v => setForm({ ...form, parent_id: v })} placeholder="없으면 비워두세요" />
            <Input label="메모" value={form.memo} onChange={v => setForm({ ...form, memo: v })} />
            <button onClick={handleCreate} className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">생성</button>
          </div>
        </Modal>
      )}

      {/* 수정 모달 */}
      {showEdit && (
        <Modal title="파트너 수정" onClose={() => setShowEdit(false)}>
          <div className="space-y-3">
            <Input label="이름" value={editForm.name} onChange={v => setEditForm({ ...editForm, name: v })} />
            <Input label="수수료율 (%)" value={String(editForm.commission_rate)} onChange={v => setEditForm({ ...editForm, commission_rate: Number(v) })} type="number" />
            <div>
              <label className="block text-xs text-gray-400 mb-1">상태</label>
              <select
                value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0F0F1A] border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
              </select>
            </div>
            <Input label="비밀번호 변경" value={editForm.password} onChange={v => setEditForm({ ...editForm, password: v })} type="password" placeholder="변경 시에만 입력" />
            <Input label="메모" value={editForm.memo} onChange={v => setEditForm({ ...editForm, memo: v })} />
            <button onClick={handleEdit} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">수정</button>
          </div>
        </Modal>
      )}

      {/* 상세 모달 */}
      {showDetail && selectedPartner && (
        <Modal title={`${selectedPartner.name} 상세`} onClose={() => setShowDetail(false)} wide>
          <div className="space-y-4">
            {/* 정산 통계 */}
            {partnerStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat label="하부유저" value={`${partnerStats.userCount}명`} />
                <MiniStat label="총입금" value={`${Number(partnerStats.totalDeposit).toLocaleString()}원`} />
                <MiniStat label="총출금" value={`${Number(partnerStats.totalWithdraw).toLocaleString()}원`} />
                <MiniStat label="총배팅" value={`${Number(partnerStats.totalBet).toLocaleString()}원`} />
                <MiniStat label="총당첨" value={`${Number(partnerStats.totalWin).toLocaleString()}원`} />
                <MiniStat label="순이익" value={`${Number(partnerStats.netProfit).toLocaleString()}원`} />
                <MiniStat label="수수료" value={`${Number(partnerStats.commission).toLocaleString()}원`} color="text-green-400" />
                <MiniStat label="하위파트너" value={`${partnerStats.childPartnerCount}개`} />
              </div>
            )}

            {/* 하부 유저 */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">하부 유저 목록</h3>
              <div className="bg-[#0F0F1A] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-gray-500">
                      <th className="px-3 py-2">아이디</th>
                      <th className="px-3 py-2">닉네임</th>
                      <th className="px-3 py-2">잔액</th>
                      <th className="px-3 py-2">상태</th>
                      <th className="px-3 py-2">가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerUsers.length === 0 ? (
                      <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-500">유저 없음</td></tr>
                    ) : partnerUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5">
                        <td className="px-3 py-2 text-white">{u.username}</td>
                        <td className="px-3 py-2 text-gray-300">{u.nickname}</td>
                        <td className="px-3 py-2 text-white">{Number(u.balance).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs ${u.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>{u.status}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 트리 뷰 모달 */}
      {showTree && (
        <Modal title="파트너 트리" onClose={() => setShowTree(false)} wide>
          <div className="space-y-2">
            {treeData.length === 0 ? (
              <p className="text-gray-500 text-sm">파트너가 없습니다</p>
            ) : treeData.map(node => (
              <TreeNode key={node.id} node={node} depth={0} />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== 하위 컴포넌트 =====

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-[#1A1A2E] rounded-xl p-4 border border-white/5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color || 'text-white'}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#1A1A2E] rounded-lg p-3 border border-white/5">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className={`text-sm font-medium ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0F0F1A] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
      />
    </div>
  );
}

function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className={`bg-[#1A1A2E] rounded-2xl border border-white/10 p-6 ${wide ? 'w-[90vw] max-w-3xl' : 'w-full max-w-md'} max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TreeNode({ node, depth }: { node: Partner; depth: number }) {
  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 px-3 rounded hover:bg-white/5" style={{ paddingLeft: `${depth * 24 + 12}px` }}>
        {(node.children && node.children.length > 0) ? (
          <span className="text-gray-400 text-xs">&#9660;</span>
        ) : (
          <span className="text-gray-600 text-xs">&#9654;</span>
        )}
        <span className="text-white text-sm font-medium">{node.name}</span>
        <span className="text-xs text-purple-400 font-mono">{node.code}</span>
        <span className="text-xs text-gray-500">{node.commission_rate}%</span>
        <span className="text-xs text-gray-500">{node._count?.users || 0}명</span>
        <span className={`text-xs ${node.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>{node.status === 'ACTIVE' ? '활성' : '비활성'}</span>
      </div>
      {node.children && node.children.map(child => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
