// Исторические закладки кораблей Императорского флота Японии
// Реальные даты и верфи строительства

export interface HistoricalLaydown {
  shipId: string;
  yardId: string;
  slipwayIdx: number; // индекс стапеля на верфи
  laidDownYear: number;
  laidDownMonth: number;
  note?: string;
}

export const historicalLaydowns: HistoricalLaydown[] = [
  // ============ マル①計画 (Maru 1, 1931) ============
  // Крейсеры типа «Могами»
  { shipId: 'mogami', yardId: 'kure', slipwayIdx: 0, laidDownYear: 1931, laidDownMonth: 10, note: 'Большой стапель 300м' },
  { shipId: 'mikuma', yardId: 'nagasaki', slipwayIdx: 0, laidDownYear: 1931, laidDownMonth: 12, note: 'Большой стапель 275м' },
  
  // Эсминцы типа «Хатсухару»
  { shipId: 'hatsuharu', yardId: 'sasebo', slipwayIdx: 0, laidDownYear: 1931, laidDownMonth: 5, note: 'Стапель №1 200м' },
  
  // Эсминцы типа «Сирацую» (переделка из Хатсухару)
  { shipId: 'shiratsuyu', yardId: 'sasebo', slipwayIdx: 1, laidDownYear: 1933, laidDownMonth: 11, note: 'Стапель №2 175м' },
  
  // Подлодки
  { shipId: 'i6', yardId: 'kawasaki', slipwayIdx: 0, laidDownYear: 1931, laidDownMonth: 11, note: 'Большой стапель 250м' },
  { shipId: 'kaidai_vi', yardId: 'kawasaki', slipwayIdx: 1, laidDownYear: 1931, laidDownMonth: 12, note: 'Стапель №2 150м' },
  { shipId: 'ro33', yardId: 'kawasaki', slipwayIdx: 2, laidDownYear: 1932, laidDownMonth: 6, note: 'Стапель №3 150м' },

  // ============ マル②計画 (Maru 2, 1934) ============
  // Крейсер типа «Тоне»
  { shipId: 'tone', yardId: 'nagasaki', slipwayIdx: 0, laidDownYear: 1934, laidDownMonth: 12, note: 'Большой стапель 275м' },
  
  // Авианосец «Сорю»
  { shipId: 'soryu', yardId: 'kure', slipwayIdx: 1, laidDownYear: 1934, laidDownMonth: 11, note: 'Стапель №2 225м' },
  
  // Авианосец «Хирю»
  { shipId: 'hiryu', yardId: 'yokosuka', slipwayIdx: 1, laidDownYear: 1936, laidDownMonth: 7, note: 'Стапель №2 200м' },
  
  // Крейсер «Тикума» (второй типа Тоне)
  { shipId: 'chikuma', yardId: 'nagasaki', slipwayIdx: 1, laidDownYear: 1935, laidDownMonth: 10, note: 'Стапель №2 225м' },
  
  // Эсминец типа «Асасио»
  { shipId: 'asashio', yardId: 'sasebo', slipwayIdx: 0, laidDownYear: 1935, laidDownMonth: 9, note: 'Стапель №1 200м' },
  
  // Подлодка типа Junsen III
  { shipId: 'junsen_iii', yardId: 'kawasaki', slipwayIdx: 0, laidDownYear: 1934, laidDownMonth: 10, note: 'Большой стапель 250м' },

  // ============ マル③計画 (Maru 3, 1937) ============
  // ЛИНКОР «ЯМАТО» — совершенно секретно!
  { shipId: 'yamato', yardId: 'kure', slipwayIdx: 0, laidDownYear: 1937, laidDownMonth: 8, note: 'БОЛЬШОЙ СТАПЕЛЬ 300м • ЗАСЕКРЕЧЕНО' },
  
  // Авианосцы типа «Сёкаку»
  { shipId: 'shokaku', yardId: 'yokosuka', slipwayIdx: 0, laidDownYear: 1937, laidDownMonth: 12, note: 'Большой стапель 300м' },
  { shipId: 'zuikaku', yardId: 'kawasaki', slipwayIdx: 0, laidDownYear: 1938, laidDownMonth: 5, note: 'Большой стапель 250м' },
  
  // Эсминцы типа «Кагэро»
  { shipId: 'kagero', yardId: 'maizuru', slipwayIdx: 0, laidDownYear: 1937, laidDownMonth: 9, note: 'Стапель №1 150м' },
  
  // Подлодки типов A, B, C
  { shipId: 'i9', yardId: 'kawasaki', slipwayIdx: 0, laidDownYear: 1938, laidDownMonth: 1, note: 'Большой стапель 250м' },
  { shipId: 'i15', yardId: 'kawasaki', slipwayIdx: 1, laidDownYear: 1938, laidDownMonth: 3, note: 'Стапель №2 150м' },
  { shipId: 'i16', yardId: 'kawasaki', slipwayIdx: 2, laidDownYear: 1938, laidDownMonth: 6, note: 'Стапель №3 150м' },
  
  // Эскортный корабль «Симусю»
  { shipId: 'shimushu', yardId: 'sasebo', slipwayIdx: 2, laidDownYear: 1938, laidDownMonth: 2, note: 'Стапель №3 150м' },

  // ============ マル④計画 (Maru 4, 1939) ============
  // ЛИНКОР «МУСАШИ» — тоже совершенно секретно!
  { shipId: 'musashi', yardId: 'nagasaki', slipwayIdx: 0, laidDownYear: 1939, laidDownMonth: 3, note: 'БОЛЬШОЙ СТАПЕЛЬ 295м (удлинён!) • ЗАСЕКРЕЧЕНО' },
  
  // Крейсер «Тикума» (второй типа Тоне)
  // { shipId: 'chikuma', yardId: 'nagasaki', slipwayIdx: 1, laidDownYear: 1935, laidDownMonth: 10, note: 'Стапель №2 225м' }, // не добавлен в shipTemplates
  
  // Линкор «Синано» (позже переделан в авианосец)
  { shipId: 'shinano', yardId: 'yokosuka', slipwayIdx: 0, laidDownYear: 1940, laidDownMonth: 5, note: 'Большой стапель 300м' },
  
  // Авианосец «Тайхо»
  { shipId: 'taiho', yardId: 'kawasaki', slipwayIdx: 0, laidDownYear: 1941, laidDownMonth: 7, note: 'Большой стапель 250м' },
  
  // Крейсер типа «Агано»
  { shipId: 'agano', yardId: 'sasebo', slipwayIdx: 0, laidDownYear: 1940, laidDownMonth: 6, note: 'Стапель №1 200м' },
  
  // Крейсер «Оёдо»
  { shipId: 'oyodo', yardId: 'kure', slipwayIdx: 1, laidDownYear: 1939, laidDownMonth: 11, note: 'Стапель №2 225м' },
  
  // Эсминцы типа «Югумо»
  { shipId: 'yugumo', yardId: 'maizuru', slipwayIdx: 0, laidDownYear: 1939, laidDownMonth: 12, note: 'Стапель №1 150м' },
  
  // Эсминцы типа «Акидзуки»
  { shipId: 'akizuki', yardId: 'maizuru', slipwayIdx: 1, laidDownYear: 1940, laidDownMonth: 7, note: 'Стапель №2 125м' },
  
  // Экспериментальный эсминец «Симакадзэ»
  { shipId: 'shimakaze', yardId: 'kawasaki', slipwayIdx: 1, laidDownYear: 1939, laidDownMonth: 8, note: 'Стапель №2 150м' },

  // ============ マル凛計画 (Maru Rin, 1940) ============
  // Средние подлодки
  { shipId: 'ro35', yardId: 'kawasaki', slipwayIdx: 3, laidDownYear: 1940, laidDownMonth: 4, note: 'Стапель №4 100м' },
  { shipId: 'ro100', yardId: 'kawasaki', slipwayIdx: 4, laidDownYear: 1940, laidDownMonth: 8, note: 'Стапель №5 100м' },

  // ============ マル級計画 (Maru Kyū, 1941) ============
  // Авианосец «Унрю»
  { shipId: 'unryu', yardId: 'yokosuka', slipwayIdx: 1, laidDownYear: 1941, laidDownMonth: 8, note: 'Стапель №2 200м' },
  
  // Крейсер «Ибуки»
  { shipId: 'ibuki', yardId: 'kawasaki', slipwayIdx: 0, laidDownYear: 1941, laidDownMonth: 10, note: 'Большой стапель 250м' },
  
  // Эскортные корабли типа «Эторофу»
  { shipId: 'etorofu', yardId: 'sasebo', slipwayIdx: 1, laidDownYear: 1941, laidDownMonth: 5, note: 'Стапель №2 175м' },
  
  // Подлодка типа B мод.
  { shipId: 'i40', yardId: 'kawasaki', slipwayIdx: 1, laidDownYear: 1941, laidDownMonth: 3, note: 'Стапель №2 150м' },
];

// Реальные даты ввода в строй (для справки)
export const historicalCompletions: Record<string, { year: number; month: number }> = {
  'mogami': { year: 1935, month: 7 },
  'mikuma': { year: 1935, month: 8 },
  'hatsuharu': { year: 1933, month: 9 },
  'shiratsuyu': { year: 1936, month: 9 },
  'i6': { year: 1935, month: 10 },
  'kaidai_vi': { year: 1935, month: 12 },
  'ro33': { year: 1936, month: 5 },
  'tone': { year: 1938, month: 11 },
  'soryu': { year: 1937, month: 12 },
  'asashio': { year: 1937, month: 8 },
  'junsen_iii': { year: 1937, month: 10 },
  'yamato': { year: 1941, month: 12 },
  'shokaku': { year: 1941, month: 8 },
  'zuikaku': { year: 1941, month: 9 },
  'kagero': { year: 1939, month: 11 },
  'i9': { year: 1940, month: 3 },
  'i15': { year: 1940, month: 9 },
  'i16': { year: 1940, month: 4 },
  'shimushu': { year: 1940, month: 6 },
  'musashi': { year: 1942, month: 6 },
  'shinano': { year: 1944, month: 11 }, // как авианосец
  'taiho': { year: 1944, month: 3 },
  'agano': { year: 1942, month: 10 },
  'oyodo': { year: 1943, month: 2 },
  'yugumo': { year: 1941, month: 12 },
  'akizuki': { year: 1942, month: 6 },
  'shimakaze': { year: 1943, month: 5 },
  'ro35': { year: 1943, month: 8 },
  'ro100': { year: 1943, month: 11 },
  'unryu': { year: 1944, month: 8 },
  'ibuki': { year: 1945, month: 0 }, // не достроен
  'etorofu': { year: 1943, month: 10 },
  'i40': { year: 1943, month: 9 },
};
