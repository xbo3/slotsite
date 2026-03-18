// 실제 PG Soft 게임 데이터 39개

export const DEMO_GAMES = [
  // === 기본 15개 ===
  { id: 1, name: 'Flirting Scholar', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/d078f748-944f-46c1-89aa-d39e73fe1b7e.jpg', rtp: '96.75%', maxWin: 'x5000', isNew: false, isHot: true },
  { id: 2, name: 'Ninja vs Samurai', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/e2133b02-1d3c-49bd-b7c7-b880beecc0b3.jpg', rtp: '96.50%', maxWin: 'x3000', isNew: false, isHot: true },
  { id: 3, name: 'Muay Thai Champion', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/786eba8c-64ff-4a74-80dc-307b9e6fee6a.jpg', rtp: '96.80%', maxWin: 'x8000', isNew: false, isHot: false },
  { id: 4, name: 'Leprechaun Riches', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/57d40efb-9c97-4c1b-977c-921a5f6173b8.jpg', rtp: '96.40%', maxWin: 'x4000', isNew: false, isHot: true },
  { id: 5, name: 'Dragon Legend', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/fbc99b9e-580b-49bd-9fdc-97741fe983de.png', rtp: '96.70%', maxWin: 'x6000', isNew: false, isHot: false },
  { id: 6, name: 'Mayan Destiny', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/5799539d-0d10-43ae-a16f-fb81c4197328.jpg', rtp: '96.55%', maxWin: 'x5000', isNew: true, isHot: false },
  { id: 7, name: 'Inferno Mayhem', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/8ddbc4f9-891c-4ede-a003-dfc8c0e5f721.webp', rtp: '96.60%', maxWin: 'x10000', isNew: true, isHot: true },
  { id: 8, name: 'Fortune Horse', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/c94741fa-7df8-46d3-8841-8b3e6fa8baa3.jpg', rtp: '96.45%', maxWin: 'x3500', isNew: false, isHot: false },
  { id: 9, name: 'Forbidden Alchemy', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/40574712-13fb-45de-8b4c-61956b7ffdfa.jpg', rtp: '96.80%', maxWin: 'x7000', isNew: true, isHot: false },
  { id: 10, name: 'Mythical Guardians', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/868e2fed-b794-4e62-8bec-cca17ce66f3e.jpg', rtp: '96.50%', maxWin: 'x4500', isNew: false, isHot: false },
  { id: 11, name: 'Poker Kingdom Win', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/45a72f52-b2ab-4a64-a13c-f2633c6fe708.webp', rtp: '96.30%', maxWin: 'x2000', isNew: true, isHot: false },
  { id: 12, name: "Alibaba's Cave of Fortune", provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/ce79987a-6228-4e3f-95f9-19c2a5d344ee.jpg', rtp: '96.90%', maxWin: 'x15000', isNew: true, isHot: true },
  { id: 13, name: 'Skylight Wonders', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/edee4972-7863-4f54-8c87-1337c246908e.jpg', rtp: '96.65%', maxWin: 'x5500', isNew: true, isHot: false },
  { id: 14, name: 'Pharaoh Royals', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/a91a74c1-f908-43cb-9c82-7409a37cdcd0.jpg', rtp: '96.70%', maxWin: 'x8000', isNew: false, isHot: true },
  { id: 15, name: 'Kraken Gold Rush', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/de440243-d423-495a-affc-036b8a43c788.jpg', rtp: '96.55%', maxWin: 'x6500', isNew: true, isHot: false },

  // === 보라 계열 12개 ===
  { id: 16, name: 'Wings of Iguazu', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/6bc0d627-e447-4e6c-ae30-04b39aef7724.webp', rtp: '96.50%', maxWin: 'x5000', isNew: false, isHot: false },
  { id: 17, name: 'Chicky Run', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/77ed874b-fd73-473c-8e45-2a1e8a9b973c.png', rtp: '96.40%', maxWin: 'x3000', isNew: false, isHot: false },
  { id: 18, name: 'Wild Ape #3258', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/29904434-8ffd-4174-9a81-c919a5a19237.jpg', rtp: '96.75%', maxWin: 'x7000', isNew: false, isHot: true },
  { id: 19, name: 'Fortune Dragon', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/72f8d537-77e5-4506-803a-63e7f58d4fec.png', rtp: '96.60%', maxWin: 'x8000', isNew: false, isHot: true },
  { id: 20, name: 'Dragon Hatch 2', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/d6db46aa-ed58-4289-ac02-dfd9bfc7e0ca.jpg', rtp: '96.80%', maxWin: 'x10000', isNew: true, isHot: true },
  { id: 21, name: 'Fruity Candy', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/c1bd5f08-4f2b-4be1-be13-073a4ceef7e2.jpg', rtp: '96.35%', maxWin: 'x2500', isNew: false, isHot: false },
  { id: 22, name: 'Fortune Rabbit', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/779f47d5-d1ea-47a0-a68f-50cffb587564.jpg', rtp: '96.70%', maxWin: 'x6000', isNew: false, isHot: true },
  { id: 23, name: 'Totem Wonders', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/7eab4d8c-c935-4aeb-b996-10205e081ff3.jpg', rtp: '96.55%', maxWin: 'x4000', isNew: false, isHot: false },
  { id: 24, name: 'Wild Coaster', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/c162d25c-c3a5-4668-ba6a-0992b66818ad.jpg', rtp: '96.65%', maxWin: 'x5000', isNew: false, isHot: false },
  { id: 25, name: 'Mask Carnival', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/d03f47b4-9266-494a-8994-bd8ad7037af8.jpg', rtp: '96.45%', maxWin: 'x3500', isNew: false, isHot: false },
  { id: 26, name: 'Emoji Riches', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/524779d2-9d30-45de-9390-b17566b3cbae.jpg', rtp: '96.50%', maxWin: 'x4000', isNew: false, isHot: false },
  { id: 27, name: 'Mermaid Riches', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/519a69c1-32ec-4568-b13f-4db5d54515b8.jpg', rtp: '96.55%', maxWin: 'x5000', isNew: false, isHot: false },

  // === 귤/오렌지 계열 12개 ===
  { id: 28, name: 'Pinata Wins', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/815a44d0-361f-4399-a4ce-c72145cdeac4.png', rtp: '96.40%', maxWin: 'x3000', isNew: true, isHot: false },
  { id: 29, name: 'Ninja Raccoon Frenzy', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/b7c9b442-05cb-44e6-8899-89c2a74ba432.jpg', rtp: '96.70%', maxWin: 'x7000', isNew: true, isHot: true },
  { id: 30, name: 'Battleground Royale', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/218ce1b9-422c-4f4c-b171-351554528be4.jpg', rtp: '96.60%', maxWin: 'x5000', isNew: false, isHot: false },
  { id: 31, name: 'Rooster Rumble', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/3ba11aaf-0af3-4af8-95eb-5e554e0543c2.jpg', rtp: '96.55%', maxWin: 'x4500', isNew: false, isHot: false },
  { id: 32, name: 'Fortune Tiger', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/70aab544-e9aa-4451-9d5c-e2d6dcc85a1c.jpg', rtp: '96.80%', maxWin: 'x10000', isNew: false, isHot: true },
  { id: 33, name: 'Supermarket Spree', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/23b853aa-d8ef-41f8-9f5b-4f0682b43dbb.png', rtp: '96.45%', maxWin: 'x3000', isNew: false, isHot: false },
  { id: 34, name: 'Queen of Bounty', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/162b4a4c-02f4-42a1-927f-c07b364d3626.png', rtp: '96.70%', maxWin: 'x6000', isNew: false, isHot: true },
  { id: 35, name: 'Bikini Paradise', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/32232163-cb2e-42bc-9e6e-b7320b118044.jpg', rtp: '96.35%', maxWin: 'x2500', isNew: false, isHot: false },
  { id: 36, name: "Emperor's Favour", provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/cb283d3c-c94d-481d-8063-93afaff4d740.jpg', rtp: '96.60%', maxWin: 'x5000', isNew: false, isHot: false },
  { id: 37, name: 'Piggy Gold', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/b92cbcd4-bdde-4729-86b8-775b386a707c.jpg', rtp: '96.50%', maxWin: 'x3500', isNew: false, isHot: false },
  { id: 38, name: 'Win Win Won', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/0b386742-2b40-460a-8748-e63d6c2dbc3e.png', rtp: '96.40%', maxWin: 'x2000', isNew: false, isHot: false },
  { id: 39, name: 'Fortune Gods', provider: 'PG Soft', category: 'slots', thumbnail: 'https://www.pgsoft.com/uploads/Games/Images/cd510c21-008d-4227-a8d3-419728cfd2bb.png', rtp: '96.65%', maxWin: 'x6000', isNew: false, isHot: true },
];

// 프로바이더 목록
export const PROVIDERS = [
  { name: 'PG Soft', slug: 'pgsoft', gameCount: 39, color: '#E8593C' },
];

// 카테고리 목록
export const CATEGORIES = [
  { name: '전체', slug: 'all', icon: '\uD83C\uDFAE', count: 39 },
  { name: '인기', slug: 'hot', icon: '\uD83D\uDD25', count: 15 },
  { name: '신규', slug: 'new', icon: '\u2B50', count: 12 },
  { name: '슬롯', slug: 'slots', icon: '\uD83C\uDFB0', count: 39 },
  { name: '라이브', slug: 'live', icon: '\uD83C\uDFB2', count: 0 },
  { name: '테이블', slug: 'table', icon: '\u2660\uFE0F', count: 0 },
];
