import { useState } from 'react';
import { historicalLaydowns } from './historicalData';

interface ShipData {
  type: string;
  name: string;
  cost: number;
  yard: string;
  slipway: string;
  laidDown: string;
  completed: string;
  program: string;
}

const programs = [
  { id: 'all', name: 'Все программы', nameJp: '' },
  { id: 'maru1', name: 'Мару-1', nameJp: '第一次補充計画 (1931)' },
  { id: 'maru2', name: 'Мару-2', nameJp: '第二次補充計画 (1934)' },
  { id: 'maru3', name: 'Мару-3', nameJp: '第三次補充計画 (1937)' },
  { id: 'maru4', name: 'Мару-4', nameJp: '第四次補充計画 (1939)' },
  { id: 'marurin', name: 'Мару-Рин', nameJp: '臨時軍事補充計画 (1940)' },
  { id: 'marukyuu', name: 'Мару-Кю', nameJp: '緊急軍事補充計画 (1941)' },
];

// Данные о кораблях (из shipTemplates и historicalData)
const shipsData: ShipData[] = [
  // Мару-1 (1931)
  { type: '🚢 Крейсер', name: 'Могами', cost: 26, yard: 'Курэ', slipway: 'Большой (300м)', laidDown: '27.10.1931', completed: '07.1935', program: 'maru1' },
  { type: '🚢 Крейсер', name: 'Микума', cost: 26, yard: 'Нагасаки', slipway: 'Большой (275м)', laidDown: '24.12.1931', completed: '08.1935', program: 'maru1' },
  { type: '🔹 Эсминец', name: 'Хатсухару', cost: 8, yard: 'Сасебо', slipway: '№1 (200м)', laidDown: '14.05.1931', completed: '09.1933', program: 'maru1' },
  { type: '🔹 Эсминец', name: 'Сирацую', cost: 8, yard: 'Сасебо', slipway: '№2 (175м)', laidDown: '14.11.1933', completed: '09.1936', program: 'maru1' },
  { type: '🔻 Подлодка', name: 'I-6 (Junsen II)', cost: 15, yard: 'Кавасаки', slipway: 'Большой (250м)', laidDown: '11.1931', completed: '10.1935', program: 'maru1' },
  { type: '🔻 Подлодка', name: 'Кайдай VI', cost: 12, yard: 'Кавасаки', slipway: '№2 (150м)', laidDown: '12.1931', completed: '12.1935', program: 'maru1' },
  { type: '🔻 Подлодка', name: 'Ro-33', cost: 8, yard: 'Кавасаки', slipway: '№3 (150м)', laidDown: '06.1932', completed: '05.1936', program: 'maru1' },
  
  // Мару-2 (1934)
  { type: '🚢 Крейсер', name: 'Тоне', cost: 35, yard: 'Нагасаки', slipway: 'Большой (275м)', laidDown: '01.12.1934', completed: '11.1938', program: 'maru2' },
  { type: '🚢 Крейсер', name: 'Тикума', cost: 35, yard: 'Нагасаки', slipway: '№2 (225м)', laidDown: '10.1935', completed: '05.1939', program: 'maru2' },
  { type: '🛩️ Авианосец', name: 'Сорю', cost: 40, yard: 'Курэ', slipway: '№2 (225м)', laidDown: '20.11.1934', completed: '12.1937', program: 'maru2' },
  { type: '🛩️ Авианосец', name: 'Хирю', cost: 40, yard: 'Йокосука', slipway: '№2 (200м)', laidDown: '07.1936', completed: '07.1939', program: 'maru2' },
  { type: '🔹 Эсминец', name: 'Асасио', cost: 12, yard: 'Сасебо', slipway: '№1 (200м)', laidDown: '09.1935', completed: '08.1937', program: 'maru2' },
  { type: '🔻 Подлодка', name: 'Junsen III (I-7)', cost: 16, yard: 'Кавасаки', slipway: 'Большой (250м)', laidDown: '10.1934', completed: '10.1937', program: 'maru2' },
  
  // Мару-3 (1937)
  { type: '⚓ Линкор', name: 'Ямато', cost: 138, yard: 'Курэ', slipway: 'Большой (300м)', laidDown: '04.08.1937', completed: '12.1941', program: 'maru3' },
  { type: '⚓ Линкор', name: 'Мусаси', cost: 138, yard: 'Нагасаки', slipway: 'Большой (295м)', laidDown: '29.03.1939', completed: '06.1942', program: 'maru3' },
  { type: '🛩️ Авианосец', name: 'Сёкаку', cost: 80, yard: 'Йокосука', slipway: 'Большой (300м)', laidDown: '25.12.1937', completed: '08.1941', program: 'maru3' },
  { type: '🛩️ Авианосец', name: 'Дзуйкаку', cost: 85, yard: 'Кавасаки', slipway: 'Большой (250м)', laidDown: '25.05.1938', completed: '09.1941', program: 'maru3' },
  { type: '🔹 Эсминец', name: 'Кагэро', cost: 11, yard: 'Майдзуру', slipway: '№1 (150м)', laidDown: '09.1937', completed: '11.1939', program: 'maru3' },
  { type: '🔻 Подлодка', name: 'I-9 (Тип A)', cost: 18, yard: 'Кавасаки', slipway: 'Большой (250м)', laidDown: '01.1938', completed: '03.1940', program: 'maru3' },
  { type: '🔻 Подлодка', name: 'I-15 (Тип B)', cost: 16, yard: 'Кавасаки', slipway: '№2 (150м)', laidDown: '03.1938', completed: '09.1940', program: 'maru3' },
  { type: '🔻 Подлодка', name: 'I-16 (Тип C)', cost: 17, yard: 'Кавасаки', slipway: '№3 (150м)', laidDown: '06.1938', completed: '04.1940', program: 'maru3' },
  { type: '🛡️ Эскорт', name: 'Симусю', cost: 8, yard: 'Сасебо', slipway: '№3 (150м)', laidDown: '02.1938', completed: '06.1940', program: 'maru3' },
  
  // Мару-4 (1939)
  { type: '⚓ Линкор', name: 'Синано', cost: 148, yard: 'Йокосука', slipway: 'Большой (300м)', laidDown: '04.05.1940', completed: '11.1944', program: 'maru4' },
  { type: '🛩️ Авианосец', name: 'Тайхо', cost: 100, yard: 'Кавасаки', slipway: 'Большой (250м)', laidDown: '10.07.1941', completed: '03.1944', program: 'maru4' },
  { type: '🚢 Крейсер', name: 'Агано', cost: 16, yard: 'Сасебо', slipway: '№1 (200м)', laidDown: '06.1940', completed: '10.1942', program: 'maru4' },
  { type: '🚢 Крейсер', name: 'Оёдо', cost: 35, yard: 'Курэ', slipway: '№2 (225м)', laidDown: '11.1939', completed: '02.1943', program: 'maru4' },
  { type: '🔹 Эсминец', name: 'Югумо', cost: 12, yard: 'Майдзуру', slipway: '№1 (150м)', laidDown: '12.1939', completed: '12.1941', program: 'maru4' },
  { type: '🔹 Эсминец', name: 'Акидзуки', cost: 12, yard: 'Майдзуру', slipway: '№2 (125м)', laidDown: '07.1940', completed: '06.1942', program: 'maru4' },
  { type: '🔹 Эсминец', name: 'Симакадзэ', cost: 11, yard: 'Кавасаки', slipway: '№2 (150м)', laidDown: '08.1939', completed: '05.1943', program: 'maru4' },
  
  // Мару-Рин (1940)
  { type: '🔻 Подлодка', name: 'Ro-35', cost: 9, yard: 'Кавасаки', slipway: '№4 (100м)', laidDown: '04.1940', completed: '08.1943', program: 'marurin' },
  { type: '🔻 Подлодка', name: 'Ro-100', cost: 8, yard: 'Кавасаки', slipway: '№5 (100м)', laidDown: '08.1940', completed: '11.1943', program: 'marurin' },
  
  // Мару-Кю (1941)
  { type: '🛩️ Авианосец', name: 'Унрю', cost: 87, yard: 'Йокосука', slipway: '№2 (200м)', laidDown: '08.1941', completed: '08.1944', program: 'marukyuu' },
  { type: '🚢 Крейсер', name: 'Ибуки', cost: 60, yard: 'Кавасаки', slipway: 'Большой (250м)', laidDown: '10.1941', completed: '—', program: 'marukyuu' },
  { type: '🛡️ Эскорт', name: 'Эторофу', cost: 6, yard: 'Сасебо', slipway: '№2 (175м)', laidDown: '05.1941', completed: '10.1943', program: 'marukyuu' },
  { type: '🔻 Подлодка', name: 'I-40 (Тип B мод.)', cost: 17, yard: 'Кавасаки', slipway: '№2 (150м)', laidDown: '03.1941', completed: '09.1943', program: 'marukyuu' },
];

interface ProgramTableProps {
  onClose: () => void;
}

export default function ProgramTable({ onClose }: ProgramTableProps) {
  const [selectedProgram, setSelectedProgram] = useState('all');

  const filteredShips = selectedProgram === 'all' 
    ? shipsData 
    : shipsData.filter(ship => ship.program === selectedProgram);

  const totalCost = filteredShips.reduce((sum, ship) => sum + ship.cost, 0);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-green-600 rounded-xl max-w-7xl w-full my-8">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-green-400">📋 Кораблестроительные программы ИЯФ (1931-1941)</h2>
          <div className="flex gap-2">
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 px-4 py-1.5 rounded text-sm cursor-pointer text-white">← Вернуться</button>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl cursor-pointer">✕</button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Выбор программы */}
          <div className="mb-4 flex flex-wrap gap-2">
            {programs.map(prog => (
              <button
                key={prog.id}
                onClick={() => setSelectedProgram(prog.id)}
                className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-all ${
                  selectedProgram === prog.id
                    ? 'bg-green-700 text-white font-bold'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {prog.name}
                {prog.nameJp && <span className="text-xs ml-1 opacity-70">({prog.nameJp})</span>}
              </button>
            ))}
          </div>

          {/* Информация о бюджете */}
          <div className="mb-4 bg-slate-800/60 border border-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-slate-400">Выбрано кораблей: <span className="text-white font-bold">{filteredShips.length}</span></div>
                <div className="text-sm text-slate-400">Общая стоимость: <span className="text-green-400 font-bold">¥{totalCost}M</span></div>
              </div>
              <div className="text-right">
                {selectedProgram !== 'all' && (
                  <div className="text-xs text-amber-400">
                    {programs.find(p => p.id === selectedProgram)?.nameJp}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Таблица кораблей */}
          <div className="overflow-x-auto border border-slate-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-amber-400 font-bold border-b border-slate-700">Тип</th>
                  <th className="px-3 py-2 text-left text-amber-400 font-bold border-b border-slate-700">Название</th>
                  <th className="px-3 py-2 text-right text-amber-400 font-bold border-b border-slate-700">Цена (¥M)</th>
                  <th className="px-3 py-2 text-left text-amber-400 font-bold border-b border-slate-700">Верфь</th>
                  <th className="px-3 py-2 text-left text-amber-400 font-bold border-b border-slate-700">Стапель</th>
                  <th className="px-3 py-2 text-center text-amber-400 font-bold border-b border-slate-700">Закладка</th>
                  <th className="px-3 py-2 text-center text-amber-400 font-bold border-b border-slate-700">Ввод в строй</th>
                </tr>
              </thead>
              <tbody>
                {filteredShips.map((ship, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 border-b border-slate-700/50">
                    <td className="px-3 py-2 text-slate-300">{ship.type}</td>
                    <td className="px-3 py-2 text-white font-medium">{ship.name}</td>
                    <td className="px-3 py-2 text-right text-green-400 font-mono">{ship.cost}</td>
                    <td className="px-3 py-2 text-slate-300">{ship.yard}</td>
                    <td className="px-3 py-2 text-slate-400 text-xs">{ship.slipway}</td>
                    <td className="px-3 py-2 text-center text-blue-400 font-mono text-xs">{ship.laidDown}</td>
                    <td className="px-3 py-2 text-center text-purple-400 font-mono text-xs">{ship.completed}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800 sticky bottom-0">
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-right text-amber-400 font-bold">ИТОГО:</td>
                  <td className="px-3 py-2 text-right text-green-400 font-bold font-mono">¥{totalCost}M</td>
                  <td colSpan={4} className="px-3 py-2 text-center text-slate-400 text-xs">
                    {filteredShips.length} кораблей
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Легенда */}
          <div className="mt-4 text-xs text-slate-500">
            <div className="mb-1"><strong className="text-slate-400">Источники:</strong> USNI Proceedings, CombinedFleet.com, Navypedia.org, Wikipedia</div>
            <div><strong className="text-slate-400">Примечание:</strong> Цены указаны в миллионах японских иен (¥M) на момент закладки. Реальные стоимости могли отличаться из-за инфляции и секретных расходов.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
