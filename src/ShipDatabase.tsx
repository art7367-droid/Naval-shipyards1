import { useState } from 'react';
import { shipsDatabase, getShipsByType, getShipsByProgram, searchShips } from './ships';

interface ShipDatabaseProps {
  onClose: () => void;
}

export default function ShipDatabase({ onClose }: ShipDatabaseProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const types = [
    { id: 'all', name: 'Все типы', icon: '📋' },
    { id: 'battleship', name: 'Линкоры', icon: '⚓' },
    { id: 'aircraft_carrier', name: 'Авианосцы', icon: '🛩️' },
    { id: 'cruiser', name: 'Крейсеры', icon: '🚢' },
    { id: 'destroyer', name: 'Эсминцы', icon: '🔹' },
    { id: 'submarine', name: 'Подлодки', icon: '🔻' },
    { id: 'auxiliary', name: 'Вспомогательные', icon: '🛡️' },
  ];

  const programs = [
    { id: 'all', name: 'Все программы' },
    { id: 'マル①', name: 'Мару-1 (1931)' },
    { id: 'マル②', name: 'Мару-2 (1934)' },
    { id: 'マル③', name: 'Мару-3 (1937)' },
    { id: 'マル④', name: 'Мару-4 (1939)' },
    { id: 'マル凛', name: 'Мару-Рин (1940)' },
    { id: 'マル級', name: 'Мару-Кю (1941)' },
  ];

  // Фильтрация кораблей
  let filteredShips = shipsDatabase;

  if (selectedType !== 'all') {
    filteredShips = filteredShips.filter(ship => ship.type === selectedType);
  }

  if (selectedProgram !== 'all') {
    filteredShips = filteredShips.filter(ship => ship.program === selectedProgram);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredShips = filteredShips.filter(ship =>
      ship.name.toLowerCase().includes(query) ||
      ship.nameJp.includes(query) ||
      ship.class.toLowerCase().includes(query) ||
      ship.description.toLowerCase().includes(query)
    );
  }

  const getTypeName = (type: string): string => {
    const names: Record<string, string> = {
      battleship: 'Линкор',
      aircraft_carrier: 'Авианосец',
      cruiser: 'Крейсер',
      destroyer: 'Эсминец',
      submarine: 'Подлодка',
      auxiliary: 'Вспом.',
    };
    return names[type] || type;
  };

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      battleship: '⚓',
      aircraft_carrier: '🛩️',
      cruiser: '🚢',
      destroyer: '🔹',
      submarine: '🔻',
      auxiliary: '🛡️',
    };
    return icons[type] || '🚢';
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-cyan-600 rounded-xl max-w-7xl w-full my-8">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-cyan-400">📊 База данных кораблей</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl cursor-pointer">✕</button>
        </div>

        <div className="p-4">
          {/* Панель фильтров */}
          <div className="mb-4 space-y-3">
            {/* Поиск */}
            <div>
              <input
                type="text"
                placeholder="🔍 Поиск по названию, классу или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Фильтр по типу */}
            <div>
              <div className="text-xs text-slate-400 mb-2">Тип корабля:</div>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-all ${
                      selectedType === type.id
                        ? 'bg-cyan-700 text-white font-bold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {type.icon} {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Фильтр по программе */}
            <div>
              <div className="text-xs text-slate-400 mb-2">Программа:</div>
              <div className="flex flex-wrap gap-2">
                {programs.map(prog => (
                  <button
                    key={prog.id}
                    onClick={() => setSelectedProgram(prog.id)}
                    className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-all ${
                      selectedProgram === prog.id
                        ? 'bg-cyan-700 text-white font-bold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {prog.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="mb-4 bg-slate-800/60 border border-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-slate-400">Найдено кораблей: <span className="text-white font-bold">{filteredShips.length}</span></div>
              </div>
            </div>
          </div>

          {/* Таблица кораблей */}
          <div className="overflow-x-auto border border-slate-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-cyan-400 font-bold border-b border-slate-700">Тип</th>
                  <th className="px-3 py-2 text-left text-cyan-400 font-bold border-b border-slate-700">Название</th>
                  <th className="px-3 py-2 text-left text-cyan-400 font-bold border-b border-slate-700">Класс</th>
                  <th className="px-3 py-2 text-right text-cyan-400 font-bold border-b border-slate-700">Водоизм. (т)</th>
                  <th className="px-3 py-2 text-right text-cyan-400 font-bold border-b border-slate-700">Длина (м)</th>
                  <th className="px-3 py-2 text-right text-cyan-400 font-bold border-b border-slate-700">Скорость (уз)</th>
                  <th className="px-3 py-2 text-right text-cyan-400 font-bold border-b border-slate-700">Огневая мощь</th>
                  <th className="px-3 py-2 text-right text-cyan-400 font-bold border-b border-slate-700">Броня</th>
                  <th className="px-3 py-2 text-right text-cyan-400 font-bold border-b border-slate-700">Цена (¥M)</th>
                  <th className="px-3 py-2 text-center text-cyan-400 font-bold border-b border-slate-700">Верфь</th>
                  <th className="px-3 py-2 text-center text-cyan-400 font-bold border-b border-slate-700">Программа</th>
                </tr>
              </thead>
              <tbody>
                {filteredShips.map((ship, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 border-b border-slate-700/50">
                    <td className="px-3 py-2 text-slate-300">{getTypeIcon(ship.type)} {getTypeName(ship.type)}</td>
                    <td className="px-3 py-2">
                      <div className="text-white font-medium">{ship.name}</div>
                      <div className="text-xs text-amber-600">{ship.nameJp}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-300 text-xs">{ship.class}</td>
                    <td className="px-3 py-2 text-right text-white font-mono">{ship.displacement.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-white font-mono">{ship.length}</td>
                    <td className="px-3 py-2 text-right text-blue-400 font-mono">{ship.speed}</td>
                    <td className="px-3 py-2 text-right text-red-400 font-mono">{ship.firepower}</td>
                    <td className="px-3 py-2 text-right text-green-400 font-mono">{ship.armor}</td>
                    <td className="px-3 py-2 text-right text-green-400 font-mono">{ship.cost}</td>
                    <td className="px-3 py-2 text-center text-slate-400 text-xs">{ship.historicalYard}</td>
                    <td className="px-3 py-2 text-center text-amber-400 text-xs">{ship.program}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Легенда */}
          <div className="mt-4 text-xs text-slate-500">
            <div className="mb-1"><strong className="text-slate-400">Источники:</strong> USNI Proceedings, CombinedFleet.com, Navypedia.org, Wikipedia</div>
            <div><strong className="text-slate-400">Примечание:</strong> Все данные основаны на исторических источниках. Цены указаны в миллионах японских иен (¥M).</div>
          </div>
        </div>
      </div>
    </div>
  );
}
