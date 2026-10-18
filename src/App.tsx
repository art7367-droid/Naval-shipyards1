import { useState, useEffect, useRef } from 'react';
import ShipyardView from './ShipyardView';

// ============ TYPES ============
type ShipType = 'battleship' | 'aircraft_carrier' | 'cruiser' | 'destroyer' | 'submarine' | 'auxiliary';
type TreatyStatus = 'london' | 'withdrawn' | 'unrestricted';
type GamePhase = 'menu' | 'playing' | 'event' | 'gameover';

interface Ship {
  id: string;
  name: string;
  nameJp: string;
  type: ShipType;
  cost: number; // в млн ¥
  buildTime: number; // месяцев
  firepower: number;
  speed: number;
  armor: number;
  description: string;
  yearAvailable: number;
  program: string; // к какой программе относится
  icon: string;
  displacement?: number; // водоизмещение в тоннах
}

interface BuiltShip extends Ship {
  completionYear: number;
  completionMonth: number;
}

interface BuildingEntry {
  ship: Ship;
  completionYear: number;
  completionMonth: number;
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: { text: string; budgetChange: number; shipyardsChange?: number; treatyStatus?: TreatyStatus }[];
  year: number;
}

interface GameState {
  year: number;
  month: number;
  budget: number;
  shipyards: number;
  busyShipyards: number;
  builtShips: BuiltShip[];
  buildingShips: BuildingEntry[];
  currentEvent: GameEvent | null;
  gamePhase: GamePhase;
  score: number;
  treatyStatus: TreatyStatus;
  log: string[];
  isPaused: boolean;
  currentProgram: string;
}

// ============ РЕАЛЬНЫЕ КОРАБЛИ ПО ПРОГРАММАМ ============
const shipTemplates: Ship[] = [
  // === マル①計画 (Maru 1, 1931) ===
  {
    id: 'mogami', name: 'Могами', nameJp: '最上', type: 'cruiser',
    cost: 30, buildTime: 30, firepower: 45, speed: 35, armor: 30,
    description: 'Лёгкий крейсер (формально), позже перевооружён 203-мм. 15 орудий.',
    yearAvailable: 1931, program: 'マル①', icon: '🚢', displacement: 11213,
  },
  {
    id: 'mikuma', name: 'Микума', nameJp: '三隈', type: 'cruiser',
    cost: 30, buildTime: 30, firepower: 45, speed: 35, armor: 30,
    description: 'Крейсер типа «Могами». 15 × 155-мм орудий.',
    yearAvailable: 1931, program: 'マル①', icon: '🚢', displacement: 11213,
  },
  {
    id: 'hatsuharu', name: 'Хатсухару', nameJp: '初春', type: 'destroyer',
    cost: 10, buildTime: 18, firepower: 16, speed: 36, armor: 6,
    description: 'Эсминец 1-го класса. 3 × 127-мм, 6 ТА. 12 единиц по плану.',
    yearAvailable: 1931, program: 'マル①', icon: '🔹', displacement: 1400,
  },
  {
    id: 'shiratsuyu', name: 'Сирацую', nameJp: '白露', type: 'destroyer',
    cost: 11, buildTime: 18, firepower: 18, speed: 34, armor: 7,
    description: 'Улучшенный эсминец (переделка из «Хатсухару»). 4 × 127-мм.',
    yearAvailable: 1932, program: 'マル①', icon: '🔹', displacement: 1685,
  },
  {
    id: 'chidori', name: 'Тидори', nameJp: '千鳥', type: 'auxiliary',
    cost: 5, buildTime: 12, firepower: 10, speed: 30, armor: 4,
    description: 'Торпедный катер. 4 × 533-мм ТА. 4 единицы.',
    yearAvailable: 1931, program: 'マル①', icon: '⚡', displacement: 535,
  },
  {
    id: 'i6', name: 'I-6 (Junsen II)', nameJp: '巡潜II', type: 'submarine',
    cost: 15, buildTime: 24, firepower: 22, speed: 23, armor: 12,
    description: 'Крейсерская ПЛ. 2 × 140-мм, 6 ТА 533-мм.',
    yearAvailable: 1931, program: 'マル①', icon: '🔻', displacement: 2250,
  },
  {
    id: 'kaidai_vi', name: 'Кайдай VI (I-68)', nameJp: '海大VI', type: 'submarine',
    cost: 12, buildTime: 20, firepower: 18, speed: 21, armor: 10,
    description: 'Большая ПЛ. 6 единиц. 1 × 120-мм, 6 ТА.',
    yearAvailable: 1931, program: 'マル①', icon: '🔻', displacement: 1800,
  },
  {
    id: 'ro33', name: 'Ro-33 (Kaichu VI)', nameJp: '海中VI', type: 'submarine',
    cost: 8, buildTime: 16, firepower: 12, speed: 19, armor: 8,
    description: 'Средняя ПЛ. 2 единицы. 4 ТА 533-мм.',
    yearAvailable: 1931, program: 'マル①', icon: '🔻', displacement: 1060,
  },

  // === マル②計画 (Maru 2, 1934) ===
  {
    id: 'tone', name: 'Тоне', nameJp: '利根', type: 'cruiser',
    cost: 35, buildTime: 32, firepower: 42, speed: 35, armor: 32,
    description: 'Тяжёлый крейсер-разведчик. Все 8 × 203-мм в носу. 2 ед.',
    yearAvailable: 1934, program: 'マル②', icon: '🚢', displacement: 11213,
  },
  {
    id: 'soryu', name: 'Сорю', nameJp: '蒼龍', type: 'aircraft_carrier',
    cost: 60, buildTime: 36, firepower: 55, speed: 34, armor: 28,
    description: 'Авианосец. 63 самолёта. 2 ед. (2-й стал «Хирю»).',
    yearAvailable: 1934, program: 'マル②', icon: '🛩️', displacement: 15900,
  },
  {
    id: 'asashio', name: 'Асасио', nameJp: '朝潮', type: 'destroyer',
    cost: 12, buildTime: 18, firepower: 20, speed: 35, armor: 8,
    description: 'Эсминец. 6 × 127-мм, 8 ТА. 10 единиц.',
    yearAvailable: 1934, program: 'マル②', icon: '🔹', displacement: 2370,
  },
  {
    id: 'otori', name: 'Отори', nameJp: '鴻', type: 'auxiliary',
    cost: 6, buildTime: 14, firepower: 12, speed: 31, armor: 5,
    description: 'Торпедный катер. 3 × 120-мм, 6 ТА. 16 единиц.',
    yearAvailable: 1934, program: 'マル②', icon: '⚡', displacement: 860,
  },
  {
    id: 'junsen_iii', name: 'Junsen III (I-7)', nameJp: '巡潜III', type: 'submarine',
    cost: 16, buildTime: 24, firepower: 24, speed: 23, armor: 13,
    description: 'Крейсерская ПЛ. 1 × гидросамолёт, 6 ТА. 2 ед.',
    yearAvailable: 1934, program: 'マル②', icon: '🔻', displacement: 2400,
  },
  {
    id: 'chitose', name: 'Титосэ', nameJp: '千歳', type: 'auxiliary',
    cost: 25, buildTime: 28, firepower: 15, speed: 29, armor: 15,
    description: 'Тендер гидросамолётов (10000 т). Позже → авианосец. 2 ед.',
    yearAvailable: 1934, program: 'マル②', icon: '🛩️', displacement: 11200,
  },

  // === マル③計画 (Maru 3, 1937) ===
  {
    id: 'yamato', name: 'Ямато', nameJp: '大和', type: 'battleship',
    cost: 150, buildTime: 48, firepower: 100, speed: 27, armor: 100,
    description: 'Суперлинкор. 9 × 460-мм. 72 800 т. №1. Совершенно секретно!',
    yearAvailable: 1937, program: 'マル③', icon: '⚓', displacement: 72800,
  },
  {
    id: 'musashi', name: 'Мусаси', nameJp: '武蔵', type: 'battleship',
    cost: 150, buildTime: 48, firepower: 100, speed: 27, armor: 100,
    description: 'Суперлинкор. 9 × 460-мм. 72 800 т. №2. Строится в Нагасаки.',
    yearAvailable: 1937, program: 'マル③', icon: '⚓', displacement: 72800,
  },
  {
    id: 'shokaku', name: 'Сёкаку', nameJp: '翔鶴', type: 'aircraft_carrier',
    cost: 80, buildTime: 36, firepower: 75, speed: 34, armor: 40,
    description: 'Авианосец. 84 самолёта. №3. Лучший японский авианосец.',
    yearAvailable: 1937, program: 'マル③', icon: '🛩️', displacement: 25675,
  },
  {
    id: 'zuikaku', name: 'Дзуйкаку', nameJp: '瑞鶴', type: 'aircraft_carrier',
    cost: 80, buildTime: 36, firepower: 75, speed: 34, armor: 40,
    description: 'Авианосец. 84 самолёта. №4. Sister-ship «Сёкаку».',
    yearAvailable: 1937, program: 'マル③', icon: '🛩️', displacement: 25675,
  },
  {
    id: 'kagero', name: 'Кагэро', nameJp: '陽炎', type: 'destroyer',
    cost: 14, buildTime: 20, firepower: 22, speed: 35, armor: 9,
    description: 'Эсминец 1-го класса. 6 × 127-мм, 8 ТА. 18 ед. (15 реальных).',
    yearAvailable: 1937, program: 'マル③', icon: '🔹', displacement: 2529,
  },
  {
    id: 'i9', name: 'I-9 (Тип A)', nameJp: '巡潜甲', type: 'submarine',
    cost: 18, buildTime: 26, firepower: 26, speed: 23, armor: 14,
    description: 'Крейсерская ПЛ-лидер. 1 × 140-мм, 1 × гидросам., 8 ТА. 2 ед.',
    yearAvailable: 1937, program: 'マル③', icon: '🔻', displacement: 2600,
  },
  {
    id: 'i15', name: 'I-15 (Тип B)', nameJp: '巡潜乙', type: 'submarine',
    cost: 16, buildTime: 24, firepower: 24, speed: 24, armor: 13,
    description: 'Крейсерская ПЛ. 1 × 140-мм, 1 × гидросам., 6 ТА. 7 ед.',
    yearAvailable: 1937, program: 'マル③', icon: '🔻', displacement: 2600,
  },
  {
    id: 'i16', name: 'I-16 (Тип C)', nameJp: '巡潜丙', type: 'submarine',
    cost: 17, buildTime: 24, firepower: 28, speed: 23, armor: 13,
    description: 'ПЛ-торпедоносец. 2 × 140-мм, 6 ТА + 1 мини-суб. 5 ед.',
    yearAvailable: 1937, program: 'マル③', icon: '🔻', displacement: 2600,
  },
  {
    id: 'shimushu', name: 'Симусю', nameJp: '占守', type: 'auxiliary',
    cost: 8, buildTime: 16, firepower: 10, speed: 20, armor: 8,
    description: 'Эскортный корабль. 4 × 120-мм. 4 единицы.',
    yearAvailable: 1937, program: 'マル③', icon: '🛡️', displacement: 860,
  },

  // === マル④計画 (Maru 4, 1939) ===
  {
    id: 'shinano', name: 'Синано', nameJp: '信濃', type: 'battleship',
    cost: 150, buildTime: 48, firepower: 100, speed: 27, armor: 100,
    description: '3-й линкор «Ямато». №110. Позже переделан в авианосец.',
    yearAvailable: 1939, program: 'マル④', icon: '⚓', displacement: 72800,
  },
  {
    id: 'taiho', name: 'Тайхо', nameJp: '大鳳', type: 'aircraft_carrier',
    cost: 90, buildTime: 38, firepower: 70, speed: 33, armor: 55,
    description: 'Бронепалубный авианосец. 60 самолётов. №130.',
    yearAvailable: 1939, program: 'マル④', icon: '🛩️', displacement: 29300,
  },
  {
    id: 'agano', name: 'Агано', nameJp: '阿賀野', type: 'cruiser',
    cost: 30, buildTime: 26, firepower: 30, speed: 35, armor: 22,
    description: 'Лёгкий крейсер (лидер эсминцев). 6 × 152-мм, 8 ТА. 4 ед.',
    yearAvailable: 1939, program: 'マル④', icon: '🚢', displacement: 6850,
  },
  {
    id: 'oyodo', name: 'Оёдо', nameJp: '大淀', type: 'cruiser',
    cost: 35, buildTime: 28, firepower: 35, speed: 35, armor: 25,
    description: 'Крейсер-штаб. 6 × 155-мм в носу. 2 ед. (построен 1).',
    yearAvailable: 1939, program: 'マル④', icon: '🚢', displacement: 8160,
  },
  {
    id: 'yugumo', name: 'Югумо', nameJp: '夕雲', type: 'destroyer',
    cost: 15, buildTime: 20, firepower: 24, speed: 35, armor: 10,
    description: 'Улучшенный «Кагэро». 6 × 127-мм, 8 ТА. 15 ед.',
    yearAvailable: 1939, program: 'マル④', icon: '🔹', displacement: 2560,
  },
  {
    id: 'akizuki', name: 'Акидзуки', nameJp: '秋月', type: 'destroyer',
    cost: 18, buildTime: 22, firepower: 28, speed: 33, armor: 10,
    description: 'ПЛО-эсминец. 8 × 100-мм зенитных. 6 ед.',
    yearAvailable: 1939, program: 'マル④', icon: '🔹', displacement: 2700,
  },
  {
    id: 'shimakaze', name: 'Симакадзэ', nameJp: '島風', type: 'destroyer',
    cost: 20, buildTime: 24, firepower: 22, speed: 40, armor: 9,
    description: 'Экспериментальный суперэсминец. 39.4 узла! 15 ТА. 1 ед.',
    yearAvailable: 1939, program: 'マル④', icon: '🔹', displacement: 2567,
  },

  // === マル凛計画 (Maru Rin, 1940) ===
  {
    id: 'ro35', name: 'Ro-35 (Средняя)', nameJp: '中型潜', type: 'submarine',
    cost: 9, buildTime: 16, firepower: 14, speed: 19, armor: 8,
    description: 'Средняя ПЛ. 4 ТА. 9 ед.',
    yearAvailable: 1940, program: 'マル凛', icon: '🔻', displacement: 1100,
  },
  {
    id: 'ro100', name: 'Ro-100 (Средняя)', nameJp: '中型潜改', type: 'submarine',
    cost: 8, buildTime: 14, firepower: 12, speed: 19, armor: 7,
    description: 'Упрощённая средняя ПЛ. 4 ТА. 9 ед.',
    yearAvailable: 1940, program: 'マル凛', icon: '🔻', displacement: 990,
  },

  // === マル級計画 (Maru Kyū, 1941) ===
  {
    id: 'unryu', name: 'Унрю', nameJp: '雲龍', type: 'aircraft_carrier',
    cost: 65, buildTime: 28, firepower: 55, speed: 34, armor: 30,
    description: 'Авианосец (упрощённый). 65 самолётов. №302.',
    yearAvailable: 1941, program: 'マル級', icon: '🛩️', displacement: 17150,
  },
  {
    id: 'ibuki', name: 'Ибуки', nameJp: '伊吹', type: 'cruiser',
    cost: 40, buildTime: 30, firepower: 40, speed: 35, armor: 28,
    description: 'Тяжёлый крейсер. 10 × 203-мм. Позже → авианосец. 2 ед.',
    yearAvailable: 1941, program: 'マル級', icon: '🚢', displacement: 12500,
  },
  {
    id: 'etorofu', name: 'Эторофу', nameJp: '択捉', type: 'auxiliary',
    cost: 6, buildTime: 12, firepower: 8, speed: 20, armor: 6,
    description: 'Эскортный корабль. 4 × 120-мм. 30 единиц (упрощённые).',
    yearAvailable: 1941, program: 'マル級', icon: '🛡️', displacement: 870,
  },
  {
    id: 'i40', name: 'I-40 (Тип B мод.)', nameJp: '巡潜乙改', type: 'submarine',
    cost: 17, buildTime: 22, firepower: 25, speed: 24, armor: 13,
    description: 'Крейсерская ПЛ. Улучшенный Тип B. 6 ед.',
    yearAvailable: 1941, program: 'マル級', icon: '🔻', displacement: 2600,
  },
];

// ============ ИСТОРИЧЕСКИЕ СОБЫТИЯ ============
const historicalEvents: GameEvent[] = [
  {
    id: 'london_treaty',
    title: '📜 Лондонское морское соглашение (1930)',
    description: 'Подписан Лондонский договор. Япония получает квоту 6:10 от США по линкорам, но может строить крейсеры и подлодки до 7:10. Бюджет Мару-1: ¥247 млн.',
    year: 1930,
    choices: [
      { text: 'Принять договор — начать программу Мару-1 (+100 млн ¥)', budgetChange: 100, treatyStatus: 'london' },
      { text: 'Протестовать, но подписать (+50 млн ¥)', budgetChange: 50, treatyStatus: 'london' },
    ],
  },
  {
    id: 'tomozuru_incident',
    title: '⚠️ Инцидент с «Томодзуру» (1934)',
    description: 'Торпедный катер «Томодзуру» перевернулся в шторм! Выяснилось, что многие корабли перегружены вооружением. Нужна программа модернизации.',
    year: 1934,
    choices: [
      { text: 'Запустить Мару-2 — ¥432 млн на новые корабли (+150 млн ¥)', budgetChange: 150 },
      { text: 'Минимальная модернизация (+80 млн ¥)', budgetChange: 80 },
    ],
  },
  {
    id: 'treaty_withdrawal',
    title: '🚫 Выход из морских договоров (1934)',
    description: 'Япония выходит из Вашингтонского и Лондонского договоров. Начинается ничем не ограниченная гонка вооружений!',
    year: 1935,
    choices: [
      { text: 'Начать секретный проект «А» (линкоры 460-мм)', budgetChange: 100, treatyStatus: 'withdrawn' },
      { text: 'Сосредоточиться на авианосцах', budgetChange: 150, treatyStatus: 'withdrawn' },
    ],
  },
  {
    id: 'type93_torpedo',
    title: '🎯 Торпеда Тип 93 «Длинное копьё» (1936)',
    description: 'Секретная кислородная торпеда. Дальность 40 км, скорость 50 узлов — в 3 раза дальше американских!',
    year: 1936,
    choices: [
      { text: 'Оснастить все эсминцы (-20 млн ¥)', budgetChange: -20 },
      { text: 'Использовать выборочно', budgetChange: 0 },
    ],
  },
  {
    id: 'maru3_start',
    title: '🔱 Программа Мару-3 (1937)',
    description: 'Утверждена крупнейшая программа: ¥807 млн! Включает 2 линкора «Ямато», 2 авианосца «Сёкаку», 18 эсминцев «Кагэро», 14 подлодок.',
    year: 1937,
    choices: [
      { text: 'Полная реализация Мару-3 (+200 млн ¥)', budgetChange: 200 },
      { text: 'Приоритет авианосцам над линкорами (+150 млн ¥)', budgetChange: 150 },
    ],
  },
  {
    id: 'china_war',
    title: '🇨🇳 Вторая японо-китайская война (1937)',
    description: 'Инцидент на мосту Марко Поло. Флот поддерживает десантные операции. Нужны корабли для блокады побережья Китая.',
    year: 1938,
    choices: [
      { text: 'Экстренное финансирование (+200 млн ¥)', budgetChange: 200 },
      { text: 'Умеренная поддержка (+100 млн ¥)', budgetChange: 100 },
    ],
  },
  {
    id: 'maru4_start',
    title: '⚡ Программа Мару-4 (1939)',
    description: 'Новая программа: 80 кораблей на ¥1.6 млрд! 2 линкора «Ямато», авианосец «Тайхо», крейсеры «Агано», эсминцы «Югумо» и «Акидзуки».',
    year: 1939,
    choices: [
      { text: 'Полная реализация (+300 млн ¥, +1 верфь)', budgetChange: 300, shipyardsChange: 1 },
      { text: 'Ускоренное строительство (+200 млн ¥)', budgetChange: 200 },
    ],
  },
  {
    id: 'carrier_doctrine',
    title: '✈️ Кидё Бутай — Ударное соединение (1940)',
    description: 'Адмирал Ямамото создаёт 1-й воздушный флот. 6 авианосцев в одном соединении — революция в морской войне!',
    year: 1940,
    choices: [
      { text: 'Поддержать — приоритет авианосцам (+150 млн ¥)', budgetChange: 150 },
      { text: 'Сохранить баланс флота (+80 млн ¥)', budgetChange: 80 },
    ],
  },
  {
    id: 'marurin_marukyuu',
    title: '📋 Мару-Рин и Мару-Кю (1940-1941)',
    description: 'Временная и экстренная программы. Массовое строительство эскортов, подлодок и эсминцев. «Унрю», «Ибуки», 30 «Эторофу».',
    year: 1941,
    choices: [
      { text: 'Мобилизовать всё! (+300 млн ¥, +2 верфи)', budgetChange: 300, shipyardsChange: 2 },
      { text: 'Фокус на авианосцы и эсминцы (+200 млн ¥)', budgetChange: 200 },
    ],
  },
];

// ============ HELPERS ============
function getTypeName(type: ShipType): string {
  const names: Record<ShipType, string> = {
    battleship: 'Линкор',
    aircraft_carrier: 'Авианосец',
    cruiser: 'Крейсер',
    destroyer: 'Эсминец',
    submarine: 'Подлодка',
    auxiliary: 'Вспом.',
  };
  return names[type];
}

function getTypeIcon(type: ShipType): string {
  const icons: Record<ShipType, string> = {
    battleship: '⚓',
    aircraft_carrier: '🛩️',
    cruiser: '🚢',
    destroyer: '🔹',
    submarine: '🔻',
    auxiliary: '🛡️',
  };
  return icons[type];
}

function calculateScore(ships: BuiltShip[]): number {
  return ships.reduce((sum, s) => sum + s.firepower * 2 + s.speed + s.armor, 0);
}

const initialState: GameState = {
  year: 1930,
  month: 1,
  budget: 247, // начальный бюджет Мару-1
  shipyards: 4, // Курэ, Йокосука, Нагасаки, Сасебо
  busyShipyards: 0,
  builtShips: [],
  buildingShips: [],
  currentEvent: null,
  gamePhase: 'menu',
  score: 0,
  treatyStatus: 'london',
  log: [],
  isPaused: false,
  currentProgram: '—',
};

// ============ MAIN COMPONENT ============
function App() {
  const [state, setState] = useState<GameState>(initialState);
  const [selectedType, setSelectedType] = useState<ShipType | 'all'>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [showLog, setShowLog] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Game tick
  useEffect(() => {
    if (state.gamePhase !== 'playing' || state.isPaused) return;

    const timer = setInterval(() => {
      setState((prev) => {
        let newYear = prev.year;
        let newMonth = prev.month + 1;
        if (newMonth > 12) {
          newMonth = 1;
          newYear++;
        }

        // Check completed ships
        const completed: BuiltShip[] = [];
        const stillBuilding = prev.buildingShips.filter((b) => {
          const completedTime = b.completionYear * 12 + b.completionMonth;
          const currentTime = newYear * 12 + newMonth;
          if (currentTime >= completedTime) {
            completed.push({
              ...b.ship,
              completionYear: b.completionYear,
              completionMonth: b.completionMonth,
            });
            return false;
          }
          return true;
        });

        const newLog = [...prev.log];
        completed.forEach((s) => {
          newLog.push(`${newYear}/${String(newMonth).padStart(2, '0')}: ✅ Введён в строй — ${s.name} (${s.nameJp}) [${s.program}]`);
        });

        // Game over
        if (newYear > 1941 || (newYear === 1942 && newMonth === 1)) {
          const score = calculateScore([...prev.builtShips, ...completed]);
          return {
            ...prev, year: newYear, month: newMonth,
            builtShips: [...prev.builtShips, ...completed],
            buildingShips: [], busyShipyards: 0,
            gamePhase: 'gameover', score, log: newLog,
          };
        }

        // Annual budget
        let budgetChange = 0;
        if (newMonth === 1) {
          if (prev.treatyStatus === 'london') budgetChange = 40;
          else if (prev.treatyStatus === 'withdrawn') budgetChange = 80;
          else budgetChange = 60;
        }

        // Determine current program
        let currentProgram = '—';
        if (newYear >= 1931 && newYear < 1934) currentProgram = 'マル①';
        else if (newYear >= 1934 && newYear < 1937) currentProgram = 'マル②';
        else if (newYear >= 1937 && newYear < 1939) currentProgram = 'マル③';
        else if (newYear >= 1939 && newYear < 1940) currentProgram = 'マル④';
        else if (newYear >= 1940 && newYear < 1941) currentProgram = 'マル凛';
        else if (newYear >= 1941) currentProgram = 'マル級';

        // Check for events
        const event = historicalEvents.find((e) => e.year === newYear && newMonth === 1);

        if (event) {
          return {
            ...prev, year: newYear, month: newMonth,
            budget: prev.budget + budgetChange,
            builtShips: [...prev.builtShips, ...completed],
            buildingShips: stillBuilding, busyShipyards: stillBuilding.length,
            currentEvent: event, gamePhase: 'event',
            currentProgram, log: newLog,
          };
        }

        return {
          ...prev, year: newYear, month: newMonth,
          budget: prev.budget + budgetChange,
          builtShips: [...prev.builtShips, ...completed],
          buildingShips: stillBuilding, busyShipyards: stillBuilding.length,
          currentProgram, log: newLog,
        };
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [state.gamePhase, state.isPaused]);

  function startBuilding(ship: Ship) {
    setState((prev) => {
      if (prev.budget < ship.cost) return prev;
      if (prev.busyShipyards >= prev.shipyards) return prev;
      if (prev.year < ship.yearAvailable) return prev;

      const totalMonths = prev.month + ship.buildTime;
      const completionYear = prev.year + Math.floor((totalMonths - 1) / 12);
      const completionMonth = ((totalMonths - 1) % 12) + 1;

      return {
        ...prev,
        budget: prev.budget - ship.cost,
        busyShipyards: prev.busyShipyards + 1,
        buildingShips: [...prev.buildingShips, { ship, completionYear, completionMonth }],
        log: [...prev.log, `${prev.year}/${String(prev.month).padStart(2, '0')}: 🔨 Заложен — ${ship.name} (${ship.nameJp}) [${ship.program}]`],
      };
    });
  }

  function handleEventChoice(choice: GameEvent['choices'][0]) {
    setState((prev) => {
      const newState = { ...prev };
      newState.budget = prev.budget + choice.budgetChange;
      if (choice.shipyardsChange) newState.shipyards = prev.shipyards + choice.shipyardsChange;
      if (choice.treatyStatus) newState.treatyStatus = choice.treatyStatus;
      newState.currentEvent = null;
      newState.gamePhase = 'playing';
      newState.log = [...prev.log, `${prev.year}: 📋 ${prev.currentEvent?.title} → ${choice.text}`];
      return newState;
    });
  }

  function startGame() {
    setState({
      ...initialState,
      gamePhase: 'playing',
      log: ['1930/01: 🇯🇵 Начало реализации программы Мару-1 (第一次補充計画)'],
      currentProgram: 'マル①',
    });
  }

  function togglePause() {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }

  const currentScore = calculateScore(state.builtShips);
  const progressPercent = ((state.year - 1930) * 12 + state.month) / (12 * 12) * 100;

  // Get unique programs
  const programs = ['all', 'マル①', 'マル②', 'マル③', 'マル④', 'マル凛', 'マル級'];

  const availableShips = shipTemplates.filter((s) => {
    if (selectedType !== 'all' && s.type !== selectedType) return false;
    if (selectedProgram !== 'all' && s.program !== selectedProgram) return false;
    return true;
  });

  // ============ MENU SCREEN ============
  if (state.gamePhase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center">
          <div className="mb-8">
            <div className="text-7xl mb-4">⚓</div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'serif' }}>
              日本海軍造船計画
            </h1>
            <h2 className="text-2xl md:text-3xl text-amber-200 mb-2" style={{ fontFamily: 'serif' }}>
              Кораблестроительная программа Японии
            </h2>
            <p className="text-slate-400 text-lg">Основано на реальных программах Мару-1 — Мару-Кю (1930–1941)</p>
          </div>

          <div className="bg-slate-800/80 border border-amber-900/50 rounded-lg p-6 mb-6 text-left">
            <h3 className="text-amber-400 font-bold text-lg mb-3">📋 Историческая справка:</h3>
            <p className="text-slate-300 mb-4">
              Императорский флот Японии реализовал серию кораблестроительных программ (丸計画 / Мару кэйкаку):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-700/50 p-2 rounded">
                <span className="text-amber-400 font-bold">マル① (1931)</span> — ¥247 млн<br/>
                <span className="text-slate-400">4 «Могами», 12 «Хатсухару», 13 ПЛ</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded">
                <span className="text-amber-400 font-bold">マル② (1934)</span> — ¥432 млн<br/>
                <span className="text-slate-400">2 «Тоне», 2 «Сорю», 14 эсминцев</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded">
                <span className="text-amber-400 font-bold">マル③ (1937)</span> — ¥807 млн<br/>
                <span className="text-slate-400">2 «Ямато», 2 «Сёкаку», 18 «Кагэро»</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded">
                <span className="text-amber-400 font-bold">マル④ (1939)</span> — ¥1.6 млрд<br/>
                <span className="text-slate-400">«Синано», «Тайхо», «Агано», «Югумо»</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded">
                <span className="text-amber-400 font-bold">マル凛 (1940)</span><br/>
                <span className="text-slate-400">18 средних ПЛ, охотники</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded">
                <span className="text-amber-400 font-bold">マル級 (1941)</span><br/>
                <span className="text-slate-400">«Унрю», «Ибуки», 30 «Эторофу»</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-red-900/50 rounded-lg p-4 mb-8 text-left">
            <h3 className="text-red-400 font-bold text-lg mb-2">⚔️ Задание:</h3>
            <p className="text-slate-300">
              Вы — руководитель Морского министерства. За 11 лет постройте сильнейший флот к декабрю 1941.
              Управляйте бюджетом, верфями, реагируйте на исторические события.
            </p>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50 cursor-pointer"
          >
            🏯 Начать программу Мару-1
          </button>
        </div>
      </div>
    );
  }

  // ============ GAME OVER SCREEN ============
  if (state.gamePhase === 'gameover') {
    const battleships = state.builtShips.filter(s => s.type === 'battleship').length;
    const carriers = state.builtShips.filter(s => s.type === 'aircraft_carrier').length;
    const cruisers = state.builtShips.filter(s => s.type === 'cruiser').length;
    const destroyers = state.builtShips.filter(s => s.type === 'destroyer').length;
    const subs = state.builtShips.filter(s => s.type === 'submarine').length;
    const totalFirepower = state.builtShips.reduce((s, sh) => s + sh.firepower, 0);
    const totalDisplacement = state.builtShips.reduce((s, sh) => s + (sh.displacement || 0), 0);

    let rank = 'D';
    let rankColor = 'text-slate-400';
    let rankDesc = 'Флот слишком слаб';
    if (currentScore > 1000) { rank = 'S'; rankColor = 'text-amber-400'; rankDesc = 'Величайший флот в истории!'; }
    else if (currentScore > 750) { rank = 'A'; rankColor = 'text-green-400'; rankDesc = 'Превосходный флот'; }
    else if (currentScore > 500) { rank = 'B'; rankColor = 'text-blue-400'; rankDesc = 'Сильный флот'; }
    else if (currentScore > 300) { rank = 'C'; rankColor = 'text-yellow-400'; rankDesc = 'Умеренный флот'; }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">🏴</div>
          <h1 className="text-4xl font-bold text-red-400 mb-2">7 декабря 1941</h1>
          <h2 className="text-2xl text-amber-300 mb-6">Итоги кораблестроительных программ</h2>

          <div className="bg-slate-800/80 border border-amber-900/50 rounded-lg p-6 mb-6">
            <div className={`text-6xl font-bold mb-1 ${rankColor}`}>Ранг: {rank}</div>
            <div className="text-lg text-slate-400 mb-2">{rankDesc}</div>
            <div className="text-2xl text-slate-300 mb-4">Очки: {currentScore}</div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-left">
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-amber-400 font-bold text-sm">Всего кораблей</div>
                <div className="text-2xl text-white">{state.builtShips.length}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-amber-400 font-bold text-sm">Огневая мощь</div>
                <div className="text-2xl text-white">{totalFirepower}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-amber-400 font-bold text-sm">Водоизмещение</div>
                <div className="text-2xl text-white">{(totalDisplacement / 1000).toFixed(0)}к т</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-red-400 font-bold text-sm">⚓ Линкоры</div>
                <div className="text-2xl text-white">{battleships}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-blue-400 font-bold text-sm">🛩️ Авианосцы</div>
                <div className="text-2xl text-white">{carriers}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-green-400 font-bold text-sm">🚢 Крейсеры</div>
                <div className="text-2xl text-white">{cruisers}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-yellow-400 font-bold text-sm">🔹 Эсминцы</div>
                <div className="text-2xl text-white">{destroyers}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-purple-400 font-bold text-sm">🔻 Подлодки</div>
                <div className="text-2xl text-white">{subs}</div>
              </div>
            </div>
          </div>

          {carriers >= 6 && (
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-3">
              <p className="text-blue-300 text-sm">✈️ Кидё Бутай готов! 6+ авианосцев — ударная мощь Тихого океана!</p>
            </div>
          )}
          {battleships >= 2 && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 mb-3">
              <p className="text-red-300 text-sm">⚓ Линкоры «Ямато» и «Мусаси» — сильнейшие корабли мира!</p>
            </div>
          )}
          {destroyers >= 20 && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 mb-3">
              <p className="text-yellow-300 text-sm">🔹 Мощный экран из эсминцев с торпедами «Длинное копьё»!</p>
            </div>
          )}

          <button
            onClick={() => setState({ ...initialState, gamePhase: 'menu' })}
            className="bg-gradient-to-r from-amber-800 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 cursor-pointer"
          >
            🔄 Начать заново
          </button>
        </div>
      </div>
    );
  }

  // ============ EVENT SCREEN ============
  if (state.gamePhase === 'event' && state.currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="bg-slate-800/90 border-2 border-amber-700/70 rounded-xl p-8 shadow-2xl">
            <div className="text-sm text-amber-600 mb-2">{state.year} год</div>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">{state.currentEvent.title}</h2>
            <p className="text-slate-300 mb-6 text-lg leading-relaxed">{state.currentEvent.description}</p>
            <div className="space-y-3">
              {state.currentEvent.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEventChoice(choice)}
                  className="w-full bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600 hover:border-amber-600 text-slate-200 py-3 px-4 rounded-lg text-left transition-all cursor-pointer"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN GAME SCREEN ============
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top bar */}
      <div className="bg-slate-900/90 border-b border-amber-900/50 px-4 py-3 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-amber-400 font-bold">🇯🇵</span>
            <span className="bg-slate-700 px-2 py-1 rounded text-amber-300 font-mono text-sm">
              📅 {state.year}/{String(state.month).padStart(2, '0')}
            </span>
            <span className="bg-slate-700 px-2 py-1 rounded text-green-400 font-mono text-sm">
              💰 {state.budget} млн¥
            </span>
            <span className="bg-slate-700 px-2 py-1 rounded text-blue-400 font-mono text-sm">
              🏗️ {state.shipyards - state.busyShipyards}/{state.shipyards}
            </span>
            <span className="bg-amber-900/50 px-2 py-1 rounded text-amber-300 text-sm font-bold">
              {state.currentProgram}
            </span>
            <button
              onClick={togglePause}
              className={`px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                state.isPaused ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-yellow-700 hover:bg-yellow-600 text-white'
              }`}
            >
              {state.isPaused ? '▶' : '⏸'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-sm">⭐ {currentScore}</span>
            <button onClick={() => setShowLog(!showLog)} className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs cursor-pointer">
              📜
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>1930</span>
            <span className="text-amber-400">Прогресс ({Math.round(progressPercent)}%)</span>
            <span>1942</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 to-red-600 transition-all duration-500"
              style={{ width: `${Math.min(100, progressPercent)}%` }} />
          </div>
        </div>

        {/* Shipyard visualization with construction animation */}
        <div className="mb-4">
          <ShipyardView
            buildingShips={state.buildingShips}
            currentYear={state.year}
            currentMonth={state.month}
            shipyards={state.shipyards}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Ship catalog */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h2 className="text-lg font-bold text-amber-400 mb-3">🚢 Корабли для строительства</h2>

              {/* Type filter */}
              <div className="flex flex-wrap gap-1 mb-2">
                {([
                  { key: 'all', label: 'Все' },
                  { key: 'battleship', label: '⚓Линк' },
                  { key: 'aircraft_carrier', label: '🛩️АВ' },
                  { key: 'cruiser', label: '🚢Кр' },
                  { key: 'destroyer', label: '🔹ЭС' },
                  { key: 'submarine', label: '🔻ПЛ' },
                  { key: 'auxiliary', label: '🛡️Всп' },
                ] as const).map((tab) => (
                  <button key={tab.key} onClick={() => setSelectedType(tab.key)}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                      selectedType === tab.key ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}>{tab.label}</button>
                ))}
              </div>

              {/* Program filter */}
              <div className="flex flex-wrap gap-1 mb-3">
                {programs.map((prog) => (
                  <button key={prog} onClick={() => setSelectedProgram(prog)}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                      selectedProgram === prog ? 'bg-red-800 text-white' : 'bg-slate-700/60 text-slate-400 hover:bg-slate-600'
                    }`}>{prog === 'all' ? 'Все программы' : prog}</button>
                ))}
              </div>

              {/* Ship list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                {availableShips.map((ship) => {
                  const canBuild = state.budget >= ship.cost && state.busyShipyards < state.shipyards && state.year >= ship.yearAvailable;
                  const locked = state.year < ship.yearAvailable;

                  return (
                    <div key={ship.id}
                      className={`border rounded-lg p-2.5 transition-all ${
                        locked ? 'bg-slate-800/40 border-slate-700 opacity-50'
                          : canBuild ? 'bg-slate-700/60 border-slate-600 hover:border-amber-600'
                            : 'bg-slate-800/40 border-slate-700'
                      }`}>
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="mr-1">{ship.icon}</span>
                          <span className="font-bold text-white text-sm">{ship.name}</span>
                          <span className="text-amber-600 text-xs ml-1">{ship.nameJp}</span>
                        </div>
                        <div className="text-right">
                          {locked && <span className="text-xs text-red-400">🔒{ship.yearAvailable}</span>}
                          {!locked && <span className="text-xs text-slate-500">{ship.program}</span>}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-1.5">{ship.description}</p>
                      <div className="flex flex-wrap gap-1 text-xs mb-1.5">
                        <span className="bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">⚔️{ship.firepower}</span>
                        <span className="bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded">💨{ship.speed}уз</span>
                        <span className="bg-green-900/40 text-green-300 px-1.5 py-0.5 rounded">🛡️{ship.armor}</span>
                        {ship.displacement && (
                          <span className="bg-slate-600/40 text-slate-300 px-1.5 py-0.5 rounded">{(ship.displacement / 1000).toFixed(1)}к т</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-400">💰{ship.cost} | ⏱️{ship.buildTime}мес</span>
                        {!locked && (
                          <button onClick={() => startBuilding(ship)} disabled={!canBuild}
                            className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                              canBuild ? 'bg-amber-700 hover:bg-amber-600 text-white cursor-pointer' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}>🔨 Заложить</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-3">
            {/* Building queue */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h3 className="text-sm font-bold text-amber-400 mb-2">🔨 На стапелях ({state.buildingShips.length})</h3>
              {state.buildingShips.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Пусто</p>
              ) : (
                <div className="space-y-1.5">
                  {state.buildingShips.map((b, idx) => {
                    const totalMonths = b.ship.buildTime;
                    const startTotal = (b.completionYear * 12 + b.completionMonth) - totalMonths;
                    const currentTotal = state.year * 12 + state.month;
                    const progress = Math.min(100, Math.max(0, ((currentTotal - startTotal) / totalMonths) * 100));
                    return (
                      <div key={idx} className="bg-slate-700/50 rounded p-1.5">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs text-white">{b.ship.icon} {b.ship.name}</span>
                          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-600 to-green-500 transition-all duration-500"
                            style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fleet overview */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h3 className="text-sm font-bold text-amber-400 mb-2">⚓ Флот ({state.builtShips.length})</h3>
              {state.builtShips.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Пусто</p>
              ) : (
                <div className="space-y-0.5">
                  {(['battleship', 'aircraft_carrier', 'cruiser', 'destroyer', 'submarine', 'auxiliary'] as ShipType[]).map((type) => {
                    const count = state.builtShips.filter(s => s.type === type).length;
                    if (count === 0) return null;
                    return (
                      <div key={type} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">{getTypeIcon(type)} {getTypeName(type)}</span>
                        <span className="text-amber-400 font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Treaty status */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h3 className="text-sm font-bold text-amber-400 mb-2">📜 Договоры</h3>
              <div className={`text-xs p-1.5 rounded ${
                state.treatyStatus === 'london' ? 'bg-blue-900/30 text-blue-300' :
                  state.treatyStatus === 'withdrawn' ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'
              }`}>
                {state.treatyStatus === 'london' && '📋 Лондонское соглашение'}
                {state.treatyStatus === 'withdrawn' && '🚫 Договоры разорваны'}
                {state.treatyStatus === 'unrestricted' && '⚡ Без ограничений'}
              </div>
            </div>

            {/* Current program info */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h3 className="text-sm font-bold text-amber-400 mb-2">📋 Текущая программа</h3>
              <div className="text-xs text-slate-300">
                {state.currentProgram === 'マル①' && 'Мару-1: Крейсеры «Могами», эсминцы «Хатсухару», ПЛ'}
                {state.currentProgram === 'マル②' && 'Мару-2: «Тоне», «Сорю», «Асасио»'}
                {state.currentProgram === 'マル③' && 'Мару-3: «Ямато», «Сёкаку», «Кагэро»'}
                {state.currentProgram === 'マル④' && 'Мару-4: «Тайхо», «Агано», «Югумо», «Акидзуки»'}
                {state.currentProgram === 'マル凛' && 'Мару-Рин: Средние ПЛ, охотники'}
                {state.currentProgram === 'マル級' && 'Мару-Кю: «Унрю», «Ибуки», «Эторофу»'}
                {state.currentProgram === '—' && 'Ожидание...'}
              </div>
            </div>
          </div>
        </div>

        {/* Log panel */}
        {showLog && (
          <div className="mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-amber-400">📜 Журнал</h3>
              <button onClick={() => setShowLog(false)} className="text-slate-400 hover:text-white cursor-pointer text-sm">✕</button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {state.log.slice().reverse().map((entry, idx) => (
                <div key={idx} className="text-xs text-slate-400 border-b border-slate-700/30 pb-0.5">{entry}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
