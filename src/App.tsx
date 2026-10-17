import { useState, useEffect, useCallback } from 'react';

// Types
interface Ship {
  id: string;
  name: string;
  type: ShipType;
  cost: number;
  buildTime: number; // in months
  firepower: number;
  speed: number;
  armor: number;
  description: string;
  yearAvailable: number;
  icon: string;
}

interface BuiltShip extends Ship {
  completionYear: number;
  completionMonth: number;
}

interface GameState {
  year: number;
  month: number;
  budget: number; // in million yen
  shipyards: number;
  busyShipyards: number;
  builtShips: BuiltShip[];
  buildingShips: { ship: Ship; completionYear: number; completionMonth: number }[];
  events: GameEvent[];
  currentEvent: GameEvent | null;
  gamePhase: 'menu' | 'playing' | 'event' | 'gameover';
  score: number;
  treatyStatus: 'london' | 'withdrawn' | 'unrestricted';
  log: string[];
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: { text: string; effect: () => Partial<GameState> }[];
  year: number;
}

type ShipType = 'battleship' | 'aircraft_carrier' | 'cruiser' | 'destroyer' | 'submarine';

// Ship templates
const shipTemplates: Ship[] = [
  {
    id: 'yamato',
    name: 'Ямато',
    type: 'battleship',
    cost: 250,
    buildTime: 48,
    firepower: 100,
    speed: 27,
    armor: 100,
    description: 'Суперлинкор. 460-мм орудия. Крупнейший линкор в истории.',
    yearAvailable: 1937,
    icon: '⚓',
  },
  {
    id: 'nagato',
    name: 'Нагато',
    type: 'battleship',
    cost: 120,
    buildTime: 30,
    firepower: 70,
    speed: 25,
    armor: 75,
    description: 'Быстроходный линкор. 410-мм орудия.',
    yearAvailable: 1930,
    icon: '⚓',
  },
  {
    id: 'kongo',
    name: 'Конго (мод.)',
    type: 'battleship',
    cost: 80,
    buildTime: 24,
    firepower: 55,
    speed: 30,
    armor: 60,
    description: 'Модернизированный линейный крейсер. 356-мм орудия.',
    yearAvailable: 1930,
    icon: '⚓',
  },
  {
    id: 'shokaku',
    name: 'Сёкаку',
    type: 'aircraft_carrier',
    cost: 180,
    buildTime: 36,
    firepower: 85,
    speed: 34,
    armor: 50,
    description: 'Лучший японский авианосец. 72 самолёта.',
    yearAvailable: 1937,
    icon: '🛩️',
  },
  {
    id: 'akagi',
    name: 'Акаги',
    type: 'aircraft_carrier',
    cost: 140,
    buildTime: 30,
    firepower: 70,
    speed: 31,
    armor: 40,
    description: 'Переоборудованный линейный крейсер. 66 самолётов.',
    yearAvailable: 1930,
    icon: '🛩️',
  },
  {
    id: 'ryujo',
    name: 'Рюдзё',
    type: 'aircraft_carrier',
    cost: 70,
    buildTime: 20,
    firepower: 40,
    speed: 29,
    armor: 25,
    description: 'Лёгкий авианосец. 38 самолётов.',
    yearAvailable: 1930,
    icon: '🛩️',
  },
  {
    id: 'mogami',
    name: 'Могами',
    type: 'cruiser',
    cost: 60,
    buildTime: 24,
    firepower: 45,
    speed: 35,
    armor: 35,
    description: 'Тяжёлый крейсер. 15 203-мм орудий.',
    yearAvailable: 1933,
    icon: '🚢',
  },
  {
    id: 'tone',
    name: 'Тоне',
    type: 'cruiser',
    cost: 55,
    buildTime: 22,
    firepower: 40,
    speed: 35,
    armor: 30,
    description: 'Разведывательный крейсер. Все орудия в носу.',
    yearAvailable: 1935,
    icon: '🚢',
  },
  {
    id: 'takao',
    name: 'Такао',
    type: 'cruiser',
    cost: 50,
    buildTime: 20,
    firepower: 42,
    speed: 33,
    armor: 32,
    description: 'Тяжёлый крейсер. 10 203-мм орудий.',
    yearAvailable: 1930,
    icon: '🚢',
  },
  {
    id: 'kagero',
    name: 'Кагэро',
    type: 'destroyer',
    cost: 20,
    buildTime: 14,
    firepower: 20,
    speed: 35,
    armor: 10,
    description: 'Эсминец. Торпеды Тип 93 "Длинное копьё".',
    yearAvailable: 1937,
    icon: '🔹',
  },
  {
    id: 'fubuki',
    name: 'Фубуки',
    type: 'destroyer',
    cost: 15,
    buildTime: 12,
    firepower: 18,
    speed: 38,
    armor: 8,
    description: 'Специальный эсминец. Революционный проект.',
    yearAvailable: 1930,
    icon: '🔹',
  },
  {
    id: 'iro',
    name: 'I-15',
    type: 'submarine',
    cost: 30,
    buildTime: 18,
    firepower: 25,
    speed: 23,
    armor: 15,
    description: 'Подводная лодка. Дальний крейсерский рейдер.',
    yearAvailable: 1938,
    icon: '🔻',
  },
  {
    id: 'kaidai',
    name: 'Кайдай VI',
    type: 'submarine',
    cost: 22,
    buildTime: 15,
    firepower: 20,
    speed: 20,
    armor: 12,
    description: 'Подводный крейсер. 6 торпедных аппаратов.',
    yearAvailable: 1930,
    icon: '🔻',
  },
];

// Historical events
const historicalEvents: GameEvent[] = [
  {
    id: 'london_treaty',
    title: '📜 Лондонское морское соглашение 1930',
    description: 'Великобритания, США и Япония подписали соглашение об ограничении морских вооружений. Япония получает квоту 6:10 от США по линкорам, но может строить больше крейсеров и подводных лодок.',
    choices: [
      { text: 'Подписать договор (получить +100 млн иен экономии)', effect: () => ({ budget: 100, treatyStatus: 'london' as const }) },
      { text: 'Отказаться (свобода строительства, но -50 млн иен на санкции)', effect: () => ({ budget: -50, treatyStatus: 'unrestricted' as const }) },
    ],
    year: 1930,
  },
  {
    id: 'manchuria',
    title: '🏔️ Инцидент в Маньчжурии',
    description: 'Квантунская армия захватила Маньчжурию. Нужны корабли для поддержки операций. Бюджет увеличен.',
    choices: [
      { text: 'Увеличить военный бюджет (+150 млн иен)', effect: () => ({ budget: 150 }) },
      { text: 'Сосредоточиться на эсминцах и подлодках', effect: () => ({ budget: 80 }) },
    ],
    year: 1931,
  },
  {
    id: 'treaty_withdrawal',
    title: '🚫 Выход из морских договоров 1934',
    description: 'Япония объявляет о выходе из Вашингтонского и Лондонского морских договоров. Начинается ничем не ограниченная гонка вооружений!',
    choices: [
      { text: 'Начать масштабную программу строительства (+200 млн иен)', effect: () => ({ budget: 200, treatyStatus: 'withdrawn' as const }) },
      { text: 'Строить умеренно, сохраняя ресурсы (+100 млн иен)', effect: () => ({ budget: 100, treatyStatus: 'withdrawn' as const }) },
    ],
    year: 1934,
  },
  {
    id: 'new_shipyards',
    title: '🏗️ Расширение верфей',
    description: 'Верфи Курэ, Йокосука и Нагасаки готовы к расширению. Можно построить новые стапели.',
    choices: [
      { text: 'Построить 2 новых верфи (-80 млн иен)', effect: () => ({ budget: -80, shipyards: 2 }) },
      { text: 'Построить 1 новую верфь (-40 млн иен)', effect: () => ({ budget: -40, shipyards: 1 }) },
      { text: 'Не расширять верфи', effect: () => ({}) },
    ],
    year: 1935,
  },
  {
    id: 'type93_torpedo',
    title: '🎯 Торпеда Тип 93 "Длинное копьё"',
    description: 'Разработана революционная кислородная торпеда. Дальность 40 км, скорость 50 узлов. Можно оснастить все эсминцы.',
    choices: [
      { text: 'Инвестировать в производство (+5 к огневой мощи всех эсминцев)', effect: () => ({ budget: -30 }) },
      { text: 'Использовать как есть', effect: () => ({}) },
    ],
    year: 1936,
  },
  {
    id: 'yamato_project',
    title: '🔱 Проект "А" — Суперлинкор Ямато',
    description: 'Адмирал Ямамото и командование одобрили проект крупнейшего линкора в мире. 460-мм орудия, 72000 тонн. Строительство потребует колоссальных ресурсов.',
    choices: [
      { text: 'Начать строительство Ямато (+250 млн иен, секретный проект)', effect: () => ({ budget: -100 }) },
      { text: 'Вложить средства в авианосцы вместо линкоров (+150 млн иен)', effect: () => ({ budget: 150 }) },
    ],
    year: 1937,
  },
  {
    id: 'china_incident',
    title: '🇨🇳 Инцидент на мосту Марко Поло 1937',
    description: 'Началась Вторая японо-китайская война. Флоту нужны корабли для поддержки десантных операций и блокады побережья.',
    choices: [
      { text: 'Экстренное финансирование флота (+200 млн иен)', effect: () => ({ budget: 200 }) },
      { text: 'Умеренное увеличение бюджета (+100 млн иен)', effect: () => ({ budget: 100 }) },
    ],
    year: 1937,
  },
  {
    id: 'carrier_doctrine',
    title: '✈️ Новая доктрина авианосцев',
    description: 'Адмирал Ямамото предлагает концепцию ударных авианосных соединений (Кидё Бутай). Авианосцы — будущее войны на море.',
    choices: [
      { text: 'Поддержать — приоритет авианосцам (+100 млн иен на авианосцы)', effect: () => ({ budget: 100 }) },
      { text: 'Сохранить баланс между типами кораблей (+50 млн иен)', effect: () => ({ budget: 50 }) },
    ],
    year: 1938,
  },
  {
    id: 'oil_crisis',
    title: '🛢️ Нефтяной кризис',
    description: 'США вводят эмбарго на поставки нефти. Запасы ограничены. Нужно решить стратегию — либо быстрые корабли, либо меньше кораблей.',
    choices: [
      { text: 'Строить быстрые корабли (топливо — дефицит)', effect: () => ({ budget: -50 }) },
      { text: 'Сократить программу, копить ресурсы (+100 млн иен)', effect: () => ({ budget: 100 }) },
    ],
    year: 1939,
  },
  {
    id: 'final_push',
    title: '⚔️ Решающая подготовка 1940',
    description: 'Война неизбежна. Осталось менее 2 лет до Пёрл-Харбора. Нужно максимально усилить флот!',
    choices: [
      { text: 'Мобилизовать все ресурсы! (+300 млн иен, +2 верфи)', effect: () => ({ budget: 300, shipyards: 2 }) },
      { text: 'Строить только самое необходимое (+200 млн иен)', effect: () => ({ budget: 200 }) },
    ],
    year: 1940,
  },
];

function App() {
  const [gameState, setGameState] = useState<GameState>({
    year: 1930,
    month: 1,
    budget: 200,
    shipyards: 3,
    busyShipyards: 0,
    builtShips: [],
    buildingShips: [],
    events: [],
    currentEvent: null,
    gamePhase: 'menu',
    score: 0,
    treatyStatus: 'london',
    log: [],
  });

  const [selectedType, setSelectedType] = useState<ShipType | 'all'>('all');
  const [showLog, setShowLog] = useState(false);

  // Advance time
  const advanceMonth = useCallback(() => {
    setGameState((prev) => {
      let newYear = prev.year;
      let newMonth = prev.month + 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }

      // Check for completed ships
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

      // Check for events
      const event = historicalEvents.find((e) => e.year === newYear && e.year === newYear && newMonth === 1);
      
      // Game over check
      if (newYear >= 1942) {
        const score = calculateScore([...prev.builtShips, ...completed]);
        return {
          ...prev,
          year: newYear,
          month: newMonth,
          builtShips: [...prev.builtShips, ...completed],
          buildingShips: stillBuilding,
          busyShipyards: stillBuilding.length,
          gamePhase: 'gameover',
          score,
          log: [...prev.log, ...completed.map((s) => `${newYear}/${newMonth}: Завершено строительство — ${s.name}`)],
        };
      }

      // Annual budget increase
      let budgetChange = 0;
      if (newMonth === 1) {
        budgetChange = prev.treatyStatus === 'london' ? 30 : prev.treatyStatus === 'withdrawn' ? 50 : 40;
      }

      const newLog = [...prev.log];
      completed.forEach((s) => {
        newLog.push(`${newYear}/${String(newMonth).padStart(2, '0')}: ✅ Завершено — ${s.name} (${getTypeName(s.type)})`);
      });

      if (event) {
        return {
          ...prev,
          year: newYear,
          month: newMonth,
          budget: prev.budget + budgetChange,
          builtShips: [...prev.builtShips, ...completed],
          buildingShips: stillBuilding,
          busyShipyards: stillBuilding.length,
          currentEvent: event,
          gamePhase: 'event',
          log: newLog,
        };
      }

      return {
        ...prev,
        year: newYear,
        month: newMonth,
        budget: prev.budget + budgetChange,
        builtShips: [...prev.builtShips, ...completed],
        buildingShips: stillBuilding,
        busyShipyards: stillBuilding.length,
        log: newLog,
      };
    });
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (gameState.gamePhase === 'playing') {
      const timer = setInterval(() => {
        advanceMonth();
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [gameState.gamePhase, advanceMonth]);

  function getTypeName(type: ShipType): string {
    switch (type) {
      case 'battleship': return 'Линкор';
      case 'aircraft_carrier': return 'Авианосец';
      case 'cruiser': return 'Крейсер';
      case 'destroyer': return 'Эсминец';
      case 'submarine': return 'Подлодка';
    }
  }

  function getTypeColor(type: ShipType): string {
    switch (type) {
      case 'battleship': return 'from-red-900 to-red-700';
      case 'aircraft_carrier': return 'from-blue-900 to-blue-700';
      case 'cruiser': return 'from-green-900 to-green-700';
      case 'destroyer': return 'from-yellow-900 to-yellow-700';
      case 'submarine': return 'from-purple-900 to-purple-700';
    }
  }

  function calculateScore(ships: BuiltShip[]): number {
    let score = 0;
    ships.forEach((s) => {
      score += s.firepower * 2 + s.speed + s.armor;
    });
    return score;
  }

  function startBuilding(ship: Ship) {
    setGameState((prev) => {
      if (prev.budget < ship.cost) return prev;
      if (prev.busyShipyards >= prev.shipyards) return prev;
      if (prev.year < ship.yearAvailable) return prev;

      const completionMonth = prev.month + ship.buildTime;
      const completionYear = prev.year + Math.floor((completionMonth - 1) / 12);
      const completionMonthNorm = ((completionMonth - 1) % 12) + 1;

      return {
        ...prev,
        budget: prev.budget - ship.cost,
        busyShipyards: prev.busyShipyards + 1,
        buildingShips: [
          ...prev.buildingShips,
          { ship, completionYear, completionMonth: completionMonthNorm },
        ],
        log: [...prev.log, `${prev.year}/${String(prev.month).padStart(2, '0')}: 🔨 Начато строительство — ${ship.name}`],
      };
    });
  }

  function handleEventChoice(choice: { text: string; effect: () => Partial<GameState> }) {
    setGameState((prev) => {
      const effects = choice.effect();
      return {
        ...prev,
        ...effects,
        currentEvent: null,
        gamePhase: 'playing',
        busyShipyards: prev.busyShipyards + (effects.shipyards || 0),
        log: [...prev.log, `${prev.year}: 📋 ${prev.currentEvent?.title} → ${choice.text}`],
      };
    });
  }

  function startGame() {
    setGameState({
      year: 1930,
      month: 1,
      budget: 200,
      shipyards: 3,
      busyShipyards: 0,
      builtShips: [],
      buildingShips: [],
      events: [],
      currentEvent: null,
      gamePhase: 'playing',
      score: 0,
      treatyStatus: 'london',
      log: ['1930/01: 🇯🇵 Начало кораблестроительной программы Императорского флота Японии'],
    });
  }

  const availableShips = shipTemplates.filter((s) => {
    if (selectedType !== 'all' && s.type !== selectedType) return false;
    return true;
  });

  const currentScore = calculateScore(gameState.builtShips);

  // Menu screen
  if (gameState.gamePhase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">⚓</div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'serif' }}>
              日本海軍造船計画
            </h1>
            <h2 className="text-2xl md:text-3xl text-amber-200 mb-4" style={{ fontFamily: 'serif' }}>
              Кораблестроительная программа Японии
            </h2>
            <p className="text-slate-300 text-lg">1930 — 1941</p>
          </div>
          
          <div className="bg-slate-800/80 border border-amber-900/50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-amber-400 font-bold text-lg mb-3">📋 Задание:</h3>
            <p className="text-slate-300 mb-4">
              Вы — руководитель кораблестроительной программы Императорского флота Японии. 
              В вашем распоряжении 11 лет (1930-1941) для создания мощнейшего флота.
            </p>
            <ul className="text-slate-400 space-y-2">
              <li>• Стройте линкоры, авианосцы, крейсеры, эсминцы и подлодки</li>
              <li>• Управляйте бюджетом и верфями</li>
              <li>• Принимайте решения в ключевые исторические моменты</li>
              <li>• Балансируйте между договорами и гонкой вооружений</li>
              <li>• К декабрю 1941 флот должен быть готов к войне!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50"
          >
            🏯 Начать программу
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameState.gamePhase === 'gameover') {
    const totalFirepower = gameState.builtShips.reduce((sum, s) => sum + s.firepower, 0);
    const totalShips = gameState.builtShips.length;
    const battleships = gameState.builtShips.filter(s => s.type === 'battleship').length;
    const carriers = gameState.builtShips.filter(s => s.type === 'aircraft_carrier').length;
    const cruisers = gameState.builtShips.filter(s => s.type === 'cruiser').length;
    const destroyers = gameState.builtShips.filter(s => s.type === 'destroyer').length;
    const subs = gameState.builtShips.filter(s => s.type === 'submarine').length;

    let rank = 'D';
    if (currentScore > 800) rank = 'S';
    else if (currentScore > 600) rank = 'A';
    else if (currentScore > 400) rank = 'B';
    else if (currentScore > 200) rank = 'C';

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">🏴</div>
          <h1 className="text-4xl font-bold text-red-400 mb-2">Декабрь 1941</h1>
          <h2 className="text-2xl text-amber-300 mb-6">Итоги кораблестроительной программы</h2>
          
          <div className="bg-slate-800/80 border border-amber-900/50 rounded-lg p-6 mb-6">
            <div className="text-5xl font-bold text-amber-400 mb-2">Ранг: {rank}</div>
            <div className="text-2xl text-slate-300 mb-4">Очки: {currentScore}</div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-left">
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-amber-400 font-bold">Всего кораблей</div>
                <div className="text-2xl text-white">{totalShips}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-amber-400 font-bold">Огневая мощь</div>
                <div className="text-2xl text-white">{totalFirepower}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-red-400 font-bold">⚓ Линкоры</div>
                <div className="text-2xl text-white">{battleships}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-blue-400 font-bold">🛩️ Авианосцы</div>
                <div className="text-2xl text-white">{carriers}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-green-400 font-bold">🚢 Крейсеры</div>
                <div className="text-2xl text-white">{cruisers}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-yellow-400 font-bold">🔹 Эсминцы</div>
                <div className="text-2xl text-white">{destroyers}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-purple-400 font-bold">🔻 Подлодки</div>
                <div className="text-2xl text-white">{subs}</div>
              </div>
            </div>
          </div>

          {carriers >= 4 && (
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-4">
              <p className="text-blue-300">✈️ Ударные авианосные соединения готовы! Кидё Бутай — грозная сила!</p>
            </div>
          )}
          {battleships >= 3 && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-4">
              <p className="text-red-300">⚓ Линейный флот превосходит противника в ночном бою!</p>
            </div>
          )}

          <button
            onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'menu' }))}
            className="bg-gradient-to-r from-amber-800 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
          >
            🔄 Начать заново
          </button>
        </div>
      </div>
    );
  }

  // Event screen
  if (gameState.gamePhase === 'event' && gameState.currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="bg-slate-800/90 border-2 border-amber-700/70 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">{gameState.currentEvent.title}</h2>
            <p className="text-slate-300 mb-6 text-lg leading-relaxed">{gameState.currentEvent.description}</p>
            <div className="space-y-3">
              {gameState.currentEvent.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEventChoice(choice)}
                  className="w-full bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600 hover:border-amber-600 text-slate-200 py-3 px-4 rounded-lg text-left transition-all"
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

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top bar */}
      <div className="bg-slate-900/90 border-b border-amber-900/50 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-amber-400 font-bold text-lg">🇯🇵 日本海軍</span>
            <span className="bg-slate-700 px-3 py-1 rounded text-amber-300 font-mono">
              📅 {gameState.year}/{String(gameState.month).padStart(2, '0')}
            </span>
            <span className="bg-slate-700 px-3 py-1 rounded text-green-400 font-mono">
              💰 {gameState.budget} млн ¥
            </span>
            <span className="bg-slate-700 px-3 py-1 rounded text-blue-400 font-mono">
              🏗️ Верфи: {gameState.shipyards - gameState.busyShipyards}/{gameState.shipyards}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold">⭐ {currentScore}</span>
            <button
              onClick={() => setShowLog(!showLog)}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm transition-colors"
            >
              📜 Журнал
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>1930</span>
            <span className="text-amber-400">Прогресс к войне</span>
            <span>1942</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-red-600 transition-all duration-500"
              style={{ width: `${((gameState.year - 1930) * 12 + gameState.month) / (12 * 12) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Ship catalog */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h2 className="text-xl font-bold text-amber-400 mb-3">🚢 Корабли для строительства</h2>
              
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'all', label: 'Все', icon: '📋' },
                  { key: 'battleship', label: 'Линкоры', icon: '⚓' },
                  { key: 'aircraft_carrier', label: 'Авианосцы', icon: '🛩️' },
                  { key: 'cruiser', label: 'Крейсеры', icon: '🚢' },
                  { key: 'destroyer', label: 'Эсминцы', icon: '🔹' },
                  { key: 'submarine', label: 'Подлодки', icon: '🔻' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedType(tab.key as ShipType | 'all')}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      selectedType === tab.key
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Ship list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                {availableShips.map((ship) => {
                  const canBuild = gameState.budget >= ship.cost && 
                                   gameState.busyShipyards < gameState.shipyards &&
                                   gameState.year >= ship.yearAvailable;
                  const locked = gameState.year < ship.yearAvailable;
                  
                  return (
                    <div
                      key={ship.id}
                      className={`border rounded-lg p-3 transition-all ${
                        locked
                          ? 'bg-slate-800/40 border-slate-700 opacity-50'
                          : canBuild
                          ? 'bg-slate-700/60 border-slate-600 hover:border-amber-600 hover:bg-slate-700/80'
                          : 'bg-slate-800/40 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-lg mr-2">{ship.icon}</span>
                          <span className="font-bold text-white">{ship.name}</span>
                          <span className="text-xs text-slate-400 ml-2">({getTypeName(ship.type)})</span>
                        </div>
                        {locked && <span className="text-xs text-red-400">🔒 {ship.yearAvailable}</span>}
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{ship.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs mb-2">
                        <span className="bg-red-900/40 text-red-300 px-2 py-0.5 rounded">⚔️ {ship.firepower}</span>
                        <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">💨 {ship.speed}уз</span>
                        <span className="bg-green-900/40 text-green-300 px-2 py-0.5 rounded">🛡️ {ship.armor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-400">💰 {ship.cost} млн | ⏱️ {ship.buildTime} мес.</span>
                        {!locked && (
                          <button
                            onClick={() => startBuilding(ship)}
                            disabled={!canBuild}
                            className={`px-3 py-1 rounded text-sm font-bold transition-all ${
                              canBuild
                                ? 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            🔨 Строить
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Building queue */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-bold text-amber-400 mb-3">🔨 На стапелях</h3>
              {gameState.buildingShips.length === 0 ? (
                <p className="text-slate-500 text-sm">Нет кораблей на строительстве</p>
              ) : (
                <div className="space-y-2">
                  {gameState.buildingShips.map((b, idx) => {
                    const totalMonths = b.ship.buildTime;
                    const elapsed = (gameState.year * 12 + gameState.month) - ((b.completionYear * 12 + b.completionMonth) - totalMonths);
                    const progress = Math.min(100, (elapsed / totalMonths) * 100);
                    
                    return (
                      <div key={idx} className="bg-slate-700/50 rounded p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-white">{b.ship.icon} {b.ship.name}</span>
                          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-green-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Готов: {b.completionYear}/{String(b.completionMonth).padStart(2, '0')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fleet overview */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-bold text-amber-400 mb-3">⚓ Построенный флот</h3>
              {gameState.builtShips.length === 0 ? (
                <p className="text-slate-500 text-sm">Флот ещё не построен</p>
              ) : (
                <div className="space-y-1">
                  {Object.entries(
                    gameState.builtShips.reduce((acc, s) => {
                      acc[s.type] = (acc[s.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">
                        {shipTemplates.find(s => s.type === type)?.icon} {getTypeName(type as ShipType)}
                      </span>
                      <span className="text-amber-400 font-bold">{count}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-600 mt-2 pt-2 flex justify-between">
                    <span className="text-sm font-bold text-white">Итого</span>
                    <span className="text-amber-400 font-bold">{gameState.builtShips.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Treaty status */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-bold text-amber-400 mb-3">📜 Статус договоров</h3>
              <div className={`text-sm p-2 rounded ${
                gameState.treatyStatus === 'london' ? 'bg-blue-900/30 text-blue-300' :
                gameState.treatyStatus === 'withdrawn' ? 'bg-red-900/30 text-red-300' :
                'bg-green-900/30 text-green-300'
              }`}>
                {gameState.treatyStatus === 'london' && '📋 Лондонское соглашение (ограничения)'}
                {gameState.treatyStatus === 'withdrawn' && '🚫 Договоры разорваны (свобода строительства)'}
                {gameState.treatyStatus === 'unrestricted' && '⚡ Без ограничений'}
              </div>
            </div>
          </div>
        </div>

        {/* Log panel */}
        {showLog && (
          <div className="mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-amber-400">📜 Журнал событий</h3>
              <button onClick={() => setShowLog(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {gameState.log.slice().reverse().map((entry, idx) => (
                <div key={idx} className="text-sm text-slate-400 border-b border-slate-700/50 pb-1">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
