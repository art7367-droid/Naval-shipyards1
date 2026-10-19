import { useState } from 'react';

interface SlipwayInfo {
  id: string;
  label: string;
  length: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  note: string;
  color: string;
}

export default function YokosukaShipyardMap() {
  const [selectedSlipway, setSelectedSlipway] = useState<SlipwayInfo | null>(null);

  // Схема верфи Йокосука (упрощённая, но пропорциональная)
  const slipways: SlipwayInfo[] = [
    {
      id: 'yoko-1',
      label: 'Большой стапель',
      length: 300,
      x: 150,
      y: 180,
      width: 180,
      height: 25,
      note: 'Линкоры (до 266м). Здесь строились «Синано», «Ямато» (№111)',
      color: '#dc2626', // красный для линкоров
    },
    {
      id: 'yoko-2',
      label: 'Стапель №2',
      length: 200,
      x: 150,
      y: 220,
      width: 120,
      height: 20,
      note: 'Авианосцы, крейсеры. Здесь строился «Хирю»',
      color: '#2563eb', // синий для авианосцев
    },
    {
      id: 'yoko-3',
      label: 'Стапель №3',
      length: 175,
      x: 150,
      y: 255,
      width: 105,
      height: 18,
      note: 'Крейсеры',
      color: '#16a34a', // зелёный для крейсеров
    },
    {
      id: 'yoko-4',
      label: 'Стапель №4',
      length: 175,
      x: 150,
      y: 285,
      width: 105,
      height: 18,
      note: 'Крейсеры',
      color: '#16a34a',
    },
    {
      id: 'yoko-5',
      label: 'Стапель №5',
      length: 150,
      x: 150,
      y: 320,
      width: 90,
      height: 16,
      note: 'Эсминцы',
      color: '#ca8a04', // жёлтый для эсминцев
    },
    {
      id: 'yoko-6',
      label: 'Стапель №6',
      length: 150,
      x: 150,
      y: 350,
      width: 90,
      height: 16,
      note: 'Эсминцы',
      color: '#ca8a04',
    },
  ];

  // Сухой док №6 (огромный)
  const dryDock = {
    x: 380,
    y: 200,
    width: 200,
    height: 40,
    note: 'Сухой док №6: 330м × 62м × 18м — крупнейший в Японии!',
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-amber-400">
          🏗️ Верфь Йокосука <span className="text-sm text-amber-600">横須賀海軍工廠</span>
        </h3>
        <div className="text-xs text-slate-400">
          Масштаб: 1 клетка ≈ 50м
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG карта */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 rounded-lg overflow-hidden border border-slate-600">
          <svg viewBox="0 0 600 450" className="w-full h-auto">
            {/* Фон — вода */}
            <rect x="0" y="0" width="600" height="450" fill="#1e3a5f" />
            
            {/* Береговая линия */}
            <path
              d="M 0 150 Q 100 140 150 150 L 150 400 L 0 400 Z"
              fill="#78716c"
              stroke="#57534e"
              strokeWidth="2"
            />
            
            {/* Текст "БЕРЕГ" */}
            <text x="50" y="250" fill="#a8a29e" fontSize="16" fontWeight="bold" transform="rotate(-90 50 250)">
              БЕРЕГ
            </text>

            {/* Волны */}
            <g opacity="0.3">
              <path d="M 200 100 Q 250 95 300 100 T 400 100" fill="none" stroke="#60a5fa" strokeWidth="1" />
              <path d="M 250 130 Q 300 125 350 130 T 450 130" fill="none" stroke="#60a5fa" strokeWidth="1" />
              <path d="M 300 380 Q 350 375 400 380 T 500 380" fill="none" stroke="#60a5fa" strokeWidth="1" />
            </g>

            {/* Здания верфи */}
            <rect x="80" y="160" width="60" height="40" fill="#57534e" stroke="#44403c" strokeWidth="1" />
            <text x="110" y="185" fill="#d6d3d1" fontSize="10" textAnchor="middle">Цех</text>

            <rect x="80" y="210" width="50" height="30" fill="#57534e" stroke="#44403c" strokeWidth="1" />
            <text x="105" y="230" fill="#d6d3d1" fontSize="9" textAnchor="middle">Мастерская</text>

            {/* Стапели */}
            {slipways.map((slipway) => (
              <g
                key={slipway.id}
                onClick={() => setSelectedSlipway(slipway)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {/* Основание стапеля */}
                <rect
                  x={slipway.x}
                  y={slipway.y}
                  width={slipway.width}
                  height={slipway.height}
                  fill={slipway.color}
                  opacity="0.7"
                  stroke="#fff"
                  strokeWidth="1"
                />
                
                {/* Рельсы */}
                <line
                  x1={slipway.x}
                  y1={slipway.y + 5}
                  x2={slipway.x + slipway.width}
                  y2={slipway.y + 5}
                  stroke="#000"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
                <line
                  x1={slipway.x}
                  y1={slipway.y + slipway.height - 5}
                  x2={slipway.x + slipway.width}
                  y2={slipway.y + slipway.height - 5}
                  stroke="#000"
                  strokeWidth="0.5"
                  opacity="0.5"
                />

                {/* Подпись */}
                <text
                  x={slipway.x + slipway.width + 5}
                  y={slipway.y + slipway.height / 2 + 3}
                  fill="#fff"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {slipway.label} ({slipway.length}м)
                </text>

                {/* Выделение при выборе */}
                {selectedSlipway?.id === slipway.id && (
                  <rect
                    x={slipway.x - 2}
                    y={slipway.y - 2}
                    width={slipway.width + 4}
                    height={slipway.height + 4}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
              </g>
            ))}

            {/* Сухой док */}
            <g>
              <rect
                x={dryDock.x}
                y={dryDock.y}
                width={dryDock.width}
                height={dryDock.height}
                fill="#7c2d12"
                opacity="0.8"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="8,4"
              />
              <text
                x={dryDock.x + dryDock.width / 2}
                y={dryDock.y + dryDock.height / 2 + 5}
                fill="#fbbf24"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                СУХОЙ ДОК №6 (330м)
              </text>
            </g>

            {/* Компас */}
            <g transform="translate(520, 50)">
              <circle cx="0" cy="0" r="25" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <text x="0" y="-15" fill="#94a3b8" fontSize="10" textAnchor="middle">N</text>
              <text x="0" y="20" fill="#94a3b8" fontSize="10" textAnchor="middle">S</text>
              <text x="-18" y="5" fill="#94a3b8" fontSize="10" textAnchor="middle">W</text>
              <text x="18" y="5" fill="#94a3b8" fontSize="10" textAnchor="middle">E</text>
              <line x1="0" y1="-20" x2="0" y2="20" stroke="#64748b" strokeWidth="1" />
              <line x1="-20" y1="0" x2="20" y2="0" stroke="#64748b" strokeWidth="1" />
            </g>

            {/* Легенда */}
            <g transform="translate(450, 380)">
              <rect x="0" y="0" width="140" height="60" fill="#0f172a" opacity="0.8" rx="4" />
              <text x="10" y="15" fill="#94a3b8" fontSize="10" fontWeight="bold">Легенда:</text>
              <rect x="10" y="22" width="15" height="8" fill="#dc2626" />
              <text x="30" y="29" fill="#94a3b8" fontSize="9">Линкоры</text>
              <rect x="10" y="34" width="15" height="8" fill="#2563eb" />
              <text x="30" y="41" fill="#94a3b8" fontSize="9">Авианосцы</text>
              <rect x="10" y="46" width="15" height="8" fill="#16a34a" />
              <text x="30" y="53" fill="#94a3b8" fontSize="9">Крейсеры</text>
              <rect x="80" y="22" width="15" height="8" fill="#ca8a04" />
              <text x="100" y="29" fill="#94a3b8" fontSize="9">Эсминцы</text>
            </g>
          </svg>
        </div>

        {/* Информационная панель */}
        <div className="space-y-3">
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
            <h4 className="text-sm font-bold text-amber-400 mb-2">📊 Характеристики верфи</h4>
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Всего стапелей:</span>
                <span className="text-white font-bold">6</span>
              </div>
              <div className="flex justify-between">
                <span>Макс. длина:</span>
                <span className="text-white font-bold">300м</span>
              </div>
              <div className="flex justify-between">
                <span>Сухой док:</span>
                <span className="text-white font-bold">330м × 62м</span>
              </div>
              <div className="flex justify-between">
                <span>Скорость:</span>
                <span className="text-white font-bold">×1.0</span>
              </div>
            </div>
          </div>

          {selectedSlipway ? (
            <div className="bg-slate-800/60 border-2 border-amber-600 rounded-lg p-3">
              <h4 className="text-sm font-bold text-amber-400 mb-2">
                📍 {selectedSlipway.label}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Длина:</span>
                  <span className="text-white font-bold">{selectedSlipway.length}м</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Может строить:</span>
                  <span className="text-white font-bold">
                    {selectedSlipway.length >= 300 ? 'Линкоры' :
                     selectedSlipway.length >= 200 ? 'Авианосцы' :
                     selectedSlipway.length >= 175 ? 'Крейсеры' : 'Эсминцы'}
                  </span>
                </div>
                <div className="mt-2 p-2 bg-slate-700/50 rounded">
                  <p className="text-slate-300">{selectedSlipway.note}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400 text-center">
                👆 Кликните на стапель для подробной информации
              </p>
            </div>
          )}

          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
            <h4 className="text-sm font-bold text-amber-400 mb-2">🏛️ Историческая справка</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Верфь Йокосука — одна из четырёх главных военно-морских верфей Японии. 
              Здесь были построены авианосцы «Сёкаку», «Хирю», линкор «Синано». 
              Сухой док №6 (330м) — крупнейший в Японии, мог обслуживать линкоры типа «Ямато».
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
