import { useState, useEffect } from 'react';
import { historicalLaydowns } from './historicalData';
import YokosukaShipyardMap from './YokosukaShipyardMap';
import KureShipyardMap from './KureShipyardMap';
import YokosukaCrossSection from './YokosukaCrossSection';

// ============ ТИПЫ ============
type ShipType = 'battleship' | 'aircraft_carrier' | 'cruiser' | 'destroyer' | 'submarine' | 'auxiliary';
type YardType = 'naval' | 'civilian';
type TreatyStatus = 'london' | 'withdrawn' | 'unrestricted';
type GamePhase = 'menu' | 'playing' | 'event' | 'gameover' | 'historical';

interface Ship {
  id: string;
  name: string;
  nameJp: string;
  type: ShipType;
  cost: number;
  buildTime: number;
  firepower: number;
  speed: number;
  armor: number;
  description: string;
  yearAvailable: number;
  program: string;
  icon: string;
  displacement?: number;
  length: number; // длина корабля в метрах
  historicalYard?: string; // на какой верфи строился в реальности
}

interface Slipway {
  id: string;
  length: number;
  label: string;
  note: string;
  expanded?: boolean; // был ли расширен
}

interface Shipyard {
  id: string;
  name: string;
  nameJp: string;
  type: YardType;
  slipways: Slipway[];
  available: boolean;
  availableFrom: number; // год, с которого доступна
  speedBonus: number; // множитель скорости постройки (1.0 = норма)
  historicalNote: string;
}

interface BuiltShip extends Ship {
  completionYear: number;
  completionMonth: number;
  builtAt: string; // ID верфи
  builtOnSlipway: string; // ID стапеля
}

interface BuildingEntry {
  ship: Ship;
  completionYear: number;
  completionMonth: number;
  builtAt: string;
  builtOnSlipway: string;
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: { text: string; budgetChange: number; shipyardsChange?: number; treatyStatus?: TreatyStatus; unlockYard?: string; expandSlipway?: { yardId: string; slipwayIdx: number; newLength: number } }[];
  year: number;
}

interface GameState {
  year: number;
  month: number;
  budget: number;
  shipyards: Shipyard[];
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

// ============ РЕАЛЬНЫЕ ВЕРФИ ============
const initialShipyards: Shipyard[] = [
  {
    id: 'kure', name: 'Курэ', nameJp: '呉海軍工廠', type: 'naval',
    available: true, availableFrom: 1930, speedBonus: 1.0,
    historicalNote: 'Главная верфь ВМФ. Здесь построен «Ямато».',
    slipways: [
      { id: 'kure-1', length: 300, label: 'Большой стапель', note: 'Линкоры (до 266м)' },
      { id: 'kure-2', length: 225, label: 'Стапель №2', note: 'Авианосцы, крейсеры' },
      { id: 'kure-3', length: 175, label: 'Стапель №3', note: 'Крейсеры, эсминцы' },
      { id: 'kure-4', length: 150, label: 'Стапель №4', note: 'Эсминцы, ПЛ' },
      { id: 'kure-5', length: 150, label: 'Стапель №5', note: 'Эсминцы, ПЛ' },
    ],
  },
  {
    id: 'yokosuka', name: 'Йокосука', nameJp: '横須賀海軍工廠', type: 'naval',
    available: true, availableFrom: 1930, speedBonus: 1.0,
    historicalNote: 'Здесь построены «Сёкаку», «Синано». Док №6 — крупнейший в Японии.',
    slipways: [
      { id: 'yoko-1', length: 300, label: 'Большой стапель', note: 'Линкоры' },
      { id: 'yoko-2', length: 200, label: 'Стапель №2', note: 'Авианосцы, крейсеры' },
      { id: 'yoko-3', length: 175, label: 'Стапель №3', note: 'Крейсеры' },
      { id: 'yoko-4', length: 175, label: 'Стапель №4', note: 'Крейсеры' },
      { id: 'yoko-5', length: 150, label: 'Стапель №5', note: 'Эсминцы' },
      { id: 'yoko-6', length: 150, label: 'Стапель №6', note: 'Эсминцы' },
    ],
  },
  {
    id: 'sasebo', name: 'Сасебо', nameJp: '佐世保海軍工廠', type: 'naval',
    available: true, availableFrom: 1930, speedBonus: 0.95,
    historicalNote: 'Здесь строились «Агано», «Оёдо». Стапель удлинён для ремонта «Ямато».',
    slipways: [
      { id: 'sasebo-1', length: 200, label: 'Стапель №1', note: 'Авианосцы, крейсеры' },
      { id: 'sasebo-2', length: 175, label: 'Стапель №2', note: 'Крейсеры' },
      { id: 'sasebo-3', length: 150, label: 'Стапель №3', note: 'Эсминцы' },
      { id: 'sasebo-4', length: 150, label: 'Стапель №4', note: 'Эсминцы' },
      { id: 'sasebo-5', length: 150, label: 'Стапель №5', note: 'Эсминцы' },
    ],
  },
  {
    id: 'maizuru', name: 'Майдзуру', nameJp: '舞鶴海軍工廠', type: 'naval',
    available: true, availableFrom: 1930, speedBonus: 0.9,
    historicalNote: 'Малая верфь. Только эсминцы и подлодки.',
    slipways: [
      { id: 'maizuru-1', length: 150, label: 'Стапель №1', note: 'Эсминцы' },
      { id: 'maizuru-2', length: 125, label: 'Стапель №2', note: 'Эсминцы' },
      { id: 'maizuru-3', length: 125, label: 'Стапель №3', note: 'Эсминцы' },
      { id: 'maizuru-4', length: 125, label: 'Стапель №4', note: 'Эсминцы' },
      { id: 'maizuru-5', length: 125, label: 'Стапель №5', note: 'Эсминцы' },
    ],
  },
  // Гражданские верфи — открываются позже
  {
    id: 'nagasaki', name: 'Мицубиси Нагасаки', nameJp: '三菱長崎造船所', type: 'civilian',
    available: false, availableFrom: 1934, speedBonus: 1.05,
    historicalNote: 'Здесь построен «Мусаси». Стапель удлинён до 295м специально для него.',
    slipways: [
      { id: 'naga-1', length: 275, label: 'Большой стапель', note: 'Линкоры (удлинён до 295м)' },
      { id: 'naga-2', length: 225, label: 'Стапель №2', note: 'Авианосцы' },
      { id: 'naga-3', length: 150, label: 'Стапель №3', note: 'Крейсеры' },
      { id: 'naga-4', length: 150, label: 'Стапель №4', note: 'Крейсеры' },
      { id: 'naga-5', length: 125, label: 'Стапель №5', note: 'Эсминцы' },
      { id: 'naga-6', length: 125, label: 'Стапель №6', note: 'Эсминцы' },
    ],
  },
  {
    id: 'kawasaki', name: 'Кавасаки Кобе', nameJp: '川崎神戸造船所', type: 'civilian',
    available: false, availableFrom: 1934, speedBonus: 1.05,
    historicalNote: 'Здесь построены «Дзуйкаку», «Тайхо», «Хию».',
    slipways: [
      { id: 'kawa-1', length: 250, label: 'Большой стапель', note: 'Авианосцы (до 242м)' },
      { id: 'kawa-2', length: 150, label: 'Стапель №2', note: 'Эсминцы' },
      { id: 'kawa-3', length: 150, label: 'Стапель №3', note: 'Эсминцы' },
      { id: 'kawa-4', length: 100, label: 'Стапель №4', note: 'Подлодки' },
      { id: 'kawa-5', length: 100, label: 'Стапель №5', note: 'Подлодки' },
    ],
  },
  {
    id: 'uraga', name: 'Урага', nameJp: '浦賀船渠', type: 'civilian',
    available: false, availableFrom: 1936, speedBonus: 0.95,
    historicalNote: 'Здесь построен «Рюдзё». Малые эсминцы и подлодки.',
    slipways: [
      { id: 'uraga-1', length: 150, label: 'Стапель №1', note: 'Эсминцы' },
      { id: 'uraga-2', length: 125, label: 'Стапель №2', note: 'Эсминцы' },
      { id: 'uraga-3', length: 125, label: 'Стапель №3', note: 'Эсминцы' },
      { id: 'uraga-4', length: 100, label: 'Стапель №4', note: 'Подлодки' },
    ],
  },
  {
    id: 'fujinagata', name: 'Фудзинагата', nameJp: '藤永田造船所', type: 'civilian',
    available: false, availableFrom: 1937, speedBonus: 0.9,
    historicalNote: 'Малая верфь в Осаке. Только эсминцы.',
    slipways: [
      { id: 'fuji-1', length: 125, label: 'Стапель №1', note: 'Эсминцы' },
      { id: 'fuji-2', length: 125, label: 'Стапель №2', note: 'Эсминцы' },
      { id: 'fuji-3', length: 125, label: 'Стапель №3', note: 'Эсминцы' },
    ],
  },
];

// ============ КОРАБЛИ (с реальной длиной) ============
const shipTemplates: Ship[] = [
  // Мару-1 (1931)
  { id: 'mogami', name: 'Могами', nameJp: '最上', type: 'cruiser', cost: 30, buildTime: 30, firepower: 45, speed: 35, armor: 30, description: 'Лёгкий крейсер. 15×155-мм. Позже перевооружён 203-мм.', yearAvailable: 1931, program: 'マル①', icon: '🚢', displacement: 11213, length: 201, historicalYard: 'kure' },
  { id: 'mikuma', name: 'Микума', nameJp: '三隈', type: 'cruiser', cost: 30, buildTime: 30, firepower: 45, speed: 35, armor: 30, description: 'Крейсер типа «Могами». 15×155-мм.', yearAvailable: 1931, program: 'マル①', icon: '🚢', displacement: 11213, length: 201, historicalYard: 'nagasaki' },
  { id: 'hatsuharu', name: 'Хатсухару', nameJp: '初春', type: 'destroyer', cost: 10, buildTime: 18, firepower: 16, speed: 36, armor: 6, description: 'Эсминец. 3×127-мм, 6 ТА. 12 ед.', yearAvailable: 1931, program: 'マル①', icon: '🔹', displacement: 1400, length: 103, historicalYard: 'sasebo' },
  { id: 'shiratsuyu', name: 'Сирацую', nameJp: '白露', type: 'destroyer', cost: 11, buildTime: 18, firepower: 18, speed: 34, armor: 7, description: 'Улучшенный эсминец. 4×127-мм.', yearAvailable: 1932, program: 'マル①', icon: '🔹', displacement: 1685, length: 107, historicalYard: 'sasebo' },
  { id: 'chidori', name: 'Тидори', nameJp: '千鳥', type: 'auxiliary', cost: 5, buildTime: 12, firepower: 10, speed: 30, armor: 4, description: 'Торпедный катер. 4 ТА. 4 ед.', yearAvailable: 1931, program: 'マル①', icon: '⚡', displacement: 535, length: 80, historicalYard: 'uraga' },
  { id: 'i6', name: 'I-6 (Junsen II)', nameJp: '巡潜II', type: 'submarine', cost: 15, buildTime: 24, firepower: 22, speed: 23, armor: 12, description: 'Крейсерская ПЛ. 2×140-мм, 6 ТА.', yearAvailable: 1931, program: 'マル①', icon: '🔻', displacement: 2250, length: 105, historicalYard: 'kawasaki' },
  { id: 'kaidai_vi', name: 'Кайдай VI', nameJp: '海大VI', type: 'submarine', cost: 12, buildTime: 20, firepower: 18, speed: 21, armor: 10, description: 'Большая ПЛ. 6 ед. 1×120-мм, 6 ТА.', yearAvailable: 1931, program: 'マル①', icon: '🔻', displacement: 1800, length: 100, historicalYard: 'kawasaki' },
  { id: 'ro33', name: 'Ro-33', nameJp: '海中VI', type: 'submarine', cost: 8, buildTime: 16, firepower: 12, speed: 19, armor: 8, description: 'Средняя ПЛ. 2 ед. 4 ТА.', yearAvailable: 1931, program: 'マル①', icon: '🔻', displacement: 1060, length: 80, historicalYard: 'kawasaki' },

  // Мару-2 (1934)
  { id: 'tone', name: 'Тоне', nameJp: '利根', type: 'cruiser', cost: 35, buildTime: 32, firepower: 42, speed: 35, armor: 32, description: 'Тяжёлый крейсер-разведчик. 8×203-мм в носу.', yearAvailable: 1934, program: 'マル②', icon: '🚢', displacement: 11213, length: 201, historicalYard: 'nagasaki' },
  { id: 'chikuma', name: 'Тикума', nameJp: '筑摩', type: 'cruiser', cost: 35, buildTime: 34, firepower: 42, speed: 35, armor: 32, description: 'Второй крейсер типа «Тоне». 8×203-мм в носу.', yearAvailable: 1935, program: 'マル②', icon: '🚢', displacement: 11213, length: 201, historicalYard: 'nagasaki' },
  { id: 'soryu', name: 'Сорю', nameJp: '蒼龍', type: 'aircraft_carrier', cost: 60, buildTime: 36, firepower: 55, speed: 34, armor: 28, description: 'Авианосец. 63 самолёта.', yearAvailable: 1934, program: 'マル②', icon: '🛩️', displacement: 15900, length: 228, historicalYard: 'kure' },
  { id: 'hiryu', name: 'Хирю', nameJp: '飛龍', type: 'aircraft_carrier', cost: 65, buildTime: 38, firepower: 58, speed: 34, armor: 30, description: 'Авианосец. 73 самолёта. Модификация «Сорю».', yearAvailable: 1936, program: 'マル②', icon: '🛩️', displacement: 17300, length: 227, historicalYard: 'yokosuka' },
  { id: 'asashio', name: 'Асасио', nameJp: '朝潮', type: 'destroyer', cost: 12, buildTime: 18, firepower: 20, speed: 35, armor: 8, description: 'Эсминец. 6×127-мм, 8 ТА. 10 ед.', yearAvailable: 1934, program: 'マル②', icon: '🔹', displacement: 2370, length: 118, historicalYard: 'sasebo' },
  { id: 'otori', name: 'Отори', nameJp: '鴻', type: 'auxiliary', cost: 6, buildTime: 14, firepower: 12, speed: 31, armor: 5, description: 'Торпедный катер. 16 ед.', yearAvailable: 1934, program: 'マル②', icon: '⚡', displacement: 860, length: 83, historicalYard: 'uraga' },
  { id: 'junsen_iii', name: 'Junsen III (I-7)', nameJp: '巡潜III', type: 'submarine', cost: 16, buildTime: 24, firepower: 24, speed: 23, armor: 13, description: 'Крейсерская ПЛ. 2 ед. 6 ТА.', yearAvailable: 1934, program: 'マル②', icon: '🔻', displacement: 2400, length: 109, historicalYard: 'kawasaki' },
  { id: 'chitose', name: 'Титосэ', nameJp: '千歳', type: 'auxiliary', cost: 25, buildTime: 28, firepower: 15, speed: 29, armor: 15, description: 'Тендер гидросамолётов. 2 ед.', yearAvailable: 1934, program: 'マル②', icon: '🛩️', displacement: 11200, length: 192, historicalYard: 'yokosuka' },

  // Мару-3 (1937)
  { id: 'yamato', name: 'Ямато', nameJp: '大和', type: 'battleship', cost: 150, buildTime: 48, firepower: 100, speed: 27, armor: 100, description: 'Суперлинкор. 9×460-мм. 72 800 т. СОВЕРШЕННО СЕКРЕТНО!', yearAvailable: 1937, program: 'マル③', icon: '⚓', displacement: 72800, length: 266, historicalYard: 'kure' },
  { id: 'musashi', name: 'Мусаси', nameJp: '武蔵', type: 'battleship', cost: 150, buildTime: 48, firepower: 100, speed: 27, armor: 100, description: 'Суперлинкор. 9×460-мм. 72 800 т. Строится в Нагасаки.', yearAvailable: 1937, program: 'マル③', icon: '⚓', displacement: 72800, length: 266, historicalYard: 'nagasaki' },
  { id: 'shokaku', name: 'Сёкаку', nameJp: '翔鶴', type: 'aircraft_carrier', cost: 80, buildTime: 36, firepower: 75, speed: 34, armor: 40, description: 'Авианосец. 84 самолёта. Лучший японский АВ.', yearAvailable: 1937, program: 'マル③', icon: '🛩️', displacement: 25675, length: 242, historicalYard: 'yokosuka' },
  { id: 'zuikaku', name: 'Дзуйкаку', nameJp: '瑞鶴', type: 'aircraft_carrier', cost: 80, buildTime: 36, firepower: 75, speed: 34, armor: 40, description: 'Авианосец. 84 самолёта. Sister-ship «Сёкаку».', yearAvailable: 1937, program: 'マル③', icon: '🛩️', displacement: 25675, length: 242, historicalYard: 'kawasaki' },
  { id: 'kagero', name: 'Кагэро', nameJp: '陽炎', type: 'destroyer', cost: 14, buildTime: 20, firepower: 22, speed: 35, armor: 9, description: 'Эсминец 1-го класса. 6×127-мм, 8 ТА. 18 ед.', yearAvailable: 1937, program: 'マル③', icon: '🔹', displacement: 2529, length: 118.5, historicalYard: 'maizuru' },
  { id: 'i9', name: 'I-9 (Тип A)', nameJp: '巡潜甲', type: 'submarine', cost: 18, buildTime: 26, firepower: 26, speed: 23, armor: 14, description: 'ПЛ-лидер. 1×140-мм, 1×гидросам., 8 ТА. 2 ед.', yearAvailable: 1937, program: 'マル③', icon: '🔻', displacement: 2600, length: 109, historicalYard: 'kawasaki' },
  { id: 'i15', name: 'I-15 (Тип B)', nameJp: '巡潜乙', type: 'submarine', cost: 16, buildTime: 24, firepower: 24, speed: 24, armor: 13, description: 'Крейсерская ПЛ. 7 ед. 6 ТА.', yearAvailable: 1937, program: 'マル③', icon: '🔻', displacement: 2600, length: 109, historicalYard: 'kawasaki' },
  { id: 'i16', name: 'I-16 (Тип C)', nameJp: '巡潜丙', type: 'submarine', cost: 17, buildTime: 24, firepower: 28, speed: 23, armor: 13, description: 'ПЛ-торпедоносец. 5 ед.', yearAvailable: 1937, program: 'マル③', icon: '🔻', displacement: 2600, length: 109, historicalYard: 'kawasaki' },
  { id: 'shimushu', name: 'Симусю', nameJp: '占守', type: 'auxiliary', cost: 8, buildTime: 16, firepower: 10, speed: 20, armor: 8, description: 'Эскортный корабль. 4 ед.', yearAvailable: 1937, program: 'マル③', icon: '🛡️', displacement: 860, length: 81, historicalYard: 'sasebo' },

  // Мару-4 (1939)
  { id: 'shinano', name: 'Синано', nameJp: '信濃', type: 'battleship', cost: 150, buildTime: 48, firepower: 100, speed: 27, armor: 100, description: '3-й линкор «Ямато». Позже → авианосец.', yearAvailable: 1939, program: 'マル④', icon: '⚓', displacement: 72800, length: 266, historicalYard: 'yokosuka' },
  { id: 'taiho', name: 'Тайхо', nameJp: '大鳳', type: 'aircraft_carrier', cost: 90, buildTime: 38, firepower: 70, speed: 33, armor: 55, description: 'Бронепалубный авианосец. 60 самолётов.', yearAvailable: 1939, program: 'マル④', icon: '🛩️', displacement: 29300, length: 262, historicalYard: 'kawasaki' },
  { id: 'agano', name: 'Агано', nameJp: '阿賀野', type: 'cruiser', cost: 30, buildTime: 26, firepower: 30, speed: 35, armor: 22, description: 'Лёгкий крейсер-лидер. 6×152-мм, 8 ТА. 4 ед.', yearAvailable: 1939, program: 'マル④', icon: '🚢', displacement: 6850, length: 174, historicalYard: 'sasebo' },
  { id: 'oyodo', name: 'Оёдо', nameJp: '大淀', type: 'cruiser', cost: 35, buildTime: 28, firepower: 35, speed: 35, armor: 25, description: 'Крейсер-штаб. 6×155-мм в носу.', yearAvailable: 1939, program: 'マル④', icon: '🚢', displacement: 8160, length: 192, historicalYard: 'kure' },
  { id: 'yugumo', name: 'Югумо', nameJp: '夕雲', type: 'destroyer', cost: 15, buildTime: 20, firepower: 24, speed: 35, armor: 10, description: 'Улучшенный «Кагэро». 15 ед.', yearAvailable: 1939, program: 'マル④', icon: '🔹', displacement: 2560, length: 119, historicalYard: 'maizuru' },
  { id: 'akizuki', name: 'Акидзуки', nameJp: '秋月', type: 'destroyer', cost: 18, buildTime: 22, firepower: 28, speed: 33, armor: 10, description: 'ПЛО-эсминец. 8×100-мм зенитных. 6 ед.', yearAvailable: 1939, program: 'マル④', icon: '🔹', displacement: 2700, length: 134, historicalYard: 'maizuru' },
  { id: 'shimakaze', name: 'Симакадзэ', nameJp: '島風', type: 'destroyer', cost: 20, buildTime: 24, firepower: 22, speed: 40, armor: 9, description: 'Суперэсминец. 39.4 узла! 1 ед.', yearAvailable: 1939, program: 'マル④', icon: '🔹', displacement: 2567, length: 130, historicalYard: 'kawasaki' },

  // Мару-Рин (1940)
  { id: 'ro35', name: 'Ro-35', nameJp: '中型潜', type: 'submarine', cost: 9, buildTime: 16, firepower: 14, speed: 19, armor: 8, description: 'Средняя ПЛ. 4 ТА. 9 ед.', yearAvailable: 1940, program: 'マル凛', icon: '🔻', displacement: 1100, length: 80, historicalYard: 'kawasaki' },
  { id: 'ro100', name: 'Ro-100', nameJp: '中型潜改', type: 'submarine', cost: 8, buildTime: 14, firepower: 12, speed: 19, armor: 7, description: 'Упрощённая ПЛ. 4 ТА. 9 ед.', yearAvailable: 1940, program: 'マル凛', icon: '🔻', displacement: 990, length: 76, historicalYard: 'kawasaki' },

  // Мару-Кю (1941)
  { id: 'unryu', name: 'Унрю', nameJp: '雲龍', type: 'aircraft_carrier', cost: 65, buildTime: 28, firepower: 55, speed: 34, armor: 30, description: 'Авианосец (упрощённый). 65 самолётов.', yearAvailable: 1941, program: 'マル級', icon: '🛩️', displacement: 17150, length: 227, historicalYard: 'yokosuka' },
  { id: 'ibuki', name: 'Ибуки', nameJp: '伊吹', type: 'cruiser', cost: 40, buildTime: 30, firepower: 40, speed: 35, armor: 28, description: 'Тяжёлый крейсер. 10×203-мм. 2 ед.', yearAvailable: 1941, program: 'マル級', icon: '🚢', displacement: 12500, length: 201, historicalYard: 'kawasaki' },
  { id: 'etorofu', name: 'Эторофу', nameJp: '択捉', type: 'auxiliary', cost: 6, buildTime: 12, firepower: 8, speed: 20, armor: 6, description: 'Эскортный корабль. 30 ед.', yearAvailable: 1941, program: 'マル級', icon: '🛡️', displacement: 870, length: 87, historicalYard: 'sasebo' },
  { id: 'i40', name: 'I-40 (Тип B мод.)', nameJp: '巡潜乙改', type: 'submarine', cost: 17, buildTime: 22, firepower: 25, speed: 24, armor: 13, description: 'Улучшенный Тип B. 6 ед.', yearAvailable: 1941, program: 'マル級', icon: '🔻', displacement: 2600, length: 109, historicalYard: 'kawasaki' },
];

// ============ ИСТОРИЧЕСКИЕ СОБЫТИЯ ============
const historicalEvents: GameEvent[] = [
  {
    id: 'london_treaty', title: '📜 Лондонское соглашение (1930)',
    description: 'Подписан Лондонский договор. Квота 6:10 от США. Бюджет Мару-1: ¥247 млн. Доступны 4 военно-морских арсенала.',
    year: 1930,
    choices: [
      { text: 'Принять договор (+100 млн ¥)', budgetChange: 100, treatyStatus: 'london' },
      { text: 'Протестовать, но подписать (+50 млн ¥)', budgetChange: 50, treatyStatus: 'london' },
    ],
  },
  {
    id: 'civilian_yards', title: '🏭 Мобилизация гражданских верфей (1934)',
    description: 'Верфи Mitsubishi (Нагасаки) и Kawasaki (Кобе) готовы строить военные корабли. Это удвоит возможности флота!',
    year: 1934,
    choices: [
      { text: 'Мобилизовать обе верфи (Нагасаки + Кавасаки)', budgetChange: 50, unlockYard: 'nagasaki' },
      { text: 'Только Нагасаки (для крупных кораблей)', budgetChange: 30, unlockYard: 'nagasaki' },
    ],
  },
  {
    id: 'treaty_withdrawal', title: '🚫 Выход из договоров (1935)',
    description: 'Япония выходит из морских договоров. Начинается гонка вооружений! Можно расширять стапели.',
    year: 1935,
    choices: [
      { text: 'Удлинить стапель в Нагасаки до 295м (для «Мусаси») (-60 млн ¥)', budgetChange: -60, treatyStatus: 'withdrawn', expandSlipway: { yardId: 'nagasaki', slipwayIdx: 0, newLength: 295 } },
      { text: 'Расширить верфи (+150 млн ¥, открыть Урага)', budgetChange: 150, treatyStatus: 'withdrawn', unlockYard: 'uraga' },
    ],
  },
  {
    id: 'type93_torpedo', title: '🎯 Торпеда Тип 93 (1936)',
    description: 'Секретная кислородная торпеда. Дальность 40 км, скорость 50 узлов!',
    year: 1936,
    choices: [
      { text: 'Инвестировать в производство (-20 млн ¥)', budgetChange: -20 },
      { text: 'Использовать как есть', budgetChange: 0 },
    ],
  },
  {
    id: 'maru3_start', title: '🔱 Программа Мару-3 (1937)',
    description: '¥807 млн! 2 линкора «Ямато», 2 авианосца «Сёкаку», 18 эсминцев. Открывается верфь «Фудзинагата».',
    year: 1937,
    choices: [
      { text: 'Полная реализация (+200 млн ¥)', budgetChange: 200, unlockYard: 'fujinagata' },
      { text: 'Приоритет авианосцам (+150 млн ¥)', budgetChange: 150, unlockYard: 'fujinagata' },
    ],
  },
  {
    id: 'china_war', title: '🇨🇳 Японо-китайская война (1938)',
    description: 'Нужны корабли для блокады побережья Китая.',
    year: 1938,
    choices: [
      { text: 'Экстренное финансирование (+200 млн ¥)', budgetChange: 200 },
      { text: 'Умеренная поддержка (+100 млн ¥)', budgetChange: 100 },
    ],
  },
  {
    id: 'maru4_start', title: '⚡ Программа Мару-4 (1939)',
    description: '80 кораблей на ¥1.6 млрд! «Тайхо», «Агано», «Югумо», «Акидзуки», «Симакадзэ».',
    year: 1939,
    choices: [
      { text: 'Полная реализация (+300 млн ¥)', budgetChange: 300 },
      { text: 'Ускоренное строительство (+200 млн ¥)', budgetChange: 200 },
    ],
  },
  {
    id: 'carrier_doctrine', title: '✈️ Кидё Бутай (1940)',
    description: 'Ямамото создаёт 1-й воздушный флот. 6 авианосцев в одном соединении!',
    year: 1940,
    choices: [
      { text: 'Приоритет авианосцам (+150 млн ¥)', budgetChange: 150 },
      { text: 'Сохранить баланс (+80 млн ¥)', budgetChange: 80 },
    ],
  },
  {
    id: 'marurin_marukyuu', title: '📋 Мару-Рин и Мару-Кю (1941)',
    description: 'Массовое строительство. «Унрю», «Ибуки», 30 «Эторофу».',
    year: 1941,
    choices: [
      { text: 'Мобилизовать всё! (+300 млн ¥)', budgetChange: 300 },
      { text: 'Фокус на авианосцы (+200 млн ¥)', budgetChange: 200 },
    ],
  },
];

// ============ HELPERS ============
function getTypeName(type: ShipType): string {
  const names: Record<ShipType, string> = { battleship: 'Линкор', aircraft_carrier: 'Авианосец', cruiser: 'Крейсер', destroyer: 'Эсминец', submarine: 'Подлодка', auxiliary: 'Вспом.' };
  return names[type];
}

function getTypeIcon(type: ShipType): string {
  const icons: Record<ShipType, string> = { battleship: '⚓', aircraft_carrier: '🛩️', cruiser: '🚢', destroyer: '🔹', submarine: '🔻', auxiliary: '🛡️' };
  return icons[type];
}

function calculateScore(ships: BuiltShip[]): number {
  return ships.reduce((sum, s) => sum + s.firepower * 2 + s.speed + s.armor, 0);
}

// Найти свободный стапель на подходящей верфи для корабля
function findAvailableSlipway(ship: Ship, shipyards: Shipyard[], buildingShips: BuildingEntry[]): { yard: Shipyard; slipway: Slipway } | null {
  // Занятые стапели
  const occupiedSlipways = new Set(buildingShips.map(b => b.builtOnSlipway));

  // Приоритет: историческая верфь, затем по скорости
  const availableYards = shipyards
    .filter(y => y.available && y.availableFrom <= 1930) // базовая проверка
    .sort((a, b) => {
      // Сначала историческая верфь
      if (a.id === ship.historicalYard) return -1;
      if (b.id === ship.historicalYard) return 1;
      // Затем по speed bonus
      return b.speedBonus - a.speedBonus;
    });

  for (const yard of availableYards) {
    for (const slipway of yard.slipways) {
      if (slipway.length >= ship.length && !occupiedSlipways.has(slipway.id)) {
        return { yard, slipway };
      }
    }
  }
  return null;
}

// Общее число свободных стапелей
function countFreeSlipways(shipyards: Shipyard[], buildingShips: BuildingEntry[], year: number): number {
  const occupiedSlipways = new Set(buildingShips.map(b => b.builtOnSlipway));
  let count = 0;
  for (const yard of shipyards) {
    if (!yard.available || yard.availableFrom > year) continue;
    for (const slipway of yard.slipways) {
      if (!occupiedSlipways.has(slipway.id)) count++;
    }
  }
  return count;
}

// Может ли корабль быть построен на какой-либо верфи
function canBuildAnywhere(ship: Ship, shipyards: Shipyard[], buildingShips: BuildingEntry[], year: number): boolean {
  const occupiedSlipways = new Set(buildingShips.map(b => b.builtOnSlipway));
  for (const yard of shipyards) {
    if (!yard.available || yard.availableFrom > year) continue;
    for (const slipway of yard.slipways) {
      if (slipway.length >= ship.length && !occupiedSlipways.has(slipway.id)) {
        return true;
      }
    }
  }
  return false;
}

const initialState: GameState = {
  year: 1930, month: 1, budget: 247,
  shipyards: JSON.parse(JSON.stringify(initialShipyards)),
  builtShips: [], buildingShips: [],
  currentEvent: null, gamePhase: 'menu',
  score: 0, treatyStatus: 'london', log: [],
  isPaused: false, currentProgram: '—',
};

// ============ MAIN COMPONENT ============
function App() {
  const [state, setState] = useState<GameState>(initialState);
  const [selectedType, setSelectedType] = useState<ShipType | 'all'>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [showLog, setShowLog] = useState(false);
  const [showYardInfo, setShowYardInfo] = useState(false);
  const [showYardMap, setShowYardMap] = useState<'yokosuka' | 'kure' | null>(null);
  const [showCrossSection, setShowCrossSection] = useState(false);

  // Game tick
  useEffect(() => {
    if (state.gamePhase !== 'playing' || state.isPaused) return;
    const timer = setInterval(() => {
      setState((prev) => {
        let newYear = prev.year;
        let newMonth = prev.month + 1;
        if (newMonth > 12) { newMonth = 1; newYear++; }

        // Unlock yards by year
        const updatedYards = prev.shipyards.map(y => ({
          ...y,
          available: y.available || (y.availableFrom <= newYear),
        }));

        // Check completed ships
        const completed: BuiltShip[] = [];
        const stillBuilding = prev.buildingShips.filter((b) => {
          const completedTime = b.completionYear * 12 + b.completionMonth;
          const currentTime = newYear * 12 + newMonth;
          if (currentTime >= completedTime) {
            completed.push({ ...b.ship, completionYear: b.completionYear, completionMonth: b.completionMonth, builtAt: b.builtAt, builtOnSlipway: b.builtOnSlipway });
            return false;
          }
          return true;
        });

        const newLog = [...prev.log];
        completed.forEach((s) => {
          const yardName = updatedYards.find(y => y.id === s.builtAt)?.name || '?';
          newLog.push(`${newYear}/${String(newMonth).padStart(2, '0')}: ✅ Введён в строй — ${s.name} (${yardName})`);
        });

        if (newYear > 1941 || (newYear === 1942 && newMonth === 1)) {
          const score = calculateScore([...prev.builtShips, ...completed]);
          return { ...prev, year: newYear, month: newMonth, shipyards: updatedYards, builtShips: [...prev.builtShips, ...completed], buildingShips: [], gamePhase: 'gameover', score, log: newLog };
        }

        let budgetChange = 0;
        if (newMonth === 1) {
          if (prev.treatyStatus === 'london') budgetChange = 40;
          else if (prev.treatyStatus === 'withdrawn') budgetChange = 80;
          else budgetChange = 60;
        }

        let currentProgram = '—';
        if (newYear >= 1931 && newYear < 1934) currentProgram = 'マル①';
        else if (newYear >= 1934 && newYear < 1937) currentProgram = 'マル②';
        else if (newYear >= 1937 && newYear < 1939) currentProgram = 'マル③';
        else if (newYear >= 1939 && newYear < 1940) currentProgram = 'マル④';
        else if (newYear >= 1940 && newYear < 1941) currentProgram = 'マル凛';
        else if (newYear >= 1941) currentProgram = 'マル級';

        const event = historicalEvents.find((e) => e.year === newYear && newMonth === 1);
        if (event) {
          return { ...prev, year: newYear, month: newMonth, shipyards: updatedYards, budget: prev.budget + budgetChange, builtShips: [...prev.builtShips, ...completed], buildingShips: stillBuilding, currentEvent: event, gamePhase: 'event', currentProgram, log: newLog };
        }

        return { ...prev, year: newYear, month: newMonth, shipyards: updatedYards, budget: prev.budget + budgetChange, builtShips: [...prev.builtShips, ...completed], buildingShips: stillBuilding, currentProgram, log: newLog };
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [state.gamePhase, state.isPaused]);

  // Historical mode tick
  useEffect(() => {
    if (state.gamePhase !== 'historical' || state.isPaused) return;
    const timer = setInterval(() => {
      setState((prev) => {
        let newYear = prev.year;
        let newMonth = prev.month + 1;
        if (newMonth > 12) { newMonth = 1; newYear++; }

        // Unlock yards by year
        const updatedYards = prev.shipyards.map(y => ({
          ...y,
          available: y.available || (y.availableFrom <= newYear),
        }));

        // Check completed ships
        const completed: BuiltShip[] = [];
        const stillBuilding = prev.buildingShips.filter((b) => {
          const completedTime = b.completionYear * 12 + b.completionMonth;
          const currentTime = newYear * 12 + newMonth;
          if (currentTime >= completedTime) {
            completed.push({ ...b.ship, completionYear: b.completionYear, completionMonth: b.completionMonth, builtAt: b.builtAt, builtOnSlipway: b.builtOnSlipway });
            return false;
          }
          return true;
        });

        const newLog = [...prev.log];
        completed.forEach((s) => {
          const yardName = updatedYards.find(y => y.id === s.builtAt)?.name || '?';
          newLog.push(`${newYear}/${String(newMonth).padStart(2, '0')}: ✅ Введён в строй — ${s.name} (${yardName})`);
        });

        // Historical laydowns — auto-build ships at their historical dates
        const newBuilding = [...stillBuilding];
        const occupiedSlipways = new Set(newBuilding.map(b => b.builtOnSlipway));
        
        historicalLaydowns.forEach(laydown => {
          if (laydown.laidDownYear === newYear && laydown.laidDownMonth === newMonth) {
            const ship = shipTemplates.find(s => s.id === laydown.shipId);
            if (!ship) return;
            
            const yard = updatedYards.find(y => y.id === laydown.yardId);
            if (!yard || !yard.available) return;
            
            const slipway = yard.slipways[laydown.slipwayIdx];
            if (!slipway || occupiedSlipways.has(slipway.id)) return;
            
            // Check if already building or built
            if (newBuilding.some(b => b.ship.id === ship.id)) return;
            if (prev.builtShips.some(b => b.id === ship.id)) return;
            
            const totalMonths = newMonth + ship.buildTime;
            const completionYear = newYear + Math.floor((totalMonths - 1) / 12);
            const completionMonth = ((totalMonths - 1) % 12) + 1;
            
            newBuilding.push({
              ship,
              completionYear,
              completionMonth,
              builtAt: yard.id,
              builtOnSlipway: slipway.id,
            });
            occupiedSlipways.add(slipway.id);
            
            newLog.push(`${newYear}/${String(newMonth).padStart(2, '0')}: 🔨 [ИСТОРИЯ] Заложен — ${ship.name} на верфи «${yard.name}» (${slipway.length}м стапель) ${laydown.note || ''}`);
          }
        });

        if (newYear > 1944 || (newYear === 1945 && newMonth === 1)) {
          const score = calculateScore([...prev.builtShips, ...completed]);
          return { ...prev, year: newYear, month: newMonth, shipyards: updatedYards, builtShips: [...prev.builtShips, ...completed], buildingShips: newBuilding, gamePhase: 'gameover', score, log: newLog };
        }

        let currentProgram = '—';
        if (newYear >= 1931 && newYear < 1934) currentProgram = 'マル①';
        else if (newYear >= 1934 && newYear < 1937) currentProgram = 'マル②';
        else if (newYear >= 1937 && newYear < 1939) currentProgram = 'マル③';
        else if (newYear >= 1939 && newYear < 1940) currentProgram = 'マル④';
        else if (newYear >= 1940 && newYear < 1941) currentProgram = 'マル凛';
        else if (newYear >= 1941) currentProgram = 'マル級';

        return { ...prev, year: newYear, month: newMonth, shipyards: updatedYards, builtShips: [...prev.builtShips, ...completed], buildingShips: newBuilding, currentProgram, log: newLog };
      });
    }, 1000); // Faster for historical mode
    return () => clearInterval(timer);
  }, [state.gamePhase, state.isPaused]);

  function startBuilding(ship: Ship) {
    setState((prev) => {
      if (prev.budget < ship.cost) return prev;
      if (prev.year < ship.yearAvailable) return prev;

      const assignment = findAvailableSlipway(ship, prev.shipyards, prev.buildingShips);
      if (!assignment) return prev;

      // Speed bonus affects build time
      const actualBuildTime = Math.round(ship.buildTime / assignment.yard.speedBonus);
      const totalMonths = prev.month + actualBuildTime;
      const completionYear = prev.year + Math.floor((totalMonths - 1) / 12);
      const completionMonth = ((totalMonths - 1) % 12) + 1;

      return {
        ...prev,
        budget: prev.budget - ship.cost,
        buildingShips: [...prev.buildingShips, { ship, completionYear, completionMonth, builtAt: assignment.yard.id, builtOnSlipway: assignment.slipway.id }],
        log: [...prev.log, `${prev.year}/${String(prev.month).padStart(2, '0')}: 🔨 Заложен — ${ship.name} на верфи «${assignment.yard.name}» (${assignment.slipway.length}м стапель)`],
      };
    });
  }

  function handleEventChoice(choice: GameEvent['choices'][0]) {
    setState((prev) => {
      const newState = { ...prev };
      newState.budget = prev.budget + choice.budgetChange;
      if (choice.treatyStatus) newState.treatyStatus = choice.treatyStatus;
      if (choice.unlockYard) {
        newState.shipyards = prev.shipyards.map(y => y.id === choice.unlockYard ? { ...y, available: true } : y);
      }
      if (choice.expandSlipway) {
        newState.shipyards = prev.shipyards.map(y => {
          if (y.id !== choice.expandSlipway!.yardId) return y;
          const newSlipways = [...y.slipways];
          newSlipways[choice.expandSlipway!.slipwayIdx] = { ...newSlipways[choice.expandSlipway!.slipwayIdx], length: choice.expandSlipway!.newLength, expanded: true };
          return { ...y, slipways: newSlipways };
        });
      }
      newState.currentEvent = null;
      newState.gamePhase = 'playing';
      newState.log = [...prev.log, `${prev.year}: 📋 ${prev.currentEvent?.title} → ${choice.text}`];
      return newState;
    });
  }

  function startGame() {
    setState({ ...initialState, shipyards: JSON.parse(JSON.stringify(initialShipyards)), gamePhase: 'playing', log: ['1930/01: 🇯🇵 Начало программы Мару-1. Доступны: Курэ, Йокосука, Сасебо, Майдзуру.'], currentProgram: 'マル①' });
  }

  function startHistorical() {
    setState({ ...initialState, shipyards: JSON.parse(JSON.stringify(initialShipyards)), gamePhase: 'historical', log: ['1930/01: 📜 Исторический режим. Автоматическая симуляция реального строительства флота 1930-1941.'], currentProgram: 'Мару-1' });
  }

  function togglePause() { setState(prev => ({ ...prev, isPaused: !prev.isPaused })); }

  const currentScore = calculateScore(state.builtShips);
  const progressPercent = ((state.year - 1930) * 12 + state.month) / (12 * 12) * 100;
  const programs = ['all', 'マル①', 'マル②', 'マル③', 'マル④', 'マル凛', 'マル級'];
  const freeSlipways = countFreeSlipways(state.shipyards, state.buildingShips, state.year);
  const totalSlipways = state.shipyards.filter(y => y.available && y.availableFrom <= state.year).reduce((s, y) => s + y.slipways.length, 0);

  const availableShips = shipTemplates.filter((s) => {
    if (selectedType !== 'all' && s.type !== selectedType) return false;
    if (selectedProgram !== 'all' && s.program !== selectedProgram) return false;
    return true;
  });

  // ============ MENU ============
  if (state.gamePhase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center">
          <div className="mb-6">
            <div className="text-7xl mb-4">⚓</div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'serif' }}>日本海軍造船計画</h1>
            <h2 className="text-2xl text-amber-200 mb-2" style={{ fontFamily: 'serif' }}>Кораблестроительная программа Японии</h2>
            <p className="text-slate-400">Реальная система верфей и стапелей • 1930–1941</p>
          </div>

          <div className="bg-slate-800/80 border border-amber-900/50 rounded-lg p-5 mb-4 text-left">
            <h3 className="text-amber-400 font-bold mb-3">🏗️ Система верфей (реальные данные):</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {initialShipyards.filter(y => y.type === 'naval').map(yard => (
                <div key={yard.id} className="bg-slate-700/50 p-2 rounded border border-blue-900/30">
                  <div className="font-bold text-blue-300">⚓ {yard.name} <span className="text-amber-600">{yard.nameJp}</span></div>
                  <div className="text-slate-400 mt-1">
                    {yard.slipways.length} стапелей • макс. {Math.max(...yard.slipways.map(s => s.length))}м
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{yard.historicalNote}</div>
                </div>
              ))}
              {initialShipyards.filter(y => y.type === 'civilian').map(yard => (
                <div key={yard.id} className="bg-slate-700/50 p-2 rounded border border-green-900/30 opacity-70">
                  <div className="font-bold text-green-300">🏭 {yard.name} <span className="text-amber-600">{yard.nameJp}</span></div>
                  <div className="text-slate-400 mt-1">
                    {yard.slipways.length} стапелей • макс. {Math.max(...yard.slipways.map(s => s.length))}м
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Откр. в {yard.availableFrom} • {yard.historicalNote}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-amber-900/50 rounded-lg p-4 mb-6 text-left text-sm">
            <h3 className="text-amber-400 font-bold mb-2">📏 Длина кораблей vs стапели:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs text-slate-400">
              <div>⚓ Линкор: <span className="text-red-400">266м</span> → стапель 300м</div>
              <div>🛩️ Авианосец: <span className="text-blue-400">242м</span> → стапель 250м+</div>
              <div>🚢 Крейсер: <span className="text-green-400">201м</span> → стапель 200м+</div>
              <div>🔹 Эсминец: <span className="text-yellow-400">118м</span> → стапель 125м+</div>
              <div>🔻 Подлодка: <span className="text-purple-400">109м</span> → стапель 125м+</div>
              <div>🛡️ Вспом.: <span className="text-slate-400">80-87м</span> → стапель 100м+</div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-blue-900/50 rounded-lg p-4 mb-4 text-left">
            <h3 className="text-blue-400 font-bold text-lg mb-2">📜 Исторический режим:</h3>
            <p className="text-slate-300 text-sm">
              Автоматическая симуляция реального строительства японского флота 1930-1945.
              Корабли закладываются в точные исторические даты на реальные верфи и стапели.
              Наблюдайте, как создавался флот, который пошёл на Пёрл-Харбор!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={startGame} className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50 cursor-pointer">
              🏯 Играть (свободный режим)
            </button>
            <button onClick={startHistorical} className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50 cursor-pointer">
              📜 Исторический режим
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ GAME OVER ============
  if (state.gamePhase === 'gameover') {
    const battleships = state.builtShips.filter(s => s.type === 'battleship').length;
    const carriers = state.builtShips.filter(s => s.type === 'aircraft_carrier').length;
    const cruisers = state.builtShips.filter(s => s.type === 'cruiser').length;
    const destroyers = state.builtShips.filter(s => s.type === 'destroyer').length;
    const subs = state.builtShips.filter(s => s.type === 'submarine').length;

    let rank = 'D', rankColor = 'text-slate-400', rankDesc = 'Флот слишком слаб';
    if (currentScore > 1000) { rank = 'S'; rankColor = 'text-amber-400'; rankDesc = 'Величайший флот в истории!'; }
    else if (currentScore > 750) { rank = 'A'; rankColor = 'text-green-400'; rankDesc = 'Превосходный флот'; }
    else if (currentScore > 500) { rank = 'B'; rankColor = 'text-blue-400'; rankDesc = 'Сильный флот'; }
    else if (currentScore > 300) { rank = 'C'; rankColor = 'text-yellow-400'; rankDesc = 'Умеренный флот'; }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">🏴</div>
          <h1 className="text-4xl font-bold text-red-400 mb-2">7 декабря 1941</h1>
          <h2 className="text-xl text-amber-300 mb-4">Итоги кораблестроительных программ</h2>
          <div className="bg-slate-800/80 border border-amber-900/50 rounded-lg p-5 mb-4">
            <div className={`text-6xl font-bold mb-1 ${rankColor}`}>Ранг: {rank}</div>
            <div className="text-sm text-slate-400 mb-3">{rankDesc}</div>
            <div className="text-xl text-slate-300 mb-3">Очки: {currentScore}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-left text-sm">
              <div className="bg-slate-700/50 p-2 rounded"><div className="text-amber-400 font-bold text-xs">Всего</div><div className="text-xl">{state.builtShips.length}</div></div>
              <div className="bg-slate-700/50 p-2 rounded"><div className="text-red-400 font-bold text-xs">⚓ Линкоры</div><div className="text-xl">{battleships}</div></div>
              <div className="bg-slate-700/50 p-2 rounded"><div className="text-blue-400 font-bold text-xs">🛩️ Авианосцы</div><div className="text-xl">{carriers}</div></div>
              <div className="bg-slate-700/50 p-2 rounded"><div className="text-green-400 font-bold text-xs">🚢 Крейсеры</div><div className="text-xl">{cruisers}</div></div>
              <div className="bg-slate-700/50 p-2 rounded"><div className="text-yellow-400 font-bold text-xs">🔹 Эсминцы</div><div className="text-xl">{destroyers}</div></div>
              <div className="bg-slate-700/50 p-2 rounded"><div className="text-purple-400 font-bold text-xs">🔻 Подлодки</div><div className="text-xl">{subs}</div></div>
            </div>
          </div>
          {carriers >= 6 && <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-2 mb-2 text-blue-300 text-sm">✈️ Кидё Бутай — 6+ авианосцев!</div>}
          {battleships >= 2 && <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-2 mb-2 text-red-300 text-sm">⚓ «Ямато» и «Мусаси» — сильнейшие корабли мира!</div>}
          <button onClick={() => setState({ ...initialState, gamePhase: 'menu' })} className="bg-gradient-to-r from-amber-800 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-bold py-3 px-8 rounded-lg text-lg cursor-pointer">🔄 Начать заново</button>
        </div>
      </div>
    );
  }

  // ============ EVENT ============
  if (state.gamePhase === 'event' && state.currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="bg-slate-800/90 border-2 border-amber-700/70 rounded-xl p-6 shadow-2xl">
            <div className="text-xs text-amber-600 mb-1">{state.year} год</div>
            <h2 className="text-xl font-bold text-amber-400 mb-3">{state.currentEvent.title}</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">{state.currentEvent.description}</p>
            <div className="space-y-2">
              {state.currentEvent.choices.map((choice, idx) => (
                <button key={idx} onClick={() => handleEventChoice(choice)} className="w-full bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600 hover:border-amber-600 text-slate-200 py-2.5 px-3 rounded-lg text-left text-sm transition-all cursor-pointer">
                  {choice.text}
                  {choice.unlockYard && <span className="text-green-400 text-xs ml-2">🏭 Новая верфь!</span>}
                  {choice.expandSlipway && <span className="text-blue-400 text-xs ml-2">📏 Расширение стапеля!</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN GAME ============
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Historical mode banner */}
      {state.gamePhase === 'historical' && (
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b-2 border-amber-500 px-4 py-2 text-center">
          <span className="text-amber-400 font-bold text-sm">📜 ИСТОРИЧЕСКИЙ РЕЖИМ</span>
          <span className="text-blue-200 text-xs ml-3">Автоматическая симуляция реального строительства флота 1930-1945</span>
        </div>
      )}
      
      {/* Top bar */}
      <div className="bg-slate-900/90 border-b border-amber-900/50 px-3 py-2 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-amber-400 font-bold text-sm">🇯🇵</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded text-amber-300 font-mono text-xs">📅 {state.year}/{String(state.month).padStart(2, '0')}</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded text-green-400 font-mono text-xs">💰 {state.budget} млн¥</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded text-blue-400 font-mono text-xs">🏗️ {freeSlipways}/{totalSlipways} стапелей</span>
            <span className="bg-amber-900/50 px-2 py-0.5 rounded text-amber-300 text-xs font-bold">{state.currentProgram}</span>
            <button onClick={togglePause} className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${state.isPaused ? 'bg-green-700 text-white' : 'bg-yellow-700 text-white'}`}>
              {state.isPaused ? '▶' : '⏸'}
            </button>
            <button onClick={() => setShowYardInfo(!showYardInfo)} className="bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-xs cursor-pointer">🏭 Верфи</button>
            <button onClick={() => setShowYardMap('yokosuka')} className="bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-xs cursor-pointer">🗺️ Йокосука</button>
            <button onClick={() => setShowYardMap('kure')} className="bg-red-700 hover:bg-red-600 px-2 py-0.5 rounded text-xs cursor-pointer">🗺️ Курэ</button>
            <button onClick={() => setShowCrossSection(true)} className="bg-purple-700 hover:bg-purple-600 px-2 py-0.5 rounded text-xs cursor-pointer">📐 Сечение</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-xs">⭐ {currentScore}</span>
            <button onClick={() => setShowLog(!showLog)} className="bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-xs cursor-pointer">📜</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3">
        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>1930</span><span className="text-amber-400">{Math.round(progressPercent)}%</span><span>1942</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 to-red-600 transition-all duration-500" style={{ width: `${Math.min(100, progressPercent)}%` }} />
          </div>
        </div>

        {/* Yard info panel */}
        {(showYardInfo || state.gamePhase === 'historical') && (
          <div className="mb-3 bg-slate-800/80 border border-slate-700 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-amber-400">🏭 Верфи и стапели {state.gamePhase === 'historical' && <span className="text-blue-400 text-xs">(историческое размещение)</span>}</h3>
              <button onClick={() => setShowYardInfo(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
              {state.shipyards.filter(y => y.available && y.availableFrom <= state.year).map(yard => {
                const occupiedSlipways = new Set(state.buildingShips.filter(b => b.builtAt === yard.id).map(b => b.builtOnSlipway));
                return (
                  <div key={yard.id} className={`p-2 rounded text-xs border ${yard.type === 'naval' ? 'bg-blue-900/20 border-blue-800/30' : 'bg-green-900/20 border-green-800/30'}`}>
                    <div className="font-bold text-white mb-0.5">
                      {yard.type === 'naval' ? '⚓' : '🏭'} {yard.name} <span className="text-amber-600 text-[10px]">{yard.nameJp}</span>
                    </div>
                    <div className="text-slate-500 text-[10px] mb-1">×{yard.speedBonus} скорость • {yard.historicalNote}</div>
                    {yard.slipways.map((s, i) => {
                      const isOccupied = occupiedSlipways.has(s.id);
                      const building = state.buildingShips.find(b => b.builtOnSlipway === s.id);
                      return (
                        <div key={i} className={`flex justify-between items-center py-0.5 px-1 rounded mb-0.5 ${isOccupied ? 'bg-red-900/30' : 'bg-green-900/20'}`}>
                          <span className="text-slate-400">{s.label}</span>
                          <div className="text-right">
                            <span className={`${s.expanded ? 'text-blue-400' : 'text-amber-500'}`}>{s.length}м</span>
                            {isOccupied && building && <span className="text-[9px] text-red-300 ml-1">({building.ship.name})</span>}
                            {!isOccupied && <span className="text-[9px] text-green-400 ml-1">✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-700 pt-1">
              <strong>Длина кораблей:</strong> ⚓ Линкор 266м • 🛩️ АВ 227-262м • 🚢 Крейсер 174-201м • 🔹 Эсминец 103-134м • 🔻 ПЛ 76-109м
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Ship catalog */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h2 className="text-sm font-bold text-amber-400 mb-2">🚢 Корабли для строительства</h2>
              <div className="flex flex-wrap gap-1 mb-1">
                {([{ key: 'all', label: 'Все' }, { key: 'battleship', label: '⚓Линк' }, { key: 'aircraft_carrier', label: '🛩️АВ' }, { key: 'cruiser', label: '🚢Кр' }, { key: 'destroyer', label: '🔹ЭС' }, { key: 'submarine', label: '🔻ПЛ' }, { key: 'auxiliary', label: '🛡️Всп' }] as const).map(tab => (
                  <button key={tab.key} onClick={() => setSelectedType(tab.key)} className={`px-2 py-0.5 rounded text-xs cursor-pointer ${selectedType === tab.key ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{tab.label}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {programs.map(prog => (
                  <button key={prog} onClick={() => setSelectedProgram(prog)} className={`px-2 py-0.5 rounded text-xs cursor-pointer ${selectedProgram === prog ? 'bg-red-800 text-white' : 'bg-slate-700/60 text-slate-400 hover:bg-slate-600'}`}>{prog === 'all' ? 'Все программы' : prog}</button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                {availableShips.map(ship => {
                  const locked = state.year < ship.yearAvailable;
                  const canBuild = !locked && state.budget >= ship.cost && canBuildAnywhere(ship, state.shipyards, state.buildingShips, state.year);
                  const noSlipway = !locked && state.budget >= ship.cost && !canBuildAnywhere(ship, state.shipyards, state.buildingShips, state.year);

                  return (
                    <div key={ship.id} className={`border rounded-lg p-2 transition-all ${locked ? 'bg-slate-800/40 border-slate-700 opacity-50' : canBuild ? 'bg-slate-700/60 border-slate-600 hover:border-amber-600' : 'bg-slate-800/40 border-slate-700'}`}>
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
                      <p className="text-[11px] text-slate-400 mb-1">{ship.description}</p>
                      <div className="flex flex-wrap gap-1 text-[10px] mb-1">
                        <span className="bg-red-900/40 text-red-300 px-1 py-0.5 rounded">⚔️{ship.firepower}</span>
                        <span className="bg-blue-900/40 text-blue-300 px-1 py-0.5 rounded">💨{ship.speed}уз</span>
                        <span className="bg-green-900/40 text-green-300 px-1 py-0.5 rounded">🛡️{ship.armor}</span>
                        <span className="bg-slate-600/40 text-slate-300 px-1 py-0.5 rounded">📏{ship.length}м</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400">💰{ship.cost} | ⏱️{ship.buildTime}мес</span>
                        {!locked && (
                          <button onClick={() => startBuilding(ship)} disabled={!canBuild} className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${canBuild ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                            {noSlipway ? '🚫 Нет стапеля' : '🔨 Заложить'}
                          </button>
                        )}
                      </div>
                      {ship.historicalYard && !locked && (
                        <div className="text-[9px] text-slate-600 mt-0.5">
                          📍 Истор.: {initialShipyards.find(y => y.id === ship.historicalYard)?.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-2">
            {/* Building queue by yard */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h3 className="text-sm font-bold text-amber-400 mb-2">🔨 Строительство ({state.buildingShips.length})</h3>
              {state.buildingShips.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Пусто</p>
              ) : (
                <div className="space-y-1.5">
                  {state.buildingShips.map((b, idx) => {
                    const totalMonths = b.ship.buildTime;
                    const startTotal = (b.completionYear * 12 + b.completionMonth) - totalMonths;
                    const currentTotal = state.year * 12 + state.month;
                    const progress = Math.min(100, Math.max(0, ((currentTotal - startTotal) / totalMonths) * 100));
                    const yard = state.shipyards.find(y => y.id === b.builtAt);
                    const slipway = yard?.slipways.find(s => s.id === b.builtOnSlipway);

                    return (
                      <div key={idx} className="bg-slate-700/50 rounded p-1.5">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs text-white">{b.ship.icon} {b.ship.name}</span>
                          <span className="text-[10px] text-amber-500">{yard?.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 mb-0.5">
                          <span>Стапель {slipway?.length}м</span>
                          <span className="text-amber-400 font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-600 to-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fleet */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h3 className="text-sm font-bold text-amber-400 mb-2">⚓ Флот ({state.builtShips.length})</h3>
              {state.builtShips.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Пусто</p>
              ) : (
                <div className="space-y-0.5">
                  {(['battleship', 'aircraft_carrier', 'cruiser', 'destroyer', 'submarine', 'auxiliary'] as ShipType[]).map(type => {
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

            {/* Treaty */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h3 className="text-sm font-bold text-amber-400 mb-2">📜 Договоры</h3>
              <div className={`text-xs p-1.5 rounded ${state.treatyStatus === 'london' ? 'bg-blue-900/30 text-blue-300' : state.treatyStatus === 'withdrawn' ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
                {state.treatyStatus === 'london' && '📋 Лондонское соглашение'}
                {state.treatyStatus === 'withdrawn' && '🚫 Договоры разорваны'}
                {state.treatyStatus === 'unrestricted' && '⚡ Без ограничений'}
              </div>
            </div>
          </div>
        </div>

        {/* Log */}
        {showLog && (
          <div className="mt-3 bg-slate-800/60 border border-slate-700 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-amber-400">📜 Журнал</h3>
              <button onClick={() => setShowLog(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {state.log.slice().reverse().map((entry, idx) => (
                <div key={idx} className="text-[11px] text-slate-400 border-b border-slate-700/30 pb-0.5">{entry}</div>
              ))}
            </div>
          </div>
        )}

        {/* Yard Map Modal */}
        {showYardMap && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border-2 border-amber-600 rounded-xl max-w-5xl w-full my-8">
              <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-amber-400">
                  🗺️ Схема верфи {showYardMap === 'yokosuka' ? 'Йокосука' : 'Курэ'}
                </h2>
                <button onClick={() => setShowYardMap(null)} className="text-slate-400 hover:text-white text-xl cursor-pointer">✕</button>
              </div>
              <div className="p-4">
                {showYardMap === 'yokosuka' ? <YokosukaShipyardMap /> : <KureShipyardMap />}
              </div>
            </div>
          </div>
        )}

        {/* Cross Section Modal */}
        {showCrossSection && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border-2 border-purple-600 rounded-xl max-w-5xl w-full my-8">
              <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-purple-400">
                  📐 Поперечное сечение верфи Йокосука
                </h2>
                <button onClick={() => setShowCrossSection(false)} className="text-slate-400 hover:text-white text-xl cursor-pointer">✕</button>
              </div>
              <div className="p-4">
                <YokosukaCrossSection />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
