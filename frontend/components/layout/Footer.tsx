import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Copyright */}
          <div>
            <span className="text-xl font-bold">
              <span className="text-accent">Slot</span>
              <span className="text-white">Site</span>
            </span>
            <p className="mt-2 text-sm text-text-secondary">
              최고의 온라인 슬롯 경험을 제공합니다.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">바로가기</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/lobby" className="hover:text-white transition-colors">
                  게임 로비
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-white transition-colors">
                  충전/환전
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  고객센터
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">안내</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>18세 이상 이용 가능</li>
              <li>책임감 있는 게임을 권장합니다</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/5 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} SlotSite. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
