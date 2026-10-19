interface Program {
  id: string;
  name: string;
  nameJp: string;
  year: string;
  budget: string;
  budgetYen: number;
  ships: { type: string; count: number; class: string; note?: string }[];
  totalShips: number;
  totalTonnage: string;
  note: string;
}

const programs: Program[] = [
  {
    id: 'maru1',
    name: 'Мару-1',
    nameJp: '第一次補充計画 (マル①)',
    year: '1931',
    budget: '¥247.08M',
    budgetYen: 247,
    ships: [
      { type: '🚢 Крейсеры', count: 4, class: 'Могами', note: '8500т каждый' },
      { type: '🔹 Эсминцы', count: 6, class: 'Хатсухару', note: '1-я серия' },
      { type: '🔹 Эсминцы', count: 10, class: 'Сирацую', note: 'переделка из Хатсухару' },
      { type: '⚡ Катера', count: 4, class: 'Тидори', note: 'торпедные' },
      { type: '🔻 ПЛ крейс.', count: 2, class: 'Junsen II (I-6)', note: '' },
      { type: '🔻 ПЛ большие', count: 6, class: 'Кайдай VI', note: '' },
      { type: '🔻 ПЛ средние', count: 2, class: 'Kaichu VI (Ro-33)', note: '' },
    ],
    totalShips: 34,
    totalTonnage: '~60 000 т',
    note: 'Ответ на Лондонский договор 1930. Крейсеры «Могами» — формально лёгкие, но с возможностью перевооружения на 203-мм.',
  },
  {
    id: 'maru2',
    name: 'Мару-2',
    nameJp: '第二次補充計画 (マル②)',
    year: '1934',
    budget: '¥431.69M',
    budgetYen: 432,
    ships: [
      { type: '🚢 Крейсеры', count: 2, class: 'Тоне', note: 'разведывательные' },
      { type: '🛩️ Авианосцы', count: 2, class: 'Сорю / Хирю', note: '¥40M каждый' },
      { type: '🔹 Эсминцы', count: 10, class: 'Асасио', note: '' },
      { type: '⚡ Катера', count: 16, class: 'Отори', note: 'торпедные' },
      { type: '🛩️ Тендеры', count: 2, class: 'Титосэ', note: 'гидросамолётов' },
      { type: '🔻 ПЛ крейс.', count: 2, class: 'Junsen III (I-7)', note: '' },
    ],
    totalShips: 34,
    totalTonnage: '~90 000 т',
    note: 'После инцидента с «Томодзуру» — учтены проблемы остойчивости. Начало строительства авианосцев нового поколения.',
  },
  {
    id: 'maru3',
    name: 'Мару-3',
    nameJp: '第三次補充計画 (マル③)',
    year: '1937',
    budget: '¥806.55M',
    budgetYen: 807,
    ships: [
      { type: '⚓ Линкоры', count: 2, class: 'Ямато / Мусаси', note: '72 800т, ¥137.8M каждый' },
      { type: '🛩️ Авианосцы', count: 2, class: 'Сёкаку / Дзуйкаку', note: '¥80-85M каждый' },
      { type: '🔹 Эсминцы', count: 18, class: 'Кагэро', note: '15 достроено' },
      { type: '🔻 ПЛ тип A', count: 2, class: 'I-9', note: 'ПЛ-лидеры' },
      { type: '🔻 ПЛ тип B', count: 7, class: 'I-15', note: '' },
      { type: '🔻 ПЛ тип C', count: 5, class: 'I-16', note: 'с мини-суб' },
      { type: '🛡️ Эскорты', count: 4, class: 'Симусю', note: '' },
    ],
    totalShips: 40,
    totalTonnage: '~250 000 т',
    note: 'СЕКРЕТНО! Линкоры «Ямато» строятся под маской. Начало самой масштабной программы. «Ямато» заложен 04.08.1937 в Курэ, «Мусаси» — 29.03.1939 в Нагасаки.',
  },
  {
    id: 'maru4',
    name: 'Мару-4',
    nameJp: '第四次補充計画 (マル④)',
    year: '1939',
    budget: '¥1 600M',
    budgetYen: 1600,
    ships: [
      { type: '⚓ Линкоры', count: 2, class: 'Синано / №111', note: '¥148M. Синано → АВ' },
      { type: '🛩️ Авианосцы', count: 1, class: 'Тайхо', note: '¥100M, бронепалубный' },
      { type: '🚢 Крейсеры', count: 5, class: '4 Агано + Оёдо', note: '¥16.4M каждый' },
      { type: '🔹 Эсминцы', count: 15, class: 'Югумо', note: '' },
      { type: '🔹 Эсминцы ПЛО', count: 6, class: 'Акидзуки', note: '¥12M (1939)' },
      { type: '🔹 Суперэсминец', count: 1, class: 'Симакадзэ', note: '¥10.6M, 39.4 узла' },
      { type: '🔻 ПЛ', count: 10, class: 'разные типы', note: '' },
    ],
    totalShips: 80,
    totalTonnage: '~350 000 т',
    note: 'Крупнейшая программа. 80 кораблей. «Синано» позже переделан в авианосец. «Тайхо» — первый бронепалубный АВ.',
  },
  {
    id: 'marurin',
    name: 'Мару-Рин',
    nameJp: '臨時軍事補充計画 (マル凛)',
    year: '1940',
    budget: '—',
    budgetYen: 0,
    ships: [
      { type: '🔻 ПЛ средние', count: 9, class: 'Ro-35', note: '' },
      { type: '🔻 ПЛ средние', count: 9, class: 'Ro-100', note: 'упрощённые' },
      { type: '🛡️ Охотники', count: 18, class: 'разные', note: 'ПЛО' },
    ],
    totalShips: 36,
    totalTonnage: '~30 000 т',
    note: 'Временная программа. Массовое производство средних ПЛ и охотников. Ответ на рост угрозы подлодок США.',
  },
  {
    id: 'marukyuu',
    name: 'Мару-Кю',
    nameJp: '緊急軍事補充計画 (マル級)',
    year: '1941',
    budget: '—',
    budgetYen: 0,
    ships: [
      { type: '🛩️ Авианосцы', count: 5, class: 'Унрю', note: '¥87M (1942), 3 достроены' },
      { type: '🚢 Крейсеры', count: 2, class: 'Ибуки', note: '¥60M, 1 → АВ' },
      { type: '🔹 Эсминцы', count: 26, class: 'Акидзуки/Югумо', note: '' },
      { type: '🛡️ Эскорты', count: 30, class: 'Эторофу', note: 'упрощённые' },
      { type: '🔻 ПЛ', count: 6, class: 'I-40 (Тип B мод.)', note: '' },
    ],
    totalShips: 69,
    totalTonnage: '~200 000 т',
    note: 'Экстренная программа после начала войны. Массовое производство эскортов и эсминцев. Многие корабли не достроены.',
  },
];

export default function ProgramTable() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
      <h3 className="text-lg font-bold text-amber-400 mb-3">
        📋 Кораблестроительные программы ИЯФ (1931-1941)
      </h3>
      <p className="text-xs text-slate-400 mb-3">
        Реальные данные из исторических источников. Бюджеты и состав программ.
      </p>

      {/* Сводная таблица */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800">
              <th className="border border-slate-600 px-2 py-1 text-amber-400 text-left">Программа</th>
              <th className="border border-slate-600 px-2 py-1 text-amber-400">Год</th>
              <th className="border border-slate-600 px-2 py-1 text-amber-400">Бюджет</th>
              <th className="border border-slate-600 px-2 py-1 text-amber-400">Кораблей</th>
              <th className="border border-slate-600 px-2 py-1 text-amber-400">Водоизм.</th>
              <th className="border border-slate-600 px-2 py-1 text-amber-400 text-left">Ключевые корабли</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/50">
                <td className="border border-slate-600 px-2 py-1">
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-amber-600">{p.nameJp}</div>
                </td>
                <td className="border border-slate-600 px-2 py-1 text-center text-white">{p.year}</td>
                <td className="border border-slate-600 px-2 py-1 text-center text-green-400 font-bold">{p.budget}</td>
                <td className="border border-slate-600 px-2 py-1 text-center text-white">{p.totalShips}</td>
                <td className="border border-slate-600 px-2 py-1 text-center text-slate-300">{p.totalTonnage}</td>
                <td className="border border-slate-600 px-2 py-1 text-slate-300">
                  {p.ships.slice(0, 3).map((s, i) => (
                    <div key={i} className="text-[10px]">{s.class}</div>
                  ))}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-800 font-bold">
              <td className="border border-slate-600 px-2 py-1 text-amber-400">ИТОГО</td>
              <td className="border border-slate-600 px-2 py-1 text-center text-white">1931-41</td>
              <td className="border border-slate-600 px-2 py-1 text-center text-green-400">¥3+ млрд</td>
              <td className="border border-slate-600 px-2 py-1 text-center text-white">293</td>
              <td className="border border-slate-600 px-2 py-1 text-center text-slate-300">~980 000 т</td>
              <td className="border border-slate-600 px-2 py-1 text-slate-300 text-[10px]">
                4 линкора, 14 АВ, 13 крейсеров, 100+ эсминцев, 60+ ПЛ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Детальные карточки по программам */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {programs.map((p) => (
          <div key={p.id} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-bold text-amber-400">{p.name} ({p.year})</h4>
                <div className="text-[10px] text-amber-600">{p.nameJp}</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold text-sm">{p.budget}</div>
                <div className="text-[10px] text-slate-400">{p.totalShips} кораблей</div>
              </div>
            </div>
            
            <div className="space-y-0.5 mb-2">
              {p.ships.map((s, i) => (
                <div key={i} className="flex justify-between text-[11px]">
                  <span className="text-slate-300">{s.type}</span>
                  <span className="text-white">
                    {s.count}× <span className="text-amber-400">{s.class}</span>
                    {s.note && <span className="text-slate-500 text-[9px] ml-1">{s.note}</span>}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-700 pt-1 mt-1">
              {p.note}
            </div>
          </div>
        ))}
      </div>

      {/* Источники */}
      <div className="mt-3 text-[10px] text-slate-500 border-t border-slate-700 pt-2">
        <strong>Источники:</strong> USNI Proceedings, CombinedFleet.com, Navypedia.org, Wikipedia, 
        «Japanese Cruisers of the Pacific War» (Lacroix & Wells), USNTMJ Reports
      </div>
    </div>
  );
}
