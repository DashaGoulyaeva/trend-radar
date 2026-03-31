import { useState } from 'react';

type Axis = {
  label: string;
  value: string;
};

type AdminPatch = {
  score?: number;
  predictiveScore?: number;
  verdict?: string;
  adminNote?: string;
  whyLive?: string;
  scene?: string;
  risk?: string;
  works?: string[];
  avoid?: string[];
  angles?: string[];
  evidenceAdd?: { source_key: string; url?: string; note?: string }[];
};

interface TrendCardProps {
  title: string;
  score: number;
  predictiveScore: number;
  verdict: string;
  sources: string[];
  whyLive: string;
  scene: string;
  risk: string;
  works: string[];
  avoid: string[];
  angles: string[];
  axes: Axis[];
  adminNote: string;
  isAdmin?: boolean;
  onAdminChange?: (patch: AdminPatch) => void;
}

export function TrendCard({
  title,
  score,
  predictiveScore,
  verdict,
  sources,
  whyLive,
  scene,
  risk,
  works,
  avoid,
  angles,
  axes,
  adminNote,
  isAdmin,
  onAdminChange
}: TrendCardProps) {
  const [newSourceKey, setNewSourceKey] = useState('');

  const toLines = (value: string[]) => value.join('\n');
  const toList = (value: string) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  return (
    <div className="mb-20 pb-20 border-b border-black/5 last:border-0">
      <div className="relative pl-6">
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{ backgroundColor: '#0D1323', opacity: 0.3 }}
        />

        <div className="flex items-start justify-between gap-6">
          <h3 className="text-2xl mb-5 text-black font-medium leading-snug">{title}</h3>
          <div className="text-xs uppercase tracking-widest text-black/40" style={{ fontFamily: 'Inter, sans-serif' }}>
            {verdict}
          </div>
        </div>

        <div className="mb-4 text-base text-black/50 font-light space-x-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="inline-block">Сила сигнала: {score}</span>
          <span className="inline-block">Предиктивный потенциал: {predictiveScore}</span>
          <span className="inline-block">Источники: {sources.join(', ')}</span>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10 text-sm text-black/60 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
          {axes.map((axis) => (
            <div key={axis.label}>
              <div className="text-xs uppercase tracking-widest text-black/35 mb-2">{axis.label}</div>
              <div className="text-base text-black/70">{axis.value}</div>
            </div>
          ))}
        </div>

        {(whyLive || isAdmin) && (
          <div className="mb-8">
          <h4
            className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D1323',
              borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
            }}
          >
            Почему это живое
          </h4>
          {isAdmin ? (
            <textarea
              value={whyLive}
              onChange={(e) => onAdminChange?.({ whyLive: e.target.value })}
              className="w-full border border-black/10 bg-white p-3 text-base text-black/70 font-light outline-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          ) : (
            <p className="text-base text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              {whyLive}
            </p>
          )}
        </div>
        )}

        {(scene || isAdmin) && (
          <div className="mb-8">
          <h4
            className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D1323',
              borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
            }}
          >
            Сцена
          </h4>
          {isAdmin ? (
            <textarea
              value={scene}
              onChange={(e) => onAdminChange?.({ scene: e.target.value })}
              className="w-full border border-black/10 bg-white p-3 text-base text-black/70 font-light outline-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          ) : (
            <p className="text-base text-black/70 font-light italic" style={{ fontFamily: 'Inter, sans-serif' }}>
              {scene}
            </p>
          )}
        </div>
        )}

        {(risk || isAdmin) && (
          <div className="mb-8">
          <h4
            className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D1323',
              borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
            }}
          >
            Риск
          </h4>
          {isAdmin ? (
            <textarea
              value={risk}
              onChange={(e) => onAdminChange?.({ risk: e.target.value })}
              className="w-full border border-black/10 bg-white p-3 text-base text-black/70 font-light outline-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          ) : (
            <p className="text-base text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              {risk}
            </p>
          )}
        </div>
        )}

        {(works.length > 0 || isAdmin) && (
          <div className="mb-8">
          <h4
            className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D1323',
              borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
            }}
          >
            Что работает
          </h4>
          {isAdmin ? (
            <textarea
              value={toLines(works)}
              onChange={(e) => onAdminChange?.({ works: toList(e.target.value) })}
              className="w-full border border-black/10 bg-white p-3 text-base text-black/70 font-light outline-none min-h-[90px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          ) : (
            <ul className="space-y-3 text-base text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              {works.map((item, idx) => (
                <li key={idx}>- {item}</li>
              ))}
            </ul>
          )}
        </div>
        )}

        {(avoid.length > 0 || isAdmin) && (
          <div className="mb-8">
          <h4
            className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D1323',
              borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
            }}
          >
            Что не делать
          </h4>
          {isAdmin ? (
            <textarea
              value={toLines(avoid)}
              onChange={(e) => onAdminChange?.({ avoid: toList(e.target.value) })}
              className="w-full border border-black/10 bg-white p-3 text-base text-black/70 font-light outline-none min-h-[90px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          ) : (
            <ul className="space-y-3 text-base text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              {avoid.map((item, idx) => (
                <li key={idx}>- {item}</li>
              ))}
            </ul>
          )}
        </div>
        )}

        {(angles.length > 0 || isAdmin) && (
          <div className="mb-8">
          <h4
            className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D1323',
              borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
            }}
          >
            Углы
          </h4>
          {isAdmin ? (
            <textarea
              value={toLines(angles)}
              onChange={(e) => onAdminChange?.({ angles: toList(e.target.value) })}
              className="w-full border border-black/10 bg-white p-3 text-base text-black/70 font-light outline-none min-h-[90px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          ) : (
            <ul className="space-y-3 text-base text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              {angles.map((item, idx) => (
                <li key={idx}>- {item}</li>
              ))}
            </ul>
          )}
        </div>
        )}

        {isAdmin && (
          <div className="mt-10 pt-6 border-t border-black/10">
            <h4
              className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#0D1323',
                borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
              }}
            >
              Админ-ревью
            </h4>
            <div className="grid grid-cols-3 gap-6 mb-6 text-sm text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              <label className="flex flex-col gap-2">
                Сила сигнала
                <input
                  type="number"
                  value={score}
                  onChange={(e) => onAdminChange?.({ score: Number(e.target.value) })}
                  className="border-b border-black/10 bg-white py-2 outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                Предиктивный потенциал
                <input
                  type="number"
                  value={predictiveScore}
                  onChange={(e) => onAdminChange?.({ predictiveScore: Number(e.target.value) })}
                  className="border-b border-black/10 bg-white py-2 outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                Вердикт
                <select
                  value={verdict}
                  onChange={(e) => onAdminChange?.({ verdict: e.target.value })}
                  className="border-b border-black/10 bg-white py-2 outline-none"
                >
                  <option value="живое">живое</option>
                  <option value="живое, но узкое">живое, но узкое</option>
                  <option value="шумное">шумное</option>
                  <option value="натянутое">натянутое</option>
                  <option value="лучше не трогать">лучше не трогать</option>
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              Ручная правка / заметка
              <textarea
                value={adminNote}
                onChange={(e) => onAdminChange?.({ adminNote: e.target.value })}
                className="border border-black/10 bg-white p-3 outline-none min-h-[90px]"
              />
            </label>

            <div className="mt-6 flex items-center gap-3 text-sm text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              <input
                value={newSourceKey}
                onChange={(e) => setNewSourceKey(e.target.value)}
                placeholder="Добавить источник (source_key)"
                className="flex-1 border-b border-black/10 bg-white py-2 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newSourceKey.trim()) return;
                  onAdminChange?.({ evidenceAdd: [{ source_key: newSourceKey.trim() }] });
                  setNewSourceKey('');
                }}
                className="text-xs uppercase tracking-widest border-b pb-1"
                style={{ color: '#0D1323', borderBottomColor: 'rgba(13, 19, 35, 0.2)' }}
              >
                Добавить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
