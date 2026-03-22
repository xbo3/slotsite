import { Router, Request, Response } from 'express';

const router = Router();

const translations: Record<string, Record<string, string>> = {
  en: {
    // Auth
    'login': 'Login', 'register': 'Sign Up', 'logout': 'Logout',
    'username': 'Username', 'password': 'Password', 'confirm_password': 'Confirm Password',
    // Nav
    'home': 'Home', 'lobby': 'Game Lobby', 'slots': 'Slots', 'casino': 'Casino',
    'live_casino': 'Live Casino', 'sports': 'Sports', 'promotions': 'Promotions',
    // Wallet
    'deposit': 'Deposit', 'withdraw': 'Withdraw', 'balance': 'Balance',
    'deposit_amount': 'Deposit Amount', 'withdraw_amount': 'Withdraw Amount',
    'bank_transfer': 'Bank Transfer', 'crypto': 'Crypto',
    'min_deposit': 'Minimum Deposit', 'min_withdraw': 'Minimum Withdrawal',
    // Bonus
    'bonus': 'Bonus', 'coupon': 'Coupon', 'coupon_code': 'Coupon Code',
    'apply_coupon': 'Apply Coupon', 'wager': 'Wager Requirement',
    'free_spin': 'Free Spins', 'cashback': 'Cashback',
    // VIP
    'vip': 'VIP', 'vip_level': 'VIP Level', 'vip_points': 'VIP Points',
    // Game
    'play_now': 'Play Now', 'demo': 'Demo', 'provider': 'Provider',
    'rtp': 'RTP', 'max_win': 'Max Win', 'popular': 'Popular', 'new_games': 'New',
    // User
    'profile': 'Profile', 'my_page': 'My Page', 'bet_history': 'Bet History',
    'transaction_history': 'Transaction History', 'settings': 'Settings',
    // Support
    'support': 'Support', 'faq': 'FAQ', 'live_chat': 'Live Chat',
    // Common
    'submit': 'Submit', 'cancel': 'Cancel', 'confirm': 'Confirm',
    'loading': 'Loading...', 'error': 'Error', 'success': 'Success',
    'no_data': 'No data', 'view_all': 'View All',
    // Footer
    'terms': 'Terms of Service', 'privacy': 'Privacy Policy',
    'responsible_gaming': 'Responsible Gaming', 'about_us': 'About Us',
  },
  th: {
    // Auth
    'login': 'เข้าสู่ระบบ', 'register': 'สมัครสมาชิก', 'logout': 'ออกจากระบบ',
    'username': 'ชื่อผู้ใช้', 'password': 'รหัสผ่าน', 'confirm_password': 'ยืนยันรหัสผ่าน',
    // Nav
    'home': 'หน้าแรก', 'lobby': 'ล็อบบี้เกม', 'slots': 'สล็อต', 'casino': 'คาสิโน',
    'live_casino': 'คาสิโนสด', 'sports': 'กีฬา', 'promotions': 'โปรโมชั่น',
    // Wallet
    'deposit': 'ฝากเงิน', 'withdraw': 'ถอนเงิน', 'balance': 'ยอดคงเหลือ',
    'deposit_amount': 'จำนวนเงินฝาก', 'withdraw_amount': 'จำนวนเงินถอน',
    'bank_transfer': 'โอนผ่านธนาคาร', 'crypto': 'คริปโต',
    'min_deposit': 'ฝากขั้นต่ำ', 'min_withdraw': 'ถอนขั้นต่ำ',
    // Bonus
    'bonus': 'โบนัส', 'coupon': 'คูปอง', 'coupon_code': 'รหัสคูปอง',
    'apply_coupon': 'ใช้คูปอง', 'wager': 'เงื่อนไขการเดิมพัน',
    'free_spin': 'ฟรีสปิน', 'cashback': 'คืนเงิน',
    // VIP
    'vip': 'วีไอพี', 'vip_level': 'ระดับวีไอพี', 'vip_points': 'คะแนนวีไอพี',
    // Game
    'play_now': 'เล่นเลย', 'demo': 'ทดลองเล่น', 'provider': 'ผู้ให้บริการ',
    'rtp': 'อัตราการจ่าย', 'max_win': 'ชนะสูงสุด', 'popular': 'ยอดนิยม', 'new_games': 'ใหม่',
    // User
    'profile': 'โปรไฟล์', 'my_page': 'หน้าของฉัน', 'bet_history': 'ประวัติการเดิมพัน',
    'transaction_history': 'ประวัติธุรกรรม', 'settings': 'ตั้งค่า',
    // Support
    'support': 'ฝ่ายสนับสนุน', 'faq': 'คำถามที่พบบ่อย', 'live_chat': 'แชทสด',
    // Common
    'submit': 'ส่ง', 'cancel': 'ยกเลิก', 'confirm': 'ยืนยัน',
    'loading': 'กำลังโหลด...', 'error': 'ข้อผิดพลาด', 'success': 'สำเร็จ',
    'no_data': 'ไม่มีข้อมูล', 'view_all': 'ดูทั้งหมด',
    // Footer
    'terms': 'เงื่อนไขการให้บริการ', 'privacy': 'นโยบายความเป็นส่วนตัว',
    'responsible_gaming': 'เล่นอย่างรับผิดชอบ', 'about_us': 'เกี่ยวกับเรา',
  }
};

// GET /api/i18n/:lang
router.get('/:lang', (req: Request, res: Response) => {
  const lang = req.params.lang as string;
  const t = translations[lang];
  if (!t) return res.status(404).json({ success: false, error: 'Language not found', available: Object.keys(translations) });
  res.json({ success: true, data: { lang, translations: t } });
});

// GET /api/i18n — 지원 언어 목록
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: { languages: [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'th', name: 'Thai', native: 'ภาษาไทย' }
  ]}});
});

export default router;
