import { useState, useEffect } from 'react';

// ============ HISTORICAL SHIPYARD DATA ============
// Real slipway data from Japanese naval archives
const SHIPYARD_INFO = [
  {
    name: 'Курэ',
    nameJp: '呉',
    type: 'naval' as const,
    slipways: [
      { length: 300, label: '№1 (большой)', note: 'Ямато построен здесь' },
      { length: 225, label: '№2', note: 'Авианосцы, крейсеры' },
      { length: 175, label: '№3', note: 'Крейсеры, эсминцы' },
      { length: 150, label: '№4', note: 'Эсминцы, ПЛ' },
      { length: 150, label: '№5', note: 'Эсминцы, ПЛ' },
    ],
    maxShip: 'Линкор (266м — Ямато)',
  },
  {
    name: 'Йокосука',
    nameJp: '横須賀',
    type: 'naval' as const,
    slipways: [
      { length: 300, label: '№1 (большой)', note: 'Сёкаку, Синано' },
      { length: 200, label: '№2', note: 'Авианосцы, крейсеры' },
      { length: 175, label: '№3', note: 'Крейсеры' },
      { length: 175, label: '№4', note: 'Крейсеры' },
      { length: 150, label: '№5', note: 'Эсминцы' },
      { length: 150, label: '№6', note: 'Эсминцы' },
    ],
    maxShip: 'Линкор (266м)',
  },
  {
    name: 'Сасебо',
    nameJp: '佐世保',
    type: 'naval' as const,
    slipways: [
      { length: 200, label: '№1', note: 'Авианосцы, крейсеры' },
      { length: 175, label: '№2', note: 'Крейсеры' },
      { length: 150, label: '№3', note: 'Эсминцы' },
      { length: 150, label: '№4', note: 'Эсминцы' },
      { length: 150, label: '№5', note: 'Эсминцы' },
    ],
    maxShip: 'Авианосец (242м)',
  },
  {
    name: 'Майдзуру',
    nameJp: '舞鶴',
    type: 'naval' as const,
    slipways: [
      { length: 150, label: '№1', note: 'Эсминцы' },
      { length: 125, label: '№2', note: 'Эсминцы' },
      { length: 125, label: '№3', note: 'Эсминцы' },
      { length: 125, label: '№4', note: 'Эсминцы' },
      { length: 125, label: '№5', note: 'Эсминцы' },
    ],
    maxShip: 'Эсминец (120м)',
  },
  {
    name: 'Мицубиси Нагасаки',
    nameJp: '三菱長崎',
    type: 'civilian' as const,
    slipways: [
      { length: 275, label: '№2 (удлинён)', note: 'Мусаси построен здесь' },
      { length: 225, label: '№1', note: 'Авианосцы' },
      { length: 150, label: '№3', note: 'Крейсеры' },
      { length: 150, label: '№4', note: 'Крейсеры' },
      { length: 125, label: '№5-8', note: 'Эсминцы' },
    ],
    maxShip: 'Линкор (266м — Мусаси)',
  },
  {
    name: 'Кавасаки Кобе',
    nameJp: '川崎神戸',
    type: 'civilian' as const,
    slipways: [
      { length: 250, label: '№1', note: 'Дзуйкаку, Тайхо' },
      { length: 150, label: '№2', note: 'Эсминцы' },
      { length: 150, label: '№3', note: 'Эсминцы' },
      { length: 100, label: '№4-6', note: 'Подлодки' },
    ],
    maxShip: 'Авианосец (242м)',
  },
  {
    name: 'Урага',
    nameJp: '浦賀',
    type: 'civilian' as const,
    slipways: [
      { length: 150, label: '№1', note: 'Эсминцы' },
      { length: 125, label: '№2-3', note: 'Эсминцы' },
      { length: 100, label: '№4-5', note: 'Подлодки' },
    ],
    maxShip: 'Эсминец (120м)',
  },
  {
    name: 'Фудзинагата',
    nameJp: '藤永田',
    type: 'civilian' as const,
    slipways: [
      { length: 125, label: '№1-3', note: 'Эсминцы' },
    ],
    maxShip: 'Эсминец (120м)',
  },
];

// Ship length reference
const SHIP_LENGTHS: Record<string, number> = {
  battleship: 266,
  aircraft_carrier: 242,
  cruiser: 201,
  destroyer: 120,
  submarine: 110,
  auxiliary: 100,
};

interface BuildingEntry {
  ship: {
    name: string;
    nameJp: string;
    type: string;
    buildTime: number;
    icon: string;
    displacement?: number;
  };
  completionYear: number;
  completionMonth: number;
}

interface ShipyardViewProps {
  buildingShips: BuildingEntry[];
  currentYear: number;
  currentMonth: number;
  shipyards: number;
}

function ShipSVG({ progress, shipType }: { progress: number; shipType: string }) {
  return (
    <svg viewBox="0 0 240 110" className="w-full h-full">
      <rect x="0" y="90" width="240" height="20" fill="#1e3a5f" opacity="0.5" />
      <path d="M 0 95 Q 30 92 60 95 T 120 95 T 180 95 T 240 95" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="d" dur="3s" repeatCount="indefinite"
          values="M 0 95 Q 30 92 60 95 T 120 95 T 180 95 T 240 95;
                  M 0 95 Q 30 98 60 95 T 120 95 T 180 95 T 240 95;
                  M 0 95 Q 30 92 60 95 T 120 95 T 180 95 T 240 95" />
      </path>

      {progress < 95 && (
        <g opacity={0.3} stroke="#94a3b8" strokeWidth="0.5" fill="none">
          <line x1="30" y1="30" x2="30" y2="95" />
          <line x1="60" y1="25" x2="60" y2="95" />
          <line x1="120" y1="20" x2="120" y2="95" />
          <line x1="180" y1="25" x2="180" y2="95" />
          <line x1="210" y1="30" x2="210" y2="95" />
          <line x1="25" y1="50" x2="215" y2="50" />
          <line x1="25" y1="70" x2="215" y2="70" />
        </g>
      )}

      {/* Hull */}
      {progress > 5 && (
        <g style={{ opacity: Math.min(1, (progress - 5) / 15) }}>
          <path d="M 20 80 L 40 95 L 200 95 L 220 80 L 210 70 L 30 70 Z"
            fill="#4a5568" stroke="#2d3748" strokeWidth="1" />
        </g>
      )}
      {/* Deck */}
      {progress > 20 && (
        <g style={{ opacity: Math.min(1, (progress - 20) / 15) }}>
          <rect x="35" y="65" width="170" height="8" fill="#6b7280" stroke="#374151" strokeWidth="0.5" />
        </g>
      )}
      {/* Superstructure */}
      {progress > 40 && (
        <g style={{ opacity: Math.min(1, (progress - 40) / 15) }}>
          <rect x="80" y="45" width="60" height="22" fill="#6b7280" stroke="#374151" strokeWidth="0.5" />
        </g>
      )}
      {/* Bridge */}
      {progress > 55 && (
        <g style={{ opacity: Math.min(1, (progress - 55) / 15) }}>
          <rect x="90" y="30" width="40" height="18" fill="#7c8594" stroke="#374151" strokeWidth="0.5" />
          <rect x="100" y="20" width="20" height="12" fill="#8b95a5" stroke="#374151" strokeWidth="0.5" />
        </g>
      )}
      {/* Turrets */}
      {progress > 65 && (
        <g style={{ opacity: Math.min(1, (progress - 65) / 15) }}>
          <rect x="45" y="58" width="20" height="10" rx="2" fill="#555e6e" stroke="#1f2937" strokeWidth="0.5" />
          <rect x="170" y="58" width="20" height="10" rx="2" fill="#555e6e" stroke="#1f2937" strokeWidth="0.5" />
        </g>
      )}
      {/* Funnels */}
      {progress > 75 && (
        <g style={{ opacity: Math.min(1, (progress - 75) / 15) }}>
          <rect x="145" y="35" width="8" height="25" fill="#374151" stroke="#1f2937" strokeWidth="0.5" />
          <rect x="158" y="38" width="8" height="22" fill="#374151" stroke="#1f2937" strokeWidth="0.5" />
          {progress > 90 && (
            <g>
              <circle cx="149" cy="30" r="3" fill="#9ca3af" opacity="0.5">
                <animate attributeName="cy" from="30" to="10" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="162" cy="33" r="2.5" fill="#9ca3af" opacity="0.4">
                <animate attributeName="cy" from="33" to="12" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="2.5s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </g>
      )}
      {/* Masts */}
      {progress > 85 && (
        <g style={{ opacity: Math.min(1, (progress - 85) / 10) }}>
          <line x1="70" y1="20" x2="70" y2="65" stroke="#1f2937" strokeWidth="1" />
          <line x1="170" y1="25" x2="170" y2="65" stroke="#1f2937" strokeWidth="1" />
        </g>
      )}
      {/* Flag */}
      {progress > 90 && (
        <g style={{ opacity: Math.min(1, (progress - 90) / 10) }}>
          <rect x="70" y="18" width="8" height="5" fill="#dc2626" />
        </g>
      )}

      {/* Welding sparks */}
      {progress < 90 && progress > 10 && (
        <g>
          <circle cx="100" cy="65" r="1" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0;1" dur="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="55" r="0.8" fill="#f59e0b">
            <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="70" r="1.2" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0;0;1" dur="0.7s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  );
}

function getStageName(progress: number): string {
  if (progress < 15) return 'Закладка киля';
  if (progress < 30) return 'Набор корпуса';
  if (progress < 50) return 'Обшивка корпуса';
  if (progress < 65) return 'Надстройка';
  if (progress < 80) return 'Вооружение';
  if (progress < 90) return 'Оснастка';
  return 'Спуск на воду';
}

function getSlipwayForShip(shipType: string, shipyards: number): { yard: string; slipway: number } | null {
  const neededLength = SHIP_LENGTHS[shipType] || 100;
  
  // Assign to a yard that can handle this ship
  for (const yard of SHIPYARD_INFO) {
    const suitableSlipway = yard.slipways.find(s => s.length >= neededLength);
    if (suitableSlipway) {
      return { yard: yard.name, slipway: suitableSlipway.length };
    }
  }
  return null;
}

export default function ShipyardView({ buildingShips, currentYear, currentMonth, shipyards }: ShipyardViewProps) {
  const [sparkPositions, setSparkPositions] = useState<{ x: number; y: number }[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (buildingShips.length > 0) {
        setSparkPositions(
          Array.from({ length: 5 }, () => ({
            x: 20 + Math.random() * 200,
            y: 40 + Math.random() * 40,
          }))
        );
      }
    }, 200);
    return () => clearInterval(interval);
  }, [buildingShips.length]);

  const getProgress = (entry: BuildingEntry) => {
    const totalMonths = entry.ship.buildTime;
    const startTotal = (entry.completionYear * 12 + entry.completionMonth) - totalMonths;
    const currentTotal = currentYear * 12 + currentMonth;
    return Math.min(100, Math.max(0, ((currentTotal - startTotal) / totalMonths) * 100));
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header with shipyard image */}
      <div className="relative h-36 md:h-44 overflow-hidden">
        <img
          src="https://image.qwenlm.ai/generated-images/7b75d899-ab9c-474c-b51a-9d572d1a4028/_result.png"
          alt="Japanese Naval Shipyard"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-amber-400">🏗️ Верфи Императорского флота</h3>
              <div className="flex gap-3 mt-1 text-xs text-slate-300">
                <span>📅 {currentYear}/{String(currentMonth).padStart(2, '0')}</span>
                <span>🔨 {buildingShips.length}/{shipyards} стапелей занято</span>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="bg-slate-700/80 hover:bg-slate-600/80 text-amber-400 text-xs px-2 py-1 rounded cursor-pointer"
            >
              📋 Справка
            </button>
          </div>
        </div>
      </div>

      {/* Shipyard info panel */}
      {showInfo && (
        <div className="p-3 bg-slate-900/80 border-b border-slate-700">
          <h4 className="text-sm font-bold text-amber-400 mb-2">📋 Реальные стапели (1930-1941)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {SHIPYARD_INFO.map((yard) => (
              <div key={yard.name} className={`p-2 rounded text-xs ${
                yard.type === 'naval' ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-green-900/20 border border-green-800/30'
              }`}>
                <div className="font-bold text-white mb-1">
                  {yard.type === 'naval' ? '⚓' : '🏭'} {yard.name} <span className="text-amber-600">{yard.nameJp}</span>
                </div>
                <div className="text-slate-400 mb-1">Макс: {yard.maxShip}</div>
                <div className="space-y-0.5">
                  {yard.slipways.map((s, i) => (
                    <div key={i} className="flex justify-between text-slate-500">
                      <span>{s.label}</span>
                      <span className="text-amber-500">{s.length}м</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <strong>Длина кораблей:</strong> Линкор 266м (Ямато) • Авианосец 242м (Сёкаку) • Крейсер 201м (Могами) • Эсминец 120м (Кагэро) • ПЛ 110м
          </div>
        </div>
      )}

      {/* Building visualization */}
      <div className="p-3">
        {buildingShips.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <div className="text-3xl mb-2">🏗️</div>
            <p className="text-sm">Все стапели свободны. Выберите корабль для закладки.</p>
            <p className="text-xs mt-1 text-slate-600">Доступно верфей: {shipyards}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {buildingShips.map((entry, idx) => {
              const progress = getProgress(entry);
              const stage = getStageName(progress);
              const assignment = getSlipwayForShip(entry.ship.type, shipyards);

              return (
                <div key={idx} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 relative overflow-hidden">
                  {/* Assignment info */}
                  {assignment && (
                    <div className="absolute top-2 right-2 text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
                      {assignment.yard} • {assignment.slipway}м
                    </div>
                  )}

                  {/* Ship name */}
                  <div className="mb-2">
                    <span className="text-lg mr-1">{entry.ship.icon}</span>
                    <span className="font-bold text-white">{entry.ship.name}</span>
                    <span className="text-amber-600 text-sm ml-1">{entry.ship.nameJp}</span>
                  </div>

                  {/* Ship SVG */}
                  <div className="relative h-20 mb-2 bg-gradient-to-b from-slate-600/30 to-slate-800/50 rounded overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-amber-900/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4/5 h-full">
                        <ShipSVG progress={progress} shipType={entry.ship.type} />
                      </div>
                    </div>
                    {/* Sparks */}
                    {progress < 90 && progress > 5 && (
                      <div className="absolute inset-0 pointer-events-none">
                        {sparkPositions.map((pos, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                            style={{
                              left: `${(pos.x / 240) * 100}%`,
                              top: `${(pos.y / 110) * 100}%`,
                              animationDuration: `${0.3 + Math.random() * 0.5}s`,
                              opacity: Math.random() > 0.5 ? 1 : 0,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">{stage}</span>
                      <span className="text-amber-400 font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                        style={{
                          width: `${progress}%`,
                          background: progress < 30 ? 'linear-gradient(90deg, #92400e, #b45309)' :
                            progress < 70 ? 'linear-gradient(90deg, #b45309, #d97706)' :
                              'linear-gradient(90deg, #d97706, #16a34a)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Готов: {entry.completionYear}/{String(entry.completionMonth).padStart(2, '0')}</span>
                      {entry.ship.displacement && (
                        <span>{(entry.ship.displacement / 1000).toFixed(1)}к т</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
