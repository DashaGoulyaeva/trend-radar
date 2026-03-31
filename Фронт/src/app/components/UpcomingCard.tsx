interface UpcomingCardProps {
  eventName: string;
  date: string;
  description: string;
}

export function UpcomingCard({ eventName, date, description }: UpcomingCardProps) {
  return (
    <div className="pb-8 border-b border-black/5 last:border-0">
      <h4 className="text-xl text-black mb-2 font-medium">{eventName}</h4>
      <p
        className="text-sm mb-3 font-light"
        style={{
          fontFamily: 'Inter, sans-serif',
          color: '#0D1323',
          opacity: 0.5
        }}
      >
        {date}
      </p>
      <p className="text-base text-black/60 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        {description}
      </p>
    </div>
  );
}
