import { Sparkles, Bell, Calendar } from 'lucide-react';

interface ExampleCardProps {
  title: string;
  description: string;
  icon: 'sparkles' | 'bell' | 'calendar';
  onClick?: () => void;
}

const iconMap = {
  sparkles: Sparkles,
  bell: Bell,
  calendar: Calendar,
};

export function ExampleCard({ title, description, icon, onClick }: ExampleCardProps) {
  const Icon = iconMap[icon];

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 p-6 text-left transition-all hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
          <Icon className="w-6 h-6 text-purple-300" />
        </div>

        <h3 className="mb-2 text-white/90">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
