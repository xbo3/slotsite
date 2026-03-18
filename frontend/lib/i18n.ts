// 번역 사전
const translations = {
  ko: {
    // 공통
    'home': '홈',
    'games': '게임',
    'lobby': '로비',
    'bonus': '보너스',
    'wallet': '지갑',
    'mypage': '마이페이지',
    'support': '고객센터',
    'login': '로그인',
    'register': '회원가입',
    'logout': '로그아웃',
    'more': '더보기',
    'search': '검색',
    'balance': '잔액',
    'deposit': '충전',
    'withdraw': '환전',
    'settings': '설정',
    'profile': '프로필',

    // 메인
    'popular_games': '인기 게임',
    'new_games': '신규 게임',
    'all_games': '전체 게임',
    'play_now': '지금 플레이',
    'see_all': '전체 보기',
    'providers': '프로바이더',
    'live_betting': '실시간 베팅',
    'big_wins': '빅윈 현황',
    'leaderboard': '리더보드',

    // 보너스
    'emergency_bonus': '이멀전시 보너스',
    'derived_bonus': '파생 보너스',
    'linked_bonus': '연계 보너스',
    'relay_bonus': '릴레이 보너스',
    'request_bonus': '요청 보너스',
    'grade_benefits': '그레이드 혜택',
    'bonus_loan': '보너스 대출',
    'available': '받기 가능',
    'claimed': '수령완료',
    'convert': '전환하기',
    'current_rolling': '현재 롤링',

    // 지갑
    'deposit_request': '충전 요청',
    'withdraw_request': '환전 요청',
    'transaction_history': '거래 내역',
    'min_deposit': '최소 입금',
    'estimated_arrival': '예상 도착',

    // 마이페이지
    'my_profile': '내 프로필',
    'betting_history': '베팅 내역',
    'my_bonus': '내 보너스',
    'my_transactions': '거래 내역',
    'change_password': '비밀번호 변경',
    'nickname': '닉네임',

    // 관리자
    'admin_dashboard': '관리자 대시보드',
    'user_management': '회원관리',
    'finance_management': '입출금관리',
    'game_management': '게임관리',
    'bonus_management': '보너스관리',

    // 로그인/회원가입
    'username': '아이디',
    'password': '비밀번호',
    'confirm_password': '비밀번호 확인',
    'phone': '연락처',
    'already_have_account': '이미 계정이 있으신가요?',
    'no_account': '계정이 없으신가요?',

    // 푸터
    'responsible_gaming': '책임감 있는 게이밍',
    'terms': '이용약관',
    'privacy': '개인정보처리방침',
    'copyright': '© 2026 SlotSite. All rights reserved.',

    // 기타
    'loading': '로딩 중...',
    'no_data': '데이터가 없습니다',
    'error': '오류가 발생했습니다',
    'confirm': '확인',
    'cancel': '취소',
    'save': '저장',
    'delete': '삭제',
    'edit': '수정',
    'close': '닫기',
    'copy': '복사',
    'copied': '복사됨',

    // Header
    'search_games': '게임 검색...',
    'recent_searches': '최근 검색어',
    'held_balance': '보유 잔액',
    'withdrawal': '출금',
    'menu': '메뉴',

    // Sidebar
    'slots': '슬롯',
    'live': '라이브',
    'table': '테이블',
    'mini_games': '미니게임',
    'customer_support_247': '24/7 고객지원',
    'live_chat': '실시간 채팅 상담',

    // MobileNav
    'select_category': '카테고리 선택',
    'num_games': '개 게임',
    'view_all_games': '전체 게임 보기',

    // Footer
    'best_slot_experience': '최고의 온라인 슬롯 경험을 제공합니다.',
    'quick_links': '바로가기',
    'game_lobby': '게임 로비',
    'deposit_withdraw': '충전/환전',
    'info': '안내',
    'age_restriction': '18세 이상 이용 가능',
    'responsible_gaming_msg': '책임감 있는 게임을 권장합니다',

    // Login
    'login_title': '로그인',
    'login_subtitle': '계정에 로그인하고 게임을 시작하세요',
    'enter_username': '아이디를 입력하세요',
    'enter_password': '비밀번호를 입력하세요',
    'login_required': '아이디와 비밀번호를 입력해주세요.',
    'login_failed': '로그인에 실패했습니다.',
    'login_error': '로그인 중 오류가 발생했습니다.',
    'logging_in': '로그인 중...',
    'not_member': '아직 회원이 아니세요?',
    'forgot_password': '비밀번호 잊으셨나요?',
    'or': '또는',

    // Register
    'register_title': '회원가입',
    'register_subtitle': '무료로 가입하고 다양한 게임을 즐기세요',
    'username_placeholder': '영문, 숫자 4자 이상',
    'pw_placeholder': '8자 이상',
    'pw_confirm_placeholder': '비밀번호를 다시 입력하세요',
    'required_fields': '필수 항목을 모두 입력해주세요.',
    'username_min': '아이디는 4자 이상이어야 합니다.',
    'pw_min': '비밀번호는 8자 이상이어야 합니다.',
    'pw_mismatch': '비밀번호가 일치하지 않습니다.',
    'register_failed': '회원가입에 실패했습니다.',
    'register_error': '회원가입 중 오류가 발생했습니다.',
    'registering': '가입 중...',
    'register_btn': '가입하기',
    'username_min_msg': '4자 이상 입력해주세요',
    'username_valid': '사용 가능한 아이디입니다',
    'pw_strength': '비밀번호 강도',
    'pw_weak': '약함',
    'pw_medium': '보통',
    'pw_strong': '강함',
    'pw_match': '비밀번호가 일치합니다',
    'signup_bonus_title': '가입 보너스',
    'signup_bonus_amount': '\u20AE10 즉시 지급!',
    'signup_bonus_desc1': '지금 가입하고 무료 보너스로',
    'signup_bonus_desc2': '프리미엄 슬롯을 체험하세요',
    'games_count': '300+ 게임',
    'instant_withdraw': '즉시 출금',
    '247_support': '24/7 지원',
  },
  en: {
    'home': 'Home',
    'games': 'Games',
    'lobby': 'Lobby',
    'bonus': 'Bonus',
    'wallet': 'Wallet',
    'mypage': 'My Page',
    'support': 'Support',
    'login': 'Login',
    'register': 'Sign Up',
    'logout': 'Logout',
    'more': 'More',
    'search': 'Search',
    'balance': 'Balance',
    'deposit': 'Deposit',
    'withdraw': 'Withdraw',
    'settings': 'Settings',
    'profile': 'Profile',

    'popular_games': 'Popular Games',
    'new_games': 'New Games',
    'all_games': 'All Games',
    'play_now': 'PLAY NOW',
    'see_all': 'See All',
    'providers': 'Providers',
    'live_betting': 'Live Betting',
    'big_wins': 'Big Wins',
    'leaderboard': 'Leaderboard',

    'emergency_bonus': 'Emergency Bonus',
    'derived_bonus': 'Derived Bonus',
    'linked_bonus': 'Linked Bonus',
    'relay_bonus': 'Relay Bonus',
    'request_bonus': 'Request Bonus',
    'grade_benefits': 'Grade Benefits',
    'bonus_loan': 'Bonus Loan',
    'available': 'Available',
    'claimed': 'Claimed',
    'convert': 'Convert',
    'current_rolling': 'Current Rolling',

    'deposit_request': 'Deposit',
    'withdraw_request': 'Withdraw',
    'transaction_history': 'Transaction History',
    'min_deposit': 'Min Deposit',
    'estimated_arrival': 'Est. Arrival',

    'my_profile': 'My Profile',
    'betting_history': 'Betting History',
    'my_bonus': 'My Bonus',
    'my_transactions': 'Transactions',
    'change_password': 'Change Password',
    'nickname': 'Nickname',

    'admin_dashboard': 'Admin Dashboard',
    'user_management': 'Users',
    'finance_management': 'Finance',
    'game_management': 'Games',
    'bonus_management': 'Bonus',

    'username': 'Username',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'phone': 'Phone',
    'already_have_account': 'Already have an account?',
    'no_account': "Don't have an account?",

    'responsible_gaming': 'Responsible Gaming',
    'terms': 'Terms of Service',
    'privacy': 'Privacy Policy',
    'copyright': '© 2026 SlotSite. All rights reserved.',

    'loading': 'Loading...',
    'no_data': 'No data available',
    'error': 'An error occurred',
    'confirm': 'Confirm',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'close': 'Close',
    'copy': 'Copy',
    'copied': 'Copied',

    // Header
    'search_games': 'Search games...',
    'recent_searches': 'Recent Searches',
    'held_balance': 'Balance',
    'withdrawal': 'Withdraw',
    'menu': 'Menu',

    // Sidebar
    'slots': 'Slots',
    'live': 'Live',
    'table': 'Table',
    'mini_games': 'Mini Games',
    'customer_support_247': '24/7 Support',
    'live_chat': 'Live Chat Support',

    // MobileNav
    'select_category': 'Select Category',
    'num_games': ' games',
    'view_all_games': 'View All Games',

    // Footer
    'best_slot_experience': 'The best online slot experience.',
    'quick_links': 'Quick Links',
    'game_lobby': 'Game Lobby',
    'deposit_withdraw': 'Deposit / Withdraw',
    'info': 'Info',
    'age_restriction': 'Must be 18 or older',
    'responsible_gaming_msg': 'We encourage responsible gaming',

    // Login
    'login_title': 'Login',
    'login_subtitle': 'Login to your account and start playing',
    'enter_username': 'Enter your username',
    'enter_password': 'Enter your password',
    'login_required': 'Please enter your username and password.',
    'login_failed': 'Login failed.',
    'login_error': 'An error occurred during login.',
    'logging_in': 'Logging in...',
    'not_member': 'Not a member yet?',
    'forgot_password': 'Forgot password?',
    'or': 'or',

    // Register
    'register_title': 'Sign Up',
    'register_subtitle': 'Sign up for free and enjoy various games',
    'username_placeholder': 'Alphanumeric, 4+ characters',
    'pw_placeholder': '8+ characters',
    'pw_confirm_placeholder': 'Re-enter your password',
    'required_fields': 'Please fill in all required fields.',
    'username_min': 'Username must be at least 4 characters.',
    'pw_min': 'Password must be at least 8 characters.',
    'pw_mismatch': 'Passwords do not match.',
    'register_failed': 'Registration failed.',
    'register_error': 'An error occurred during registration.',
    'registering': 'Signing up...',
    'register_btn': 'Sign Up',
    'username_min_msg': 'At least 4 characters required',
    'username_valid': 'Username is available',
    'pw_strength': 'Password strength',
    'pw_weak': 'Weak',
    'pw_medium': 'Medium',
    'pw_strong': 'Strong',
    'pw_match': 'Passwords match',
    'signup_bonus_title': 'Sign-Up Bonus',
    'signup_bonus_amount': '\u20AE10 Instant!',
    'signup_bonus_desc1': 'Sign up now and try',
    'signup_bonus_desc2': 'premium slots with free bonus',
    'games_count': '300+ Games',
    'instant_withdraw': 'Instant Withdraw',
    '247_support': '24/7 Support',
  }
};

export type Lang = 'ko' | 'en';
export type TranslationKey = keyof typeof translations.ko;

// 번역 함수
export function t(key: string, lang: Lang = 'ko'): string {
  return (translations[lang] as Record<string, string>)?.[key] || key;
}

// 언어 저장/불러오기
export function getLang(): Lang {
  if (typeof window === 'undefined') return 'ko';
  return (localStorage.getItem('lang') as Lang) || 'ko';
}

export function setLang(lang: Lang): void {
  localStorage.setItem('lang', lang);
}
