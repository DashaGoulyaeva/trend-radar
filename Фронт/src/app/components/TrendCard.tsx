interface TrendCardProps {
  title: string;
  score: number;
  sources: string[];
  context: string;
  ideas: string[];
}

export function TrendCard({ title, score, sources, context, ideas }: TrendCardProps) {
  return (
    <div className="mb-20 pb-20 border-b border-black/5 last:border-0">
      <div className="relative pl-6">
        {/* Vertical accent line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{ backgroundColor: '#0D1323', opacity: 0.3 }}
        />

        <h3 className="text-2xl mb-5 text-black font-medium leading-snug">{title}</h3>

        <div className="mb-4 text-base text-black/50 font-light space-x-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="inline-block">Score: {score}</span>
          <span className="inline-block">Sources: {sources.join(', ')}</span>
        </div>

        <p className="text-base text-black/60 mb-10 italic font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
          Context: {context}
        </p>

        <div className="mb-8">
          <h4
            className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D1323',
              borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
            }}
          >
            How to use
          </h4>
          <ul className="space-y-3 text-base text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
            <li>– Focus on the emotional context</li>
            <li>– Emphasize convenience and timing</li>
          </ul>
        </div>

        {ideas.length > 0 && (
          <div>
            <h4
              className="text-xs uppercase tracking-widest mb-4 pb-2 font-light"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#0D1323',
                borderBottom: '1px solid rgba(13, 19, 35, 0.15)'
              }}
            >
              Ideas
            </h4>
            <ul className="space-y-3 text-base text-black/70 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              {ideas.map((idea, idx) => (
                <li key={idx}>– {idea}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
