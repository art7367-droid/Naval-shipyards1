import { useState } from 'react';

export default function YokosukaCrossSection() {
  const [showDimensions, setShowDimensions] = useState(true);
  const [selectedView, setSelectedView] = useState<'slipway' | 'drydock'>('drydock');

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-amber-400">
          📐 Поперечное сечение верфи Йокосука
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('drydock')}
            className={`px-3 py-1 rounded text-xs cursor-pointer ${
              selectedView === 'drydock' ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Сухой док №6
          </button>
          <button
            onClick={() => setSelectedView('slipway')}
            className={`px-3 py-1 rounded text-xs cursor-pointer ${
              selectedView === 'slipway' ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Стапель
          </button>
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className="px-3 py-1 rounded text-xs cursor-pointer bg-blue-700 hover:bg-blue-600 text-white"
          >
            {showDimensions ? 'Скрыть' : 'Показать'} размеры
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
        <svg viewBox="0 0 800 500" className="w-full h-auto">
          {/* Фон */}
          <rect x="0" y="0" width="800" height="500" fill="#1e293b" />

          {selectedView === 'drydock' ? (
            // ============ СУХОЙ ДОК №6 ============
            <g>
              {/* Заголовок */}
              <text x="400" y="25" fill="#fbbf24" fontSize="16" fontWeight="bold" textAnchor="middle">
                СУХОЙ ДОК №6 — Поперечное сечение
              </text>
              <text x="400" y="45" fill="#94a3b8" fontSize="12" textAnchor="middle">
                Длина: 330м | Ширина: 62м | Глубина: 18м
              </text>

              {/* Земля/бетон по бокам */}
              <rect x="50" y="100" width="150" height="350" fill="#78716c" />
              <rect x="600" y="100" width="150" height="350" fill="#78716c" />

              {/* Бетонные стены дока */}
              <rect x="200" y="100" width="30" height="350" fill="#64748b" stroke="#475569" strokeWidth="2" />
              <rect x="570" y="100" width="30" height="350" fill="#64748b" stroke="#475569" strokeWidth="2" />

              {/* Дно дока */}
              <rect x="230" y="420" width="340" height="30" fill="#64748b" stroke="#475569" strokeWidth="2" />

              {/* Внутренняя часть дока (пустая когда сухо) */}
              <rect x="230" y="100" width="340" height="320" fill="#0f172a" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />

              {/* Кессонные камеры (боковые) */}
              <rect x="205" y="150" width="20" height="60" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="1" />
              <rect x="575" y="150" width="20" height="60" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="1" />
              <text x="215" y="185" fill="#60a5fa" fontSize="8" textAnchor="middle">Кессон</text>
              <text x="585" y="185" fill="#60a5fa" fontSize="8" textAnchor="middle">Кессон</text>

              {/* Кильблоки (опоры для корабля) */}
              {[280, 320, 360, 400, 440, 480, 520].map((x, i) => (
                <g key={i}>
                  <rect x={x} y="410" width="15" height="10" fill="#92400e" stroke="#78350f" strokeWidth="1" />
                  <text x={x + 7.5} y="405" fill="#d97706" fontSize="7" textAnchor="middle">▲</text>
                </g>
              ))}
              <text x="400" y="440" fill="#94a3b8" fontSize="9" textAnchor="middle">Кильблоки (опоры корабля)</text>

              {/* Корабль в доке (линкор Ямато) */}
              <g>
                {/* Корпус */}
                <path
                  d="M 260 380 L 280 410 L 520 410 L 540 380 L 530 350 L 270 350 Z"
                  fill="#4a5568"
                  stroke="#2d3748"
                  strokeWidth="2"
                />
                {/* Палуба */}
                <rect x="275" y="340" width="250" height="15" fill="#6b7280" stroke="#374151" strokeWidth="1" />
                {/* Надстройка */}
                <rect x="350" y="300" width="100" height="45" fill="#6b7280" stroke="#374151" strokeWidth="1" />
                <rect x="370" y="270" width="60" height="35" fill="#7c8594" stroke="#374151" strokeWidth="1" />
                {/* Башни */}
                <rect x="290" y="330" width="30" height="15" rx="3" fill="#555e6e" stroke="#1f2937" strokeWidth="1" />
                <rect x="480" y="330" width="30" height="15" rx="3" fill="#555e6e" stroke="#1f2937" strokeWidth="1" />
                {/* Трубы */}
                <rect x="420" y="280" width="12" height="35" fill="#374151" stroke="#1f2937" strokeWidth="1" />
                <rect x="435" y="285" width="12" height="30" fill="#374151" stroke="#1f2937" strokeWidth="1" />

                <text x="400" y="395" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">
                  ЛИНКОР «ЯМАТО»
                </text>
              </g>

              {/* Ворота дока (кессон) */}
              <rect x="230" y="90" width="340" height="15" fill="#dc2626" opacity="0.7" stroke="#991b1b" strokeWidth="2" />
              <text x="400" y="85" fill="#fca5a5" fontSize="10" textAnchor="middle">ЗАТВОР (КЕССОН)</text>

              {/* Насосная система */}
              <circle cx="180" cy="300" r="15" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
              <text x="180" y="305" fill="#93c5fd" fontSize="8" textAnchor="middle">НАСОС</text>
              <line x1="195" y1="300" x2="230" y2="300" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />

              {/* Размерные линии */}
              {showDimensions && (
                <g>
                  {/* Ширина верха */}
                  <line x1="200" y1="70" x2="600" y2="70" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="200" y1="65" x2="200" y2="75" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="600" y1="65" x2="600" y2="75" stroke="#fbbf24" strokeWidth="1" />
                  <text x="400" y="65" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">62м</text>

                  {/* Ширина дна */}
                  <line x1="230" y1="460" x2="570" y2="460" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="230" y1="455" x2="230" y2="465" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="570" y1="455" x2="570" y2="465" stroke="#fbbf24" strokeWidth="1" />
                  <text x="400" y="475" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">~50м (дно)</text>

                  {/* Глубина */}
                  <line x1="650" y1="100" x2="650" y2="420" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="645" y1="100" x2="655" y2="100" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="645" y1="420" x2="655" y2="420" stroke="#fbbf24" strokeWidth="1" />
                  <text x="670" y="265" fill="#fbbf24" fontSize="12" fontWeight="bold" transform="rotate(90 670 265)">18м</text>

                  {/* Уровень воды */}
                  <line x1="150" y1="100" x2="650" y2="100" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" />
                  <text x="140" y="105" fill="#60a5fa" fontSize="9" textAnchor="end">Уровень воды</text>
                </g>
              )}

              {/* Подписи */}
              <text x="125" y="250" fill="#d6d3d1" fontSize="10" textAnchor="middle" transform="rotate(-90 125 250)">
                БЕТОННАЯ СТЕНА
              </text>
              <text x="675" y="250" fill="#d6d3d1" fontSize="10" textAnchor="middle" transform="rotate(90 675 250)">
                БЕТОННАЯ СТЕНА
              </text>
            </g>
          ) : (
            // ============ СТАПЕЛЬ ============
            <g>
              {/* Заголовок */}
              <text x="400" y="25" fill="#fbbf24" fontSize="16" fontWeight="bold" textAnchor="middle">
                БОЛЬШОЙ СТАПЕЛЬ №1 — Поперечное сечение
              </text>
              <text x="400" y="45" fill="#94a3b8" fontSize="12" textAnchor="middle">
                Длина: 300м | Ширина: ~45м | Уклон: 1:10
              </text>

              {/* Земля/бетон по бокам */}
              <rect x="50" y="150" width="150" height="300" fill="#78716c" />
              <rect x="600" y="150" width="150" height="300" fill="#78716c" />

              {/* Наклонная платформа стапеля */}
              <path
                d="M 200 200 L 600 350 L 600 400 L 200 250 Z"
                fill="#64748b"
                stroke="#475569"
                strokeWidth="2"
              />

              {/* Рельсы */}
              <line x1="220" y1="210" x2="580" y2="355" stroke="#1f2937" strokeWidth="3" />
              <line x1="240" y1="215" x2="590" y2="358" stroke="#1f2937" strokeWidth="3" />
              <line x1="560" y1="215" x2="580" y2="355" stroke="#1f2937" strokeWidth="3" />
              <line x1="570" y1="218" x2="590" y2="358" stroke="#1f2937" strokeWidth="3" />

              {/* Корабль на стапеле (в процессе постройки) */}
              <g>
                {/* Корпус (частично построен) */}
                <path
                  d="M 250 180 L 270 220 L 530 330 L 550 290 L 540 260 L 260 150 Z"
                  fill="#4a5568"
                  stroke="#2d3748"
                  strokeWidth="2"
                  opacity="0.8"
                />
                {/* Леса/подмостки */}
                <line x1="280" y1="140" x2="280" y2="230" stroke="#92400e" strokeWidth="1" />
                <line x1="350" y1="170" x2="350" y2="270" stroke="#92400e" strokeWidth="1" />
                <line x1="420" y1="200" x2="420" y2="310" stroke="#92400e" strokeWidth="1" />
                <line x1="490" y1="230" x2="490" y2="340" stroke="#92400e" strokeWidth="1" />
                
                <text x="400" y="260" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(20 400 260)">
                  КОРАБЛЬ НА ПОСТРОЙКЕ
                </text>
              </g>

              {/* Вода (куда спускается корабль) */}
              <path
                d="M 600 350 L 750 350 L 750 450 L 600 450 Z"
                fill="#1e3a5f"
                opacity="0.6"
              />
              <text x="675" y="400" fill="#60a5fa" fontSize="10" textAnchor="middle">ВОДА</text>

              {/* Размерные линии */}
              {showDimensions && (
                <g>
                  {/* Длина стапеля (показана как наклон) */}
                  <line x1="200" y1="180" x2="600" y2="330" stroke="#fbbf24" strokeWidth="1" />
                  <text x="400" y="170" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">
                    300м (длина стапеля)
                  </text>

                  {/* Уклон */}
                  <line x1="620" y1="350" x2="620" y2="400" stroke="#fbbf24" strokeWidth="1" />
                  <text x="640" y="380" fill="#fbbf24" fontSize="10" fontWeight="bold">
                    Уклон 1:10
                  </text>

                  {/* Ширина */}
                  <line x1="200" y1="420" x2="600" y2="420" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="200" y1="415" x2="200" y2="425" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="600" y1="415" x2="600" y2="425" stroke="#fbbf24" strokeWidth="1" />
                  <text x="400" y="440" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">
                    ~45м (ширина)
                  </text>
                </g>
              )}

              {/* Подписи */}
              <text x="125" y="300" fill="#d6d3d1" fontSize="10" textAnchor="middle" transform="rotate(-90 125 300)">
                БЕРЕГОВАЯ ОПОРНАЯ СТЕНА
              </text>
              <text x="675" y="300" fill="#d6d3d1" fontSize="10" textAnchor="middle" transform="rotate(90 675 300)">
                НАКЛОННАЯ ПЛАТФОРМА
              </text>

              {/* Стрелка спуска */}
              <path
                d="M 500 280 L 550 320 L 540 315 M 550 320 L 545 310"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              />
              <text x="520" y="300" fill="#fca5a5" fontSize="9" fontWeight="bold">
                СПУСК
              </text>
            </g>
          )}

          {/* Масштабная линейка */}
          <g transform="translate(50, 480)">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#94a3b8" strokeWidth="2" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" strokeWidth="2" />
            <line x1="100" y1="-5" x2="100" y2="5" stroke="#94a3b8" strokeWidth="2" />
            <text x="50" y="-10" fill="#94a3b8" fontSize="10" textAnchor="middle">50м</text>
          </g>
        </svg>
      </div>

      {/* Техническая информация */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
          <h4 className="text-sm font-bold text-amber-400 mb-2">
            {selectedView === 'drydock' ? '🏗️ Сухой док №6' : '🏗️ Большой стапель №1'}
          </h4>
          <div className="space-y-1 text-xs text-slate-300">
            {selectedView === 'drydock' ? (
              <>
                <div><span className="text-slate-400">Длина:</span> <span className="text-white font-bold">330м</span></div>
                <div><span className="text-slate-400">Ширина:</span> <span className="text-white font-bold">62м</span></div>
                <div><span className="text-slate-400">Глубина:</span> <span className="text-white font-bold">18м</span></div>
                <div><span className="text-slate-400">Конструкция:</span> <span className="text-white">Железобетон</span></div>
                <div><span className="text-slate-400">Ворота:</span> <span className="text-white">Кессонного типа</span></div>
                <div><span className="text-slate-400">Насосы:</span> <span className="text-white">4 мощных насоса</span></div>
                <div><span className="text-slate-400">Назначение:</span> <span className="text-white">Ремонт линкоров</span></div>
              </>
            ) : (
              <>
                <div><span className="text-slate-400">Длина:</span> <span className="text-white font-bold">300м</span></div>
                <div><span className="text-slate-400">Ширина:</span> <span className="text-white font-bold">~45м</span></div>
                <div><span className="text-slate-400">Уклон:</span> <span className="text-white font-bold">1:10 (10°)</span></div>
                <div><span className="text-slate-400">Конструкция:</span> <span className="text-white">Стальная платформа</span></div>
                <div><span className="text-slate-400">Рельсы:</span> <span className="text-white">4 параллельных пути</span></div>
                <div><span className="text-slate-400">Назначение:</span> <span className="text-white">Постройка линкоров</span></div>
                <div><span className="text-slate-400">Спуск:</span> <span className="text-white">Скольжением в воду</span></div>
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
          <h4 className="text-sm font-bold text-amber-400 mb-2">📋 Историческая справка</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedView === 'drydock' ? (
              <>
                Сухой док №6 верфи Йокосука — крупнейший в Японии (1940). 
                Построен специально для обслуживания линкоров типа «Ямато». 
                Здесь ремонтировался «Синано» после переделки из линкора в авианосец. 
                Кессонные ворота позволяли быстро герметизировать док для откачки воды.
              </>
            ) : (
              <>
                Большой стапель №1 верфи Йокосука использовался для постройки линкоров. 
                Здесь заложен линкор «Синано» (№110) в мае 1940. 
                Наклонная конструкция позволяла спускать готовые корабли скольжением в воду. 
                Рельсовые пути обеспечивали точное позиционирование секций корпуса.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
