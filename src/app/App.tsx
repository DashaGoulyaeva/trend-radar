import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TrendCard } from './components/TrendCard';
import { UpcomingCard } from './components/UpcomingCard';

type Axis = {
  label: string;
  value: string;
};

type TrendItem = {
  id: string;
  title: string;
  score: number;
  predictiveScore: number;
  verdict: string;
  sources: string[];
  adminNote: string;
  whyLive: string;
  scene: string;
  risk: string;
  works: string[];
  avoid: string[];
  angles: string[];
  axes: Axis[];
};

type WeeklyItem = {
  id: string;
  title: string;
  status: 'Р±СЂР°С‚СЊ' | 'Р±СЂР°С‚СЊ РѕСЃС‚РѕСЂРѕР¶РЅРѕ' | 'РЅРµ Р±СЂР°С‚СЊ' | 'РЅРµ РІ РїСѓС€' | 'РѕС‚Р»РѕР¶РёС‚СЊ';
  note: string;
};

export default function App() {
  const [selectedMode, setSelectedMode] = useState('РћР±С‰РёР№');
  const [inputValue, setInputValue] = useState('');
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState('today');
  const [isAdmin, setIsAdmin] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const [remoteTrends, setRemoteTrends] = useState<TrendItem[] | null>(null);

  const trends: TrendItem[] = [
    {
      id: 'late-night-comfort',
      title: 'РќРѕС‡РЅРѕР№ РєРѕРјС„РѕСЂС‚: РґРѕСЃС‚Р°РІРєР° С‚С‘РїР»РѕР№ РµРґС‹ СЂР°СЃС‚С‘С‚',
      score: 92,
      predictiveScore: 74,
      verdict: 'Р¶РёРІРѕРµ',
      sources: ['Telegram', 'VK', 'Retail'],
      adminNote: '',
      whyLive: 'РџРѕРІС‚РѕСЂСЏРµС‚СЃСЏ РІ СЃРѕС†СЃРµС‚СЏС… Рё РїРѕРґС‚РІРµСЂР¶РґР°РµС‚СЃСЏ РїРѕРєСѓРїРєР°РјРё.',
      scene: 'РџРѕР·РґРЅРёР№ РІРµС‡РµСЂ, СЃРµСЂРёР°Р», С…РѕС‡РµС‚СЃСЏ РјР°Р»РµРЅСЊРєРѕРіРѕ СѓРґРѕРІРѕР»СЊСЃС‚РІРёСЏ.',
      risk: 'РњРѕР¶РЅРѕ СЃРєР°С‚РёС‚СЊСЃСЏ РІ Р±Р°РЅР°Р»СЊРЅС‹Р№ В«РµРґР° РЅРѕС‡СЊСЋВ».',
      works: ['РљРѕРјС„РѕСЂС‚ Рё Р»С‘РіРєРѕСЃС‚СЊ', 'Р‘С‹С‚РѕРІР°СЏ СЃС†РµРЅР°', 'РўРѕРЅ Р±РµР· РёР·Р±С‹С‚РѕС‡РЅРѕРіРѕ СЋРјРѕСЂР°'],
      avoid: ['РњРµРј СЂР°РґРё РјРµРјР°', 'РќР°С‚СЏРіРёРІР°РЅРёРµ РёРЅС„РѕРїРѕРІРѕРґР°'],
      angles: ['В«Р•С‰С‘ РѕРґРЅСѓ СЃРµСЂРёСЋ Рё С‡С‚Рѕ-РЅРёР±СѓРґСЊ РІРєСѓСЃРЅРѕРµВ»', 'Р Р°Р·СЂРµС€РёС‚СЊ СЃРµР±Рµ РїСЂРѕСЃС‚РѕР№ СѓСЋС‚'],
      axes: [
        { label: 'РќР°С‚РёРІРЅРѕСЃС‚СЊ', value: 'РІС‹СЃРѕРєР°СЏ' },
        { label: 'Р РёСЃРє РЅР°С‚СЏР¶РєРё', value: 'РЅРёР·РєРёР№' },
        { label: 'РЎСЂРѕРє Р¶РёР·РЅРё', value: '3-5 РґРЅРµР№' }
      ]
    },
    {
      id: 'meal-prep',
      title: 'РќР°Р±РѕСЂС‹ РЅР° РЅРµРґРµР»СЋ: Р±РѕР»СЊС€Рµ РєРѕРЅС‚СЂРѕР»СЏ, РјРµРЅСЊС€Рµ СѓСЃРёР»РёР№',
      score: 86,
      predictiveScore: 68,
      verdict: 'Р¶РёРІРѕРµ, РЅРѕ СѓР·РєРѕРµ',
      sources: ['Instagram', 'TikTok', 'Р‘Р»РѕРіРё'],
      adminNote: '',
      whyLive: 'РЎС‚Р°Р±РёР»СЊРЅС‹Р№ СЂРѕСЃС‚ СѓРїРѕРјРёРЅР°РЅРёР№ + РїРѕРІС‚РѕСЂСЏРµРјРѕСЃС‚СЊ РІ РїРѕРєСѓРїРєР°С….',
      scene: 'РЈС‚СЂРѕ, РїР»Р°РЅРёСЂРѕРІР°РЅРёРµ РЅРµРґРµР»Рё, С…РѕС‡РµС‚СЃСЏ СЏСЃРЅРѕСЃС‚Рё Рё РїРѕСЂСЏРґРєР°.',
      risk: 'Р›РµРіРєРѕ СѓР№С‚Рё РІ В«РґРёРµС‚РёС‡РµСЃРєРёРµ Р»РѕР·СѓРЅРіРёВ» Р±РµР· СЂРµР°Р»СЊРЅРѕР№ СЃС†РµРЅС‹.',
      works: ['Р§С‘С‚РєР°СЏ СЂСѓС‚РёРЅР°', 'Р Р°С†РёРѕРЅР°Р»СЊРЅРѕСЃС‚СЊ', 'РџСЂРѕСЃС‚РѕС‚Р° С„РѕСЂРјСѓР»РёСЂРѕРІРѕРє'],
      avoid: ['РЎР»РёС€РєРѕРј СЂР°С†РёРѕРЅР°Р»СЊРЅС‹Р№ С‚РѕРЅ', 'РќР°РІСЏР·С‡РёРІС‹Р№ Р—РћР–'],
      angles: ['В«РќРѕСЂРјР°Р»СЊРЅР°СЏ РµРґР° Р±РµР· Р·Р°РјРѕСЂРѕС‡РµРєВ»', 'В«РќРµРґРµР»СЏ РїРѕРґ РєРѕРЅС‚СЂРѕР»РµРјВ»'],
      axes: [
        { label: 'РќР°С‚РёРІРЅРѕСЃС‚СЊ', value: 'СЃСЂРµРґРЅСЏСЏ' },
        { label: 'Р РёСЃРє РЅР°С‚СЏР¶РєРё', value: 'СЃСЂРµРґРЅРёР№' },
        { label: 'РЎСЂРѕРє Р¶РёР·РЅРё', value: '5-7 РґРЅРµР№' }
      ]
    },
    {
      id: 'exotic-cuisine',
      title: 'Р­РєР·РѕС‚РёС‡РµСЃРєР°СЏ РєСѓС…РЅСЏ: Р·Р°РїСЂРѕСЃ РЅР° РЅРѕРІС‹Рµ РІРїРµС‡Р°С‚Р»РµРЅРёСЏ',
      score: 81,
      predictiveScore: 61,
      verdict: 'С€СѓРјРЅРѕРµ',
      sources: ['YouTube', 'Reddit', 'Food Apps'],
      adminNote: '',
      whyLive: 'РњРЅРѕРіРѕ СЂР°Р·РіРѕРІРѕСЂРѕРІ, РЅРѕ СЃР»Р°Р±Р°СЏ РїРѕРєСѓРїР°С‚РµР»СЊСЃРєР°СЏ РїР»РѕС‚РЅРѕСЃС‚СЊ.',
      scene: 'Р’С‹С…РѕРґРЅС‹Рµ, С…РѕС‡РµС‚СЃСЏ РїРѕРїСЂРѕР±РѕРІР°С‚СЊ С‡С‚Рѕ-С‚Рѕ РЅРѕРІРѕРµ.',
      risk: 'РњРѕР¶РЅРѕ РїСЂРµРІСЂР°С‚РёС‚СЊ РІ Р±РµР·РґРѕРєР°Р·Р°С‚РµР»СЊРЅС‹Р№ В«С‚СЂРµРЅРґ СЂР°РґРё С‚СЂРµРЅРґР°В».',
      works: ['РўРѕРЅ В«РїРѕРїСЂРѕР±РѕРІР°С‚СЊ Р±РµР· РѕР±СЏР·Р°С‚РµР»СЊСЃС‚РІВ»', 'РќРµР±РѕР»СЊС€РёРµ С„РѕСЂРјР°С‚С‹'],
      avoid: ['Р“СЂРѕРјРєРёРµ Р»РѕР·СѓРЅРіРё', 'Р¤РµР№РєРѕРІС‹Рµ С‚СЂР°РґРёС†РёРё'],
      angles: ['В«РћРґРёРЅ РЅРѕРІС‹Р№ РІРєСѓСЃ РІ РІС‹С…РѕРґРЅС‹РµВ»', 'В«РџСЂРѕР±Р°, Р° РЅРµ РѕР±СЏР·Р°Р»РѕРІРєР°В»'],
      axes: [
        { label: 'РќР°С‚РёРІРЅРѕСЃС‚СЊ', value: 'СЃСЂРµРґРЅСЏСЏ' },
        { label: 'Р РёСЃРє РЅР°С‚СЏР¶РєРё', value: 'РІС‹СЃРѕРєРёР№' },
        { label: 'РЎСЂРѕРє Р¶РёР·РЅРё', value: '2-4 РґРЅСЏ' }
      ]
    }
  ];

  const weeklyItems: WeeklyItem[] = [
    {
      id: 'weekly-1',
      title: 'РќРѕС‡РЅРѕР№ РєРѕРјС„РѕСЂС‚ Рё СЃРµСЂРёР°Р»С‹',
      status: 'Р±СЂР°С‚СЊ',
      note: 'РЎС‚Р°Р±РёР»СЊРЅРѕ Р¶РёРІРѕРµ, С…РѕСЂРѕС€Рѕ СЂР°Р±РѕС‚Р°РµС‚ РІ РїСѓС€Р°С….'
    },
    {
      id: 'weekly-2',
      title: 'Р—РћР–-РЅР°Р±РѕСЂС‹ РЅР° РЅРµРґРµР»СЋ',
      status: 'Р±СЂР°С‚СЊ РѕСЃС‚РѕСЂРѕР¶РЅРѕ',
      note: 'РќСѓР¶РµРЅ С‚РѕС‡РЅС‹Р№ С‚РѕРЅ Рё РєРѕСЂРѕС‚РєР°СЏ СЃС†РµРЅР°.'
    },
    {
      id: 'weekly-3',
      title: 'Р­РєР·РѕС‚РёС‡РµСЃРєР°СЏ РєСѓС…РЅСЏ',
      status: 'РЅРµ РІ РїСѓС€',
      note: 'РњРѕР¶РЅРѕ РІ РєР°РЅР°Р»Рµ, РЅРѕ РЅРµ РґР»СЏ РјР°СЃСЃРѕРІРѕР№ СЂР°СЃСЃС‹Р»РєРё.'
    }
  ];

  const [overrides, setOverrides] = useState<
    Record<
      string,
      {
        score: number;
        predictiveScore: number;
        verdict: string;
        adminNote: string;
        whyLive: string;
        scene: string;
        risk: string;
        works: string[];
        avoid: string[];
        angles: string[];
      }
    >
  >(
    () =>
      Object.fromEntries(
        trends.map((trend) => [
          trend.id,
          {
            score: trend.score,
            predictiveScore: trend.predictiveScore,
            verdict: trend.verdict,
            adminNote: '',
            whyLive: trend.whyLive,
            scene: trend.scene,
            risk: trend.risk,
            works: trend.works,
            avoid: trend.avoid,
            angles: trend.angles
          }
        ])
      )
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch('http://127.0.0.1:8000/api/trends', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        setBackendReady(true);
        const items = (data.items ?? []).map((item: any) => ({
          id: item.id,
          title: item.title,
          score: item.score ?? 0,
          predictiveScore: item.predictive_score ?? 0,
          verdict: item.verdict ?? 'Р¶РёРІРѕРµ',
          sources: (item.evidence ?? []).map((ev: any) => ev.source_key).filter(Boolean),
          adminNote: item.admin_note ?? '',
          whyLive: item.why_live ?? '',
          scene: item.scene ?? '',
          risk: item.risk ?? '',
          works: item.works ?? [],
          avoid: item.avoid ?? [],
          angles: item.angles ?? [],
          axes: (item.axes ?? []).map((axis: any) => ({ label: axis.label, value: axis.value })),
        }));

        setRemoteTrends(items);
        if (items.length > 0) {
          setOverrides((prev) => {
            const next = { ...prev };
            items.forEach((trend: TrendItem) => {
              if (!next[trend.id]) {
                next[trend.id] = {
                  score: trend.score,
                  predictiveScore: trend.predictiveScore,
                  verdict: trend.verdict,
                  adminNote: trend.adminNote ?? '',
                  whyLive: trend.whyLive,
                  scene: trend.scene,
                  risk: trend.risk,
                  works: trend.works,
                  avoid: trend.avoid,
                  angles: trend.angles
                };
              }
            });
            return next;
          });
        }
      })
      .catch(() => {
        setBackendReady(false);
        setRemoteTrends(null);
      });

    return () => controller.abort();
  }, []);

  const updateOverride = (
    id: string,
    patch: Partial<{
      score: number;
      predictiveScore: number;
      verdict: string;
      adminNote: string;
      whyLive: string;
      scene: string;
      risk: string;
      works: string[];
      avoid: string[];
      angles: string[];
      evidenceAdd: { source_key: string; url?: string; note?: string }[];
    }>
  ) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...patch
      }
    }));

    if (backendReady) {
      const payload: Record<string, unknown> = {
        score: patch.score,
        predictive_score: patch.predictiveScore,
        verdict: patch.verdict,
        admin_note: patch.adminNote,
        why_live: patch.whyLive,
        scene: patch.scene,
        risk: patch.risk,
        works: patch.works,
        avoid: patch.avoid,
        angles: patch.angles,
        evidence_add: patch.evidenceAdd,
        editor: 'admin'
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      fetch(`http://127.0.0.1:8000/api/trends/${id}/admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);
    }
  };

  const handleSearch = () => {
    if (inputValue.trim()) {
      setCurrentView('dashboard');
      setActiveTab('today');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const statusColor = (status: WeeklyItem['status']) => {
    switch (status) {
      case 'Р±СЂР°С‚СЊ':
        return 'rgba(13, 19, 35, 0.9)';
      case 'Р±СЂР°С‚СЊ РѕСЃС‚РѕСЂРѕР¶РЅРѕ':
        return 'rgba(13, 19, 35, 0.6)';
      case 'РЅРµ Р±СЂР°С‚СЊ':
        return 'rgba(13, 19, 35, 0.35)';
      case 'РЅРµ РІ РїСѓС€':
        return 'rgba(13, 19, 35, 0.45)';
      case 'РѕС‚Р»РѕР¶РёС‚СЊ':
        return 'rgba(13, 19, 35, 0.5)';
      default:
        return 'rgba(13, 19, 35, 0.6)';
    }
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen w-full bg-white text-black">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/5">
          <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
            <h1 className="text-xl tracking-tight text-black font-medium">Trend Radar</h1>
            <div className="text-sm font-light" style={{ fontFamily: 'Inter, sans-serif', color: '#0D1323', opacity: 0.4 }}>
              Free
            </div>
          </div>
        </header>

        <main className="pt-40 pb-20 px-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-24">
              <h2 className="text-5xl mb-16 text-black leading-tight tracking-tight">
                Р§С‚Рѕ СЃРµР№С‡Р°СЃ РјРѕР¶РЅРѕ СЃРєР°Р·Р°С‚СЊ СѓРјРµСЃС‚РЅРѕ Рё Р¶РёРІРѕ?
              </h2>

              <div className="space-y-6">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="РћРїРёС€Рё С‚РµРјСѓ, РЅРёС€Сѓ РёР»Рё С„РѕСЂРјР°С‚..."
                  className="w-full bg-white px-0 py-5 text-xl text-black placeholder:text-black/20 outline-none border-b transition-colors font-light"
                  style={{
                    borderBottomColor: 'rgba(13, 19, 35, 0.15)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = 'rgba(13, 19, 35, 0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = 'rgba(13, 19, 35, 0.15)';
                  }}
                />

                <div className="flex items-center gap-6 pt-2">
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="appearance-none bg-white border-b px-0 py-2 text-sm cursor-pointer outline-none transition-colors font-light"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#0D1323',
                      opacity: 0.6,
                      borderBottomColor: 'rgba(13, 19, 35, 0.1)'
                    }}
                  >
                    <option value="РћР±С‰РёР№">РћР±С‰РёР№</option>
                    <option value="РџСѓС€">РџСѓС€</option>
                    <option value="РљР°РЅР°Р»">РљР°РЅР°Р»</option>
                  </select>

                  <button
                    onClick={handleSearch}
                    className="text-sm transition-colors font-light"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#0D1323',
                      opacity: 0.5
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.5';
                    }}
                  >
                    РЎРєР°РЅРёСЂРѕРІР°С‚СЊ в†’
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-16" style={{ borderTopColor: 'rgba(13, 19, 35, 0.1)' }}>
              <h3
                className="text-xs uppercase tracking-widest mb-12 font-light"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#0D1323',
                  opacity: 0.4
                }}
              >
                РќР°С‡РЅРё СЃ РїСЂРёРјРµСЂР°
              </h3>

              <div className="space-y-10">
                <button
                  onClick={() => {
                    setInputValue('Р”РѕСЃС‚Р°РІРєР° РµРґС‹ РІРµС‡РµСЂРѕРј');
                    setCurrentView('dashboard');
                    setActiveTab('today');
                  }}
                  className="block w-full text-left pb-8 border-b transition-colors"
                  style={{ borderBottomColor: 'rgba(13, 19, 35, 0.05)' }}
                >
                  <h4 className="text-xl mb-2 text-black transition-opacity hover:opacity-60">Р”РѕСЃС‚Р°РІРєР° РµРґС‹ РІРµС‡РµСЂРѕРј</h4>
                  <p className="text-base text-black/40 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Р–РёРІС‹Рµ РїРѕРІРѕРґС‹ РІ С‚РµРјРµ РІРµС‡РµСЂРЅРёС… РїСЂРёРІС‹С‡РµРє
                  </p>
                </button>

                <button
                  onClick={() => {
                    setInputValue('РЎРµР·РѕРЅРЅС‹Рµ СЃРѕР±С‹С‚РёСЏ Рё РєР°Р»РµРЅРґР°СЂСЊ');
                    setCurrentView('dashboard');
                    setActiveTab('today');
                  }}
                  className="block w-full text-left pb-8 border-b transition-colors"
                  style={{ borderBottomColor: 'rgba(13, 19, 35, 0.05)' }}
                >
                  <h4 className="text-xl mb-2 text-black transition-opacity hover:opacity-60">РЎРµР·РѕРЅРЅС‹Рµ СЃРѕР±С‹С‚РёСЏ Рё РєР°Р»РµРЅРґР°СЂСЊ</h4>
                  <p className="text-base text-black/40 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    РџРѕРІРѕРґС‹ Р±РµР· РЅР°С‚СЏР¶РµРє Рё РїСѓСЃС‚РѕРіРѕ С€СѓРјР°
                  </p>
                </button>

                <button
                  onClick={() => {
                    setInputValue('РРґРµРё РґР»СЏ РїСѓС€РµР№');
                    setCurrentView('dashboard');
                    setActiveTab('today');
                  }}
                  className="block w-full text-left pb-8 border-b transition-colors"
                  style={{ borderBottomColor: 'rgba(13, 19, 35, 0.05)' }}
                >
                  <h4 className="text-xl mb-2 text-black transition-opacity hover:opacity-60">РРґРµРё РґР»СЏ РїСѓС€РµР№</h4>
                  <p className="text-base text-black/40 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    РўРѕС‡РЅР°СЏ РїРѕРґР°С‡Р° Р±РµР· РєСЂРёРЅР¶Р°
                  </p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-56 px-16 py-20 min-h-screen max-w-5xl">
        <div className="mb-24 flex items-start justify-between gap-6">
          <div>
            <h1
              className="text-4xl text-black mb-3 pb-4 tracking-tight"
              style={{
                borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
              }}
            >
              РЎРµРіРѕРґРЅСЏС€РЅРёРµ РїРѕРІРѕРґС‹
            </h1>
            <p className="text-base text-black/40 font-light mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {inputValue || 'РЎРєР°РЅРёСЂСѓРµРј РїРѕР»Рµ СѓРјРµСЃС‚РЅРѕСЃС‚Рё'} В· СЂРµР¶РёРј: {selectedMode}
            </p>
          </div>

          <button
            onClick={() => setIsAdmin((prev) => !prev)}
            className="text-xs uppercase tracking-widest border-b pb-1"
            style={{ color: isAdmin ? '#0D1323' : 'rgba(13, 19, 35, 0.4)', borderBottomColor: 'rgba(13, 19, 35, 0.2)' }}
          >
            РђРґРјРёРЅ-СЂРµР¶РёРј: {isAdmin ? 'РІРєР»' : 'РІС‹РєР»'}
          </button>
        </div>

        {activeTab === 'today' && (
          <>
            <section className="mb-32">
              {(backendReady ? remoteTrends ?? [] : trends).length === 0 ? (
                <div className="text-base text-black/50 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Р СџР С•Р С”Р В° Р Р…Р ВµРЎвЂљ Р Р…Р С•Р Р†РЎвЂ№РЎвЂ¦ РЎРѓР С‘Р С–Р Р…Р В°Р В»Р С•Р Р†. Р вЂ”Р В°Р С—РЎС“РЎРѓРЎвЂљР С‘ python pipeline Р С‘Р В»Р С‘ Р С—Р С•Р С—РЎР‚Р С•Р В±РЎС“Р в„– Р ВµРЎвЂ°Р Вµ РЎР‚Р В°Р В·.
                </div>
              ) : (
                (backendReady ? remoteTrends ?? [] : trends).map((trend) => {
                  const override = overrides[trend.id];
                  return (
                    <TrendCard
                      key={trend.id}
                      title={trend.title}
                      score={override?.score ?? trend.score}
                      predictiveScore={override?.predictiveScore ?? trend.predictiveScore}
                      verdict={override?.verdict ?? trend.verdict}
                      sources={trend.sources.length ? trend.sources : ['sources pending']}
                      whyLive={override?.whyLive ?? trend.whyLive}
                      scene={override?.scene ?? trend.scene}
                      risk={override?.risk ?? trend.risk}
                      works={override?.works ?? trend.works}
                      avoid={override?.avoid ?? trend.avoid}
                      angles={override?.angles ?? trend.angles}
                      axes={trend.axes}
                      adminNote={override?.adminNote ?? trend.adminNote ?? ''}
                      isAdmin={isAdmin}
                      onAdminChange={(patch) => updateOverride(trend.id, patch)}
                    />
                  );
                })
              )}
            </section>

            <section className="mb-32 pb-24 border-t border-black/5 pt-20">
              <h2
                className="text-3xl text-black mb-12 pb-4 tracking-tight"
                style={{
                  borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
                }}
              >
                РљР°Р»РµРЅРґР°СЂСЊ РїРѕРІРѕРґРѕРІ
              </h2>

              <div className="space-y-10 mt-10">
                <UpcomingCard
                  eventName="Р”РµРЅСЊ Р—РµРјР»Рё"
                  date="22 Р°РїСЂРµР»СЏ 2026"
                  description="РЎРїСЂРѕСЃ РЅР° СЌРєРѕ-РїСЂРёРІС‹С‡РєРё Рё СѓСЃС‚РѕР№С‡РёРІС‹Рµ С„РѕСЂРјР°С‚С‹ Р±СѓРґРµС‚ СЂР°СЃС‚Рё."
                />

                <UpcomingCard
                  eventName="Р¤РёРЅР°Р» Р›РёРіРё С‡РµРјРїРёРѕРЅРѕРІ"
                  date="30 РјР°СЏ 2026"
                  description="РЎС†РµРЅР°СЂРёРё РїСЂРѕСЃРјРѕС‚СЂР° РјР°С‚С‡РµР№ Рё РіСЂСѓРїРїРѕРІС‹Рµ Р·Р°РєР°Р·С‹ РѕР¶РёРґР°СЋС‚СЃСЏ С‡Р°С‰Рµ."
                />

                <UpcomingCard
                  eventName="Р›РµС‚РЅРµРµ СЃРѕР»РЅС†РµСЃС‚РѕСЏРЅРёРµ"
                  date="21 РёСЋРЅСЏ 2026"
                  description="РўРѕРЅРєРёРµ РїРѕРІРѕРґС‹ РґР»СЏ Р»С‘РіРєРѕР№ РµРґС‹ Рё С„РѕСЂРјР°С‚РѕРІ В«РЅР° СѓР»РёС†РµВ»."
                />
              </div>
            </section>

            <section className="mb-32 pb-24 border-t border-black/5 pt-20">
              <h2
                className="text-3xl text-black mb-12 pb-4 tracking-tight"
                style={{
                  borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
                }}
              >
                РћР±С‰РёРµ РЅР°Р±Р»СЋРґРµРЅРёСЏ
              </h2>

              <ul className="space-y-5 text-base text-black/70 font-light mt-10" style={{ fontFamily: 'Inter, sans-serif' }}>
                <li>- Р Р°СЃС‚С‘С‚ Р·Р°РїСЂРѕСЃ РЅР° РїСЂРѕСЃС‚С‹Рµ РІРµС‡РµСЂРЅРёРµ СЃС†РµРЅР°СЂРёРё Р±РµР· Р»РёС€РЅРµР№ РјРѕС‚РёРІР°С†РёРё</li>
                <li>- Р’ РІС‹С…РѕРґРЅС‹Рµ СЃРёР»СЊРЅРµРµ СЂР°Р±РѕС‚Р°СЋС‚ В«РјР°Р»РµРЅСЊРєРёРµ СѓРґРѕРІРѕР»СЊСЃС‚РІРёСЏВ»</li>
                <li>- РЎ СѓС‚СЂР° Р»СѓС‡С€Рµ Р·Р°С…РѕРґСЏС‚ С„РѕСЂРјР°С‚С‹ РїСЂРѕ СЏСЃРЅРѕСЃС‚СЊ Рё РїРѕСЂСЏРґРѕРє</li>
                <li>- РњРёРєСЂРѕ-СЂРёС‚СѓР°Р»С‹ РґР°СЋС‚ Р±РѕР»СЊС€Рµ РґРѕРІРµСЂРёСЏ, С‡РµРј В«Р±РѕР»СЊС€РёРµ РѕР±РµС‰Р°РЅРёСЏВ»</li>
              </ul>
            </section>
          </>
        )}

        {activeTab === 'weekly' && (
          <section className="mb-32">
            <h2
              className="text-3xl text-black mb-12 pb-4 tracking-tight"
              style={{
                borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
              }}
            >
              Weekly mode
            </h2>

            <div className="space-y-8">
              {weeklyItems.map((item) => (
                <div key={item.id} className="pb-8 border-b border-black/5 last:border-0">
                  <div className="flex items-start justify-between gap-6">
                    <h3 className="text-xl text-black font-medium">{item.title}</h3>
                    <span
                      className="text-xs uppercase tracking-widest"
                      style={{ color: statusColor(item.status), fontFamily: 'Inter, sans-serif' }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-base text-black/60 font-light mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'archive' && (
          <section className="mb-32">
            <h2
              className="text-3xl text-black mb-12 pb-4 tracking-tight"
              style={{
                borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
              }}
            >
              РђСЂС…РёРІ РїРѕРІРѕРґРѕРІ
            </h2>
            <p className="text-base text-black/50 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              РђСЂС…РёРІ РїРѕРєР° РїСѓСЃС‚. Р—РґРµСЃСЊ РїРѕСЏРІСЏС‚СЃСЏ Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅРЅС‹Рµ РїРѕРІРѕРґС‹ Рё СЂРµС€РµРЅРёСЏ.
            </p>
          </section>
        )}

        {activeTab === 'admin' && (
          <section className="mb-32">
            <h2
              className="text-3xl text-black mb-12 pb-4 tracking-tight"
              style={{
                borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
              }}
            >
              РђРґРјРёРЅ-РїР°РЅРµР»СЊ
            </h2>
            <div className="space-y-6 text-base text-black/60 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              <p>Р—РґРµСЃСЊ Р±СѓРґРµС‚ РѕС‡РµСЂРµРґСЊ СЂСѓС‡РЅРѕР№ РїСЂРѕРІРµСЂРєРё СЃРёРіРЅР°Р»РѕРІ, РїСЂР°РІРєРё Рё РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РІРµСЂРґРёРєС‚РѕРІ.</p>
              <p>РќР° РїРµСЂРІРѕРј СЌС‚Р°РїРµ Р°РґРјРёРЅ РјРѕР¶РµС‚ РјРµРЅСЏС‚СЊ РѕС†РµРЅРєРё, С‚РµРєСЃС‚С‹ Рё РґРѕР±Р°РІР»СЏС‚СЊ РёСЃС‚РѕС‡РЅРёРєРё РїСЂСЏРјРѕ РІ РєР°СЂС‚РѕС‡РєР°С….</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
