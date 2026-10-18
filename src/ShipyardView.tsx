import { useState, useEffect } from 'react';

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

// SVG Ship parts that appear at different construction stages
function ShipSVG({ progress, shipType }: { progress: number; shipType: string }) {
  // Different ship silhouettes based on type
  const getShipShape = () => {
    switch (shipType) {
      case 'battleship':
        return (
          <g>
            {/* Hull */}
            <path d="M 20 80 L 40 95 L 200 95 L 220 80 L 210 70 L 30 70 Z" className="ship-hull" />
            {/* Deck */}
            <rect x="35" y="65" width="170" height="8" className="ship-deck" />
            {/* Superstructure */}
            <rect x="80" y="45" width="60" height="22" className="ship-super" />
            <rect x="90" y="30" width="40" height="18" className="ship-super" />
            {/* Bridge */}
            <rect x="100" y="20" width="20" height="12" className="ship-bridge" />
            {/* Main turrets */}
            <rect x="45" y="58" width="20" height="10" rx="2" className="ship-turret" />
            <rect x="170" y="58" width="20" height="10" rx="2" className="ship-turret" />
            {/* Guns */}
            <rect x="38" y="60" width="15" height="3" className="ship-gun" />
            <rect x="185" y="60" width="15" height="3" className="ship-gun" />
            {/* Funnels */}
            <rect x="145" y="35" width="8" height="25" className="ship-funnel" />
            <rect x="158" y="38" width="8" height="22" className="ship-funnel" />
            {/* Masts */}
            <line x1="70" y1="20" x2="70" y2="65" className="ship-mast" />
            <line x1="170" y1="25" x2="170" y2="65" className="ship-mast" />
          </g>
        );
      case 'aircraft_carrier':
        return (
          <g>
            {/* Hull */}
            <path d="M 15 80 L 35 95 L 210 95 L 225 80 L 215 70 L 25 70 Z" className="ship-hull" />
            {/* Flight deck */}
            <rect x="20" y="62" width="200" height="10" rx="2" className="ship-deck" />
            {/* Island superstructure */}
            <rect x="140" y="42" width="25" height="22" className="ship-super" />
            <rect x="145" y="30" width="15" height="14" className="ship-bridge" />
            {/* Funnel */}
            <rect x="155" y="35" width="10" height="20" className="ship-funnel" />
            {/* Aircraft on deck */}
            <rect x="40" y="64" width="8" height="5" className="ship-plane" />
            <rect x="55" y="64" width="8" height="5" className="ship-plane" />
            <rect x="70" y="64" width="8" height="5" className="ship-plane" />
            <rect x="85" y="64" width="8" height="5" className="ship-plane" />
            {/* Catapult */}
            <line x1="30" y1="67" x2="100" y2="67" className="ship-detail" />
          </g>
        );
      case 'cruiser':
        return (
          <g>
            {/* Hull */}
            <path d="M 25 80 L 45 92 L 195 92 L 215 80 L 205 72 L 35 72 Z" className="ship-hull" />
            {/* Deck */}
            <rect x="40" y="67" width="160" height="7" className="ship-deck" />
            {/* Superstructure */}
            <rect x="85" y="50" width="50" height="19" className="ship-super" />
            <rect x="95" y="38" width="30" height="14" className="ship-bridge" />
            {/* Turrets */}
            <rect x="50" y="60" width="15" height="8" rx="2" className="ship-turret" />
            <rect x="175" y="60" width="15" height="8" rx="2" className="ship-turret" />
            {/* Funnel */}
            <rect x="120" y="40" width="8" height="22" className="ship-funnel" />
            <rect x="132" y="42" width="8" height="20" className="ship-funnel" />
            {/* Mast */}
            <line x1="75" y1="25" x2="75" y2="67" className="ship-mast" />
          </g>
        );
      case 'destroyer':
        return (
          <g>
            {/* Hull */}
            <path d="M 35 82 L 50 92 L 190 92 L 205 82 L 195 75 L 45 75 Z" className="ship-hull" />
            {/* Deck */}
            <rect x="50" y="70" width="140" height="6" className="ship-deck" />
            {/* Superstructure */}
            <rect x="90" y="55" width="35" height="17" className="ship-super" />
            <rect x="97" y="45" width="20" height="12" className="ship-bridge" />
            {/* Torpedo tubes */}
            <rect x="65" y="68" width="12" height="4" className="ship-turret" />
            <rect x="160" y="68" width="12" height="4" className="ship-turret" />
            {/* Funnel */}
            <rect x="115" y="45" width="7" height="20" className="ship-funnel" />
            {/* Mast */}
            <line x1="80" y1="35" x2="80" y2="70" className="ship-mast" />
          </g>
        );
      case 'submarine':
        return (
          <g>
            {/* Hull */}
            <ellipse cx="120" cy="82" rx="90" ry="12" className="ship-hull" />
            {/* Conning tower */}
            <rect x="100" y="65" width="30" height="12" rx="3" className="ship-super" />
            <rect x="108" y="55" width="14" height="12" className="ship-bridge" />
            {/* Periscope */}
            <line x1="115" y1="45" x2="115" y2="55" className="ship-mast" />
            {/* Deck gun */}
            <rect x="55" y="72" width="10" height="4" className="ship-turret" />
            <rect x="48" y="73" width="8" height="2" className="ship-gun" />
            {/* Rudder */}
            <rect x="200" y="78" width="8" height="8" className="ship-detail" />
          </g>
        );
      default: // auxiliary
        return (
          <g>
            <path d="M 30 82 L 50 92 L 190 92 L 210 82 L 200 74 L 40 74 Z" className="ship-hull" />
            <rect x="45" y="69" width="150" height="7" className="ship-deck" />
            <rect x="90" y="52" width="40" height="19" className="ship-super" />
            <rect x="98" y="42" width="24" height="12" className="ship-bridge" />
            <rect x="135" y="45" width="7" height="20" className="ship-funnel" />
            <line x1="75" y1="30" x2="75" y2="69" className="ship-mast" />
          </g>
        );
    }
  };

  // Construction layers appear at different progress thresholds
  const hullVisible = progress > 5;
  const deckVisible = progress > 20;
  const superVisible = progress > 40;
  const bridgeVisible = progress > 55;
  const turretVisible = progress > 65;
  const funnelVisible = progress > 75;
  const mastVisible = progress > 85;
  const detailVisible = progress > 90;

  return (
    <svg viewBox="0 0 240 110" className="w-full h-full">
      {/* Water */}
      <rect x="0" y="90" width="240" height="20" fill="#1e3a5f" opacity="0.5" />
      <path d="M 0 95 Q 30 92 60 95 T 120 95 T 180 95 T 240 95" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="d" dur="3s" repeatCount="indefinite"
          values="M 0 95 Q 30 92 60 95 T 120 95 T 180 95 T 240 95;
                  M 0 95 Q 30 98 60 95 T 120 95 T 180 95 T 240 95;
                  M 0 95 Q 30 92 60 95 T 120 95 T 180 95 T 240 95" />
      </path>

      {/* Scaffolding (always visible during construction) */}
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

      {/* Ship parts with progressive reveal */}
      <g>
        {hullVisible && (
          <g className="ship-part" style={{ opacity: Math.min(1, (progress - 5) / 15) }}>
            <path d="M 20 80 L 40 95 L 200 95 L 220 80 L 210 70 L 30 70 Z"
              fill="#4a5568" stroke="#2d3748" strokeWidth="1" />
          </g>
        )}
        {deckVisible && (
          <g className="ship-part" style={{ opacity: Math.min(1, (progress - 20) / 15) }}>
            <rect x="35" y="65" width="170" height="8" fill="#6b7280" stroke="#374151" strokeWidth="0.5" />
          </g>
        )}
        {superVisible && (
          <g className="ship-part" style={{ opacity: Math.min(1, (progress - 40) / 15) }}>
            <rect x="80" y="45" width="60" height="22" fill="#6b7280" stroke="#374151" strokeWidth="0.5" />
          </g>
        )}
        {bridgeVisible && (
          <g className="ship-part" style={{ opacity: Math.min(1, (progress - 55) / 15) }}>
            <rect x="90" y="30" width="40" height="18" fill="#7c8594" stroke="#374151" strokeWidth="0.5" />
            <rect x="100" y="20" width="20" height="12" fill="#8b95a5" stroke="#374151" strokeWidth="0.5" />
          </g>
        )}
        {turretVisible && (
          <g className="ship-part" style={{ opacity: Math.min(1, (progress - 65) / 15) }}>
            <rect x="45" y="58" width="20" height="10" rx="2" fill="#555e6e" stroke="#1f2937" strokeWidth="0.5" />
            <rect x="170" y="58" width="20" height="10" rx="2" fill="#555e6e" stroke="#1f2937" strokeWidth="0.5" />
          </g>
        )}
        {funnelVisible && (
          <g className="ship-part" style={{ opacity: Math.min(1, (progress - 75) / 15) }}>
            <rect x="145" y="35" width="8" height="25" fill="#374151" stroke="#1f2937" strokeWidth="0.5" />
            <rect x="158" y="38" width="8" height="22" fill="#374151" stroke="#1f2937" strokeWidth="0.5" />
            {/* Smoke */}
            {progress > 90 && (
              <g className="smoke">
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
        {mastVisible && (
          <g className="ship-part" style={{ opacity: Math.min(1, (progress - 85) / 10) }}>
            <line x1="70" y1="20" x2="70" y2="65" stroke="#1f2937" strokeWidth="1" />
            <line x1="170" y1="25" x2="170" y2="65" stroke="#1f2937" strokeWidth="1" />
          </g>
        )}
        {detailVisible && (
          <g className="ship-part" style={{ opacity: Math.min(1, (progress - 90) / 10) }}>
            {/* Flag */}
            <rect x="70" y="18" width="8" height="5" fill="#dc2626" />
            <line x1="70" y1="18" x2="70" y2="23" stroke="#1f2937" strokeWidth="0.5" />
          </g>
        )}
      </g>

      {/* Welding sparks animation */}
      {progress < 90 && progress > 10 && (
        <g className="sparks">
          <circle cx={80 + Math.random() * 80} cy={60 + Math.random() * 20} r="1" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0;1" dur="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx={100 + Math.random() * 60} cy={50 + Math.random() * 25} r="0.8" fill="#f59e0b">
            <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={60 + Math.random() * 100} cy={65 + Math.random() * 15} r="1.2" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0;0;1" dur="0.7s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  );
}

// Crane animation component
function CraneSVG({ x, animating }: { x: number; animating: boolean }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      {/* Tower */}
      <rect x="0" y="10" width="6" height="80" fill="#4b5563" />
      {/* Arm */}
      <g className={animating ? 'crane-arm' : ''}>
        <rect x="-20" y="10" width="50" height="4" fill="#6b7280" />
        {/* Cable */}
        <line x1="20" y1="14" x2="20" y2="50" stroke="#9ca3af" strokeWidth="0.5" />
        {/* Hook */}
        <rect x="17" y="48" width="6" height="4" fill="#374151" />
      </g>
      {/* Base */}
      <rect x="-3" y="88" width="12" height="4" fill="#374151" />
    </g>
  );
}

export default function ShipyardView({ buildingShips, currentYear, currentMonth, shipyards }: ShipyardViewProps) {
  const [sparkPositions, setSparkPositions] = useState<{ x: number; y: number }[]>([]);

  // Regenerate spark positions periodically
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

  const getStageName = (progress: number) => {
    if (progress < 15) return 'Закладка киля';
    if (progress < 30) return 'Набор корпуса';
    if (progress < 50) return 'Обшивка корпуса';
    if (progress < 65) return 'Надстройка';
    if (progress < 80) return 'Вооружение';
    if (progress < 90) return 'Оснастка';
    return 'Спуск на воду';
  };

  // Fill empty docks
  const docks = Array.from({ length: shipyards }, (_, i) => buildingShips[i] || null);

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header with shipyard image */}
      <div className="relative h-40 md:h-48 overflow-hidden">
        <img
          src="https://image.qwenlm.ai/generated-images/7b75d899-ab9c-474c-b51a-9d572d1a4028/_result.png"
          alt="Japanese Naval Shipyard"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            🏗️ Военно-морские верфи
            <span className="text-sm text-slate-300 font-normal">
              (Курэ • Йокосука • Нагасаки • Сасебо)
            </span>
          </h3>
          <div className="flex gap-4 mt-1 text-xs text-slate-300">
            <span>📅 {currentYear}/{String(currentMonth).padStart(2, '0')}</span>
            <span>🔨 Активных стапелей: {buildingShips.length}/{shipyards}</span>
          </div>
        </div>
      </div>

      {/* Dock visualization */}
      <div className="p-4">
        {buildingShips.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-2">🏗️</div>
            <p>Все стапели свободны. Выберите корабль для закладки.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docks.map((entry, idx) => {
              if (!entry) {
                return (
                  <div key={idx} className="bg-slate-700/30 border border-slate-700 rounded-lg p-3">
                    <div className="text-center text-slate-600 py-8">
                      <div className="text-2xl mb-1">⬜</div>
                      <p className="text-xs">Стапель #{idx + 1} — Свободен</p>
                    </div>
                  </div>
                );
              }

              const progress = getProgress(entry);
              const stage = getStageName(progress);

              return (
                <div key={idx} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 relative overflow-hidden">
                  {/* Dock number */}
                  <div className="absolute top-2 right-2 text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
                    Стапель #{idx + 1}
                  </div>

                  {/* Ship name */}
                  <div className="mb-2">
                    <span className="text-lg mr-1">{entry.ship.icon}</span>
                    <span className="font-bold text-white">{entry.ship.name}</span>
                    <span className="text-amber-600 text-sm ml-1">{entry.ship.nameJp}</span>
                  </div>

                  {/* Ship SVG with animation */}
                  <div className="relative h-24 mb-2 bg-gradient-to-b from-slate-600/30 to-slate-800/50 rounded overflow-hidden">
                    {/* Dock floor */}
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-900/40 to-transparent" />

                    {/* Cranes */}
                    <svg viewBox="0 0 240 100" className="absolute inset-0 w-full h-full">
                      <CraneSVG x={10} animating={progress < 80} />
                      <CraneSVG x={220} animating={progress < 80} />
                    </svg>

                    {/* Ship */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4/5 h-full">
                        <ShipSVG progress={progress} shipType={entry.ship.type} />
                      </div>
                    </div>

                    {/* Welding sparks overlay */}
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

                  {/* Progress info */}
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
                        {/* Shimmer effect */}
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
