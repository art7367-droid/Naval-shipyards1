import { useState, useEffect, useRef } from 'react';

// Types
type ShipType = 'battleship' | 'aircraft_carrier' | 'cruiser' | 'destroyer' | 'submarine';
type TreatyStatus = 'london' | 'withdrawn' | 'unrestricted';
type GamePhase = 'menu' | 'playing' | 'event' | 'gameover';

interface Ship {
  id: string;
  name: string;
  type: ShipType;
  cost: number;
  buildTime: number;
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
}

// Ship templates
const shipTemplates: Ship[] = [
  {
    id: 'yamato', name: 'Ямато', type: 'battleship',
    cost: 250, buildTime: 48, firepower: 100, speed: 27, armor: 100,
    description: 'Суперлинкор. 460-мм орудия. Крупнейший линкор в истории.',
    yearAvailable: 1937, icon: '⚓',
  },
  {
    id: 'nagato', name: 'Нагато', type: 'battleship',
    cost: 120, buildTime: 30, firepower: 70, speed: 25, armor: 75,
    description: 'Быстроходный линкор. 410-мм орудия.',
    yearAvailable: 1930, icon: '⚓',
  },
  {
    id: 'kongo', name: 'Конго (мод.)', type: 'battleship',
    cost: 80, buildTime: 24, firepower: 55, speed: 30, armor: 60,
    description: 'Модернизированный линейный крейсер. 356-мм орудия.',
    yearAvailable: 1930, icon: '⚓',
  },
  {
    id: 'shokaku', name: 'Сёкаку', type: 'aircraft_carrier',
    cost: 180, buildTime: 36, firepower: 85, speed: 34, armor: 50,
    description: 'Лучший японский авианосец. 72 самолёта.',
    yearAvailable: 1937, icon: '🛩️',
  },
  {
    id: 'akagi', name: 'Акаги', type: 'aircraft_carrier',
    cost: 140, buildTime: 30, firepower: 70, speed: 31, armor: 40,
    description: 'Переоборудованный линейный крейсер. 66 самолётов.',
    yearAvailable: 1930, icon: '🛩️',
  },
  {
    id: 'ryujo', name: 'Рюдзё', type: 'aircraft_carrier',
    cost: 70, buildTime: 20, firepower: 40, speed: 29, armor: 25,
    description: 'Лёгкий авианосец. 38 самолётов.',
    yearAvailable: 1930, icon: '🛩️',
  },
  {
    id: 'mogami', name: 'Могами', type: 'cruiser',
    cost: 60, buildTime: 24, firepower: 45, speed: 35, armor: 35,
    description: 'Тяжёлый крейсер. 15 × 203-мм орудий.',
    yearAvailable: 1933, icon: '🚢',
  },
  {
    id: 'tone', name: 'Тоне', type: 'cruiser',
    cost: 55, buildTime: 22, firepower: 40, speed: 35, armor: 30,
    description: 'Разведывательный крейсер. Все орудия в носу.',
    yearAvailable: 1935, icon: '🚢',
  },
  {
    id: 'takao', name: 'Такао', type: 'cruiser',
    cost: 50, buildTime: 20, firepower: 42, speed: 33, armor: 32,
    description: 'Тяжёлый крейсер. 10 × 203-мм орудий.',
    yearAvailable: 1930, icon: '🚢',
  },
  {
    id: 'kagero', name: 'Кагэро', type: 'destroyer',
    cost: 20, buildTime: 14, firepower: 20, speed: 35, armor: 10,
    description: 'Эсминец. Торпеды Тип 93 "Длинное копьё".',
    yearAvailable: 1937, icon: '🔹',
  },
  {
    id: 'fubuki', name: 'Фубуки', type: 'destroyer',
    cost: 15, buildTime: 12, firepower: 18, speed: 38, armor: 8,
    description: 'Специальный эсминец. Революционный проект.',
    yearAvailable: 1930, icon: '🔹',
  },
  {
    id: 'iro', name: 'I-15', type: 'submarine',
    cost: 30, buildTime: 18, firepower: 25, speed: 23, armor: 15,
    description: 'Подводная лодка. Дальний крейсерский рейдер.',
    yearAvailable: 1938, icon: '🔻',
  },
  {
    id: 'kaidai', name: 'Кайдай VI', type: 'submarine',
    cost: 22, buildTime: 15, firepower: 20, speed: 20, armor: 12,
    description: 'Подводный крейсер. 6 торпедных аппаратов.',
    yearAvailable: 1930, icon: '🔻',
  },
];

// Historical events
const historicalEvents: GameEvent[] = [
  {
    id: 'london_treaty',
    title: '📜 Лондонское морское соглашение 1930',
    description: 'Великобритания, США и Япония подписали соглашение об ограничении морских вооружений. Япония получает квоту 6:10 от США по линкорам.',
    year: 1930,
    choices: [
      { text: 'Подписать договор (+100 млн ¥ экономии)', budgetChange: 100, treatyStatus: 'london' },
      { text: 'Отказаться (свобода, но -50 млн ¥ на санкции)', budgetChange: -50, treatyStatus: 'unrestricted' },
    ],
  },
  {
    id: 'manchuria',
    title: '🏔️ Инцидент в Маньчжурии 1931',
    description: 'Квантунская армия захватила Маньчжурию. Нужны корабли для поддержки операций.',
    year: 1931,
    choices: [
      { text: 'Увеличить военный бюджет (+150 млн ¥)', budgetChange: 150 },
      { text: 'Сосредоточиться на эсминцах и подлодках (+80 млн ¥)', budgetChange: 80 },
    ],
  },
  {
    id: 'treaty_withdrawal',
    title: '🚫 Выход из морских договоров 1934',
    description: 'Япония объявляет о выходе из Вашингтонского и Лондонского договоров. Начинается гонка вооружений!',
    year: 1934,
    choices: [
      { text: 'Масштабная программа строительства (+200 млн ¥)', budgetChange: 200, treatyStatus: 'withdrawn' },
      { text: 'Строить умеренно (+100 млн ¥)', budgetChange: 100, treatyStatus: 'withdrawn' },
    ],
  },
  {
    id: 'new_shipyards',
    title: '🏗️ Расширение верфей 1935',
    description: 'Верфи Курэ, Йокосука и Нагасаки готовы к расширению.',
    year: 1935,
    choices: [
      { text: 'Построить 2 новых верфи (-80 млн ¥)', budgetChange: -80, shipyardsChange: 2 },
      { text: 'Построить 1 новую верфь (-40 млн ¥)', budgetChange: -40, shipyardsChange: 1 },
      { text: 'Не расширять верфи', budgetChange: 0 },
    ],
  },
  {
    id: 'type93_torpedo',
    title: '🎯 Торпеда Тип 93 "Длинное копьё" 1936',
    description: 'Разработана революционная кислородная торпеда. Дальность 40 км, скорость 50 узлов.',
    year: 1936,
    choices: [
      { text: 'Инвестировать в производство (-30 млн ¥)', budgetChange: -30 },
      { text: 'Использовать как есть', budgetChange: 0 },
    ],
  },
  {
    id: 'yamato_project',
    title: '🔱 Проект "А" — Суперлинкор Ямато 1937',
    description: 'Одобрен проект крупнейшего линкора в мире. 460-мм орудия, 72000 тонн.',
    year: 1937,
    choices: [
      { text: 'Начать строительство Ямато (-100 млн ¥)', budgetChange: -100 },
      { text: 'Вложить в авианосцы вместо линкоров (+150 млн ¥)', budgetChange: 150 },
    ],
  },
  {
    id: 'china_incident',
    title: '🇨🇳 Инцидент на мосту Марко Поло 1937',
    description: 'Началась Вторая японо-китайская война. Флоту нужны корабли для блокады побережья.',
    year: 1938,
    choices: [
      { text: 'Экстренное финансирование (+200 млн ¥)', budgetChange: 200 },
      { text: 'Умеренное увеличение (+100 млн ¥)', budgetChange: 100 },
    ],
  },
  {
    id: 'carrier_doctrine',
    title: '✈️ Доктрина авианосцев 1939',
    description: 'Адмирал Ямамото предлагает концепцию ударных авианосных соединений (Кидё Бутай).',
    year: 1939,
    choices: [
      { text: 'Приоритет авианосцам (+100 млн ¥)', budgetChange: 100 },
      { text: 'Сохранить баланс (+50 млн ¥)', budgetChange: 50 },
    ],
  },
  {
    id: 'oil_crisis',
    title: '🛢️ Нефтяной кризис 1940',
    description: 'США вводят эмбарго на поставки нефти. Запасы ограничены.',
    year: 1940,
    choices: [
      { text: 'Строить быстрые корабли (-50 млн ¥)', budgetChange: -50 },
      { text: 'Сократить программу, копить ресурсы (+100 млн ¥)', budgetChange: 100 },
    ],
  },
  {
    id: 'final_push',
    title: '⚔️ Решающая подготовка 1941',
    description: 'Война неизбежна. Осталось менее года до Пёрл-Харбора!',
    year: 1941,
    choices: [
      { text: 'Мобилизовать все ресурсы! (+300 млн ¥, +2 верфи)', budgetChange: 300, shipyardsChange: 2 },
      { text: 'Строить только необходимое (+200 млн ¥)', budgetChange: 200 },
    ],
  },
];

function getTypeName(type: ShipType): string {
  const names: Record<ShipType, string> = {
    battleship: 'Линкор',
    aircraft_carrier: 'Авианосец',
    cruiser: 'Крейсер',
    destroyer: 'Эсминец',
    submarine: 'Подлодка',
  };
  return names[type];
}

function calculateScore(ships: BuiltShip[]): number {
  return ships.reduce((sum, s) => sum + s.firepower * 2 + s.speed + s.armor, 0);
}

const initialState: GameState = {
  year: 1930,
  month: 1,
  budget: 200,
  shipyards: 3,
  busyShipyards: 0,
  builtShips: [],
  buildingShips: [],
  currentEvent: null,
  gamePhase: 'menu',
  score: 0,
  treatyStatus: 'london',
  log: [],
  isPaused: false,
};

function App() {
  const [state, setState] = useState<GameState>(initialState);
  const [selectedType, setSelectedType] = useState<ShipType | 'all'>('all');
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
          newLog.push(`${newYear}/${String(newMonth).padStart(2, '0')}: ✅ Завершено — ${s.name} (${getTypeName(s.type)})`);
        });

        // Game over
        if (newYear > 1941 || (newYear === 1942 && newMonth === 1)) {
          const score = calculateScore([...prev.builtShips, ...completed]);
          return {
            ...prev,
            year: newYear,
            month: newMonth,
            builtShips: [...prev.builtShips, ...completed],
            buildingShips: [],
            busyShipyards: 0,
            gamePhase: 'gameover',
            score,
            log: newLog,
          };
        }

        // Annual budget
        let budgetChange = 0;
        if (newMonth === 1) {
          if (prev.treatyStatus === 'london') budgetChange = 30;
          else if (prev.treatyStatus === 'withdrawn') budgetChange = 50;
          else budgetChange = 40;
        }

        // Check for events
        const event = historicalEvents.find((e) => e.year === newYear && newMonth === 1);

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
        buildingShips: [
          ...prev.buildingShips,
          { ship, completionYear, completionMonth },
        ],
        log: [...prev.log, `${prev.year}/${String(prev.month).padStart(2, '0')}: 🔨 Начато — ${ship.name}`],
      };
    });
  }

  function handleEventChoice(choice: GameEvent['choices'][0]) {
    setState((prev) => {
      const newState = { ...prev };
      newState.budget = prev.budget + choice.budgetChange;
      if (choice.shipyardsChange) {
        newState.shipyards = prev.shipyards + choice.shipyardsChange;
      }
      if (choice.treatyStatus) {
        newState.treatyStatus = choice.treatyStatus;
      }
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
      log: ['1930/01: 🇯🇵 Начало кораблестроительной программы Императорского флота Японии'],
    });
  }

  function togglePause() {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }

  const currentScore = calculateScore(state.builtShips);
  const progressPercent = ((state.year - 1930) * 12 + state.month) / (12 * 12) * 100;

  // ============ MENU SCREEN ============
  if (state.gamePhase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="text-7xl mb-4 animate-float">⚓</div>
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
              В вашем распоряжении 11 лет (1930–1941) для создания мощнейшего флота.
            </p>
            <ul className="text-slate-400 space-y-2">
              <li>• Стройте линкоры, авианосцы, крейсеры, эсминцы и подлодки</li>
              <li>• Управляйте бюджетом и верфями</li>
              <li>• Принимайте решения в ключевые исторические моменты</li>
              <li>• Балансируйте между договорами и гонкой вооружений</li>
              <li>• К декабрю 1941 флот должен быть готов!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50 cursor-pointer"
          >
            🏯 Начать программу
          </button>
        </div>
      </div>
    );
  }

  // ============ GAME OVER SCREEN ============
  if (state.gamePhase === 'gameover') {
    const totalFirepower = state.builtShips.reduce((s, sh) => s + sh.firepower, 0);
    const battleships = state.builtShips.filter(s => s.type === 'battleship').length;
    const carriers = state.builtShips.filter(s => s.type === 'aircraft_carrier').length;
    const cruisers = state.builtShips.filter(s => s.type === 'cruiser').length;
    const destroyers = state.builtShips.filter(s => s.type === 'destroyer').length;
    const subs = state.builtShips.filter(s => s.type === 'submarine').length;

    let rank = 'D';
    let rankColor = 'text-slate-400';
    if (currentScore > 800) { rank = 'S'; rankColor = 'text-amber-400'; }
    else if (currentScore > 600) { rank = 'A'; rankColor = 'text-green-400'; }
    else if (currentScore > 400) { rank = 'B'; rankColor = 'text-blue-400'; }
    else if (currentScore > 200) { rank = 'C'; rankColor = 'text-yellow-400'; }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">🏴</div>
          <h1 className="text-4xl font-bold text-red-400 mb-2">Декабрь 1941</h1>
          <h2 className="text-2xl text-amber-300 mb-6">Итоги кораблестроительной программы</h2>

          <div className="bg-slate-800/80 border border-amber-900/50 rounded-lg p-6 mb-6">
            <div className={`text-6xl font-bold mb-2 ${rankColor}`}>Ранг: {rank}</div>
            <div className="text-2xl text-slate-300 mb-4">Очки: {currentScore}</div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-left">
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-amber-400 font-bold">Всего кораблей</div>
                <div className="text-2xl text-white">{state.builtShips.length}</div>
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
  const availableShips = shipTemplates.filter((s) => {
    if (selectedType !== 'all' && s.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top bar */}
      <div className="bg-slate-900/90 border-b border-amber-900/50 px-4 py-3 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-amber-400 font-bold text-lg">🇯🇵 日本海軍</span>
            <span className="bg-slate-700 px-3 py-1 rounded text-amber-300 font-mono">
              📅 {state.year}/{String(state.month).padStart(2, '0')}
            </span>
            <span className="bg-slate-700 px-3 py-1 rounded text-green-400 font-mono">
              💰 {state.budget} млн ¥
            </span>
            <span className="bg-slate-700 px-3 py-1 rounded text-blue-400 font-mono">
              🏗️ {state.shipyards - state.busyShipyards}/{state.shipyards}
            </span>
            <button
              onClick={togglePause}
              className={`px-3 py-1 rounded text-sm font-bold cursor-pointer transition-colors ${
                state.isPaused
                  ? 'bg-green-700 hover:bg-green-600 text-white'
                  : 'bg-yellow-700 hover:bg-yellow-600 text-white'
              }`}
            >
              {state.isPaused ? '▶ Продолжить' : '⏸ Пауза'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold">⭐ {currentScore}</span>
            <button
              onClick={() => setShowLog(!showLog)}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm transition-colors cursor-pointer"
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
            <span className="text-amber-400">Прогресс к войне ({Math.round(progressPercent)}%)</span>
            <span>1942</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-red-600 transition-all duration-500"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
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
                {([
                  { key: 'all', label: 'Все', icon: '📋' },
                  { key: 'battleship', label: 'Линкоры', icon: '⚓' },
                  { key: 'aircraft_carrier', label: 'Авианосцы', icon: '🛩️' },
                  { key: 'cruiser', label: 'Крейсеры', icon: '🚢' },
                  { key: 'destroyer', label: 'Эсминцы', icon: '🔹' },
                  { key: 'submarine', label: 'Подлодки', icon: '🔻' },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedType(tab.key)}
                    className={`px-3 py-1 rounded text-sm transition-all cursor-pointer ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-2">
                {availableShips.map((ship) => {
                  const canBuild = state.budget >= ship.cost &&
                    state.busyShipyards < state.shipyards &&
                    state.year >= ship.yearAvailable;
                  const locked = state.year < ship.yearAvailable;

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
                        <span className="text-xs text-amber-400">💰{ship.cost} | ⏱️{ship.buildTime}мес</span>
                        {!locked && (
                          <button
                            onClick={() => startBuilding(ship)}
                            disabled={!canBuild}
                            className={`px-3 py-1 rounded text-sm font-bold transition-all ${
                              canBuild
                                ? 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white cursor-pointer'
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
              {state.buildingShips.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Нет кораблей на строительстве</p>
              ) : (
                <div className="space-y-2">
                  {state.buildingShips.map((b, idx) => {
                    const totalMonths = b.ship.buildTime;
                    const startTotal = (b.completionYear * 12 + b.completionMonth) - totalMonths;
                    const currentTotal = state.year * 12 + state.month;
                    const elapsed = currentTotal - startTotal;
                    const progress = Math.min(100, Math.max(0, (elapsed / totalMonths) * 100));

                    return (
                      <div key={idx} className="bg-slate-700/50 rounded p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-white">{b.ship.icon} {b.ship.name}</span>
                          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-green-500 transition-all duration-500"
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
              {state.builtShips.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Флот ещё не построен</p>
              ) : (
                <div className="space-y-1">
                  {(['battleship', 'aircraft_carrier', 'cruiser', 'destroyer', 'submarine'] as ShipType[]).map((type) => {
                    const count = state.builtShips.filter(s => s.type === type).length;
                    if (count === 0) return null;
                    const template = shipTemplates.find(s => s.type === type);
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">
                          {template?.icon} {getTypeName(type)}
                        </span>
                        <span className="text-amber-400 font-bold">{count}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-slate-600 mt-2 pt-2 flex justify-between">
                    <span className="text-sm font-bold text-white">Итого</span>
                    <span className="text-amber-400 font-bold">{state.builtShips.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Treaty status */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-bold text-amber-400 mb-3">📜 Статус договоров</h3>
              <div className={`text-sm p-2 rounded ${
                state.treatyStatus === 'london' ? 'bg-blue-900/30 text-blue-300' :
                  state.treatyStatus === 'withdrawn' ? 'bg-red-900/30 text-red-300' :
                    'bg-green-900/30 text-green-300'
              }`}>
                {state.treatyStatus === 'london' && '📋 Лондонское соглашение (ограничения)'}
                {state.treatyStatus === 'withdrawn' && '🚫 Договоры разорваны (свобода)'}
                {state.treatyStatus === 'unrestricted' && '⚡ Без ограничений'}
              </div>
            </div>
          </div>
        </div>

        {/* Log panel */}
        {showLog && (
          <div className="mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-amber-400">📜 Журнал событий</h3>
              <button onClick={() => setShowLog(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {state.log.slice().reverse().map((entry, idx) => (
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
