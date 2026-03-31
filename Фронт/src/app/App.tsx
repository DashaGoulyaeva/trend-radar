import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TrendCard } from './components/TrendCard';
import { UpcomingCard } from './components/UpcomingCard';

export default function App() {
  const [selectedMode, setSelectedMode] = useState('Default');
  const [inputValue, setInputValue] = useState('');
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSearch = () => {
    if (inputValue.trim()) {
      setCurrentView('dashboard');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Landing View
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen w-full bg-white text-black">
        {/* Top Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/5">
          <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
            <h1 className="text-xl tracking-tight text-black font-medium">Trend Radar</h1>
            <div className="text-sm font-light" style={{ fontFamily: 'Inter, sans-serif', color: '#0D1323', opacity: 0.4 }}>
              Free
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-40 pb-20 px-8">
          <div className="max-w-2xl mx-auto">
            {/* Hero Section */}
            <div className="mb-24">
              <h2 className="text-5xl mb-16 text-black leading-tight tracking-tight">
                What do you want to explore?
              </h2>

              {/* Input Field */}
              <div className="space-y-6">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your niche or topic..."
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
                    <option value="Default">Default</option>
                    <option value="Push">Push</option>
                    <option value="Content">Content</option>
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
                    Search →
                  </button>
                </div>
              </div>
            </div>

            {/* Example Section */}
            <div className="border-t pt-16" style={{ borderTopColor: 'rgba(13, 19, 35, 0.1)' }}>
              <h3
                className="text-xs uppercase tracking-widest mb-12 font-light"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#0D1323',
                  opacity: 0.4
                }}
              >
                Start from an example
              </h3>

              <div className="space-y-10">
                <button
                  onClick={() => {
                    setInputValue('Food delivery trends');
                    setCurrentView('dashboard');
                  }}
                  className="block w-full text-left pb-8 border-b transition-colors"
                  style={{ borderBottomColor: 'rgba(13, 19, 35, 0.05)' }}
                >
                  <h4 className="text-xl mb-2 text-black transition-opacity hover:opacity-60">
                    Food delivery trends
                  </h4>
                  <p className="text-base text-black/40 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Discover what's trending in the food delivery space
                  </p>
                </button>

                <button
                  onClick={() => {
                    setInputValue('Seasonal events & holidays');
                    setCurrentView('dashboard');
                  }}
                  className="block w-full text-left pb-8 border-b transition-colors"
                  style={{ borderBottomColor: 'rgba(13, 19, 35, 0.05)' }}
                >
                  <h4 className="text-xl mb-2 text-black transition-opacity hover:opacity-60">
                    Seasonal events & holidays
                  </h4>
                  <p className="text-base text-black/40 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Find upcoming seasonal opportunities and trending topics
                  </p>
                </button>

                <button
                  onClick={() => {
                    setInputValue('Content ideas for push notifications');
                    setCurrentView('dashboard');
                  }}
                  className="block w-full text-left pb-8 border-b transition-colors"
                  style={{ borderBottomColor: 'rgba(13, 19, 35, 0.05)' }}
                >
                  <h4 className="text-xl mb-2 text-black transition-opacity hover:opacity-60">
                    Push notifications
                  </h4>
                  <p className="text-base text-black/40 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Get fresh ideas for engaging campaigns
                  </p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen w-full bg-white text-black">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="ml-56 px-16 py-20 min-h-screen max-w-5xl">
        {/* Header */}
        <div className="mb-24">
          <h1
            className="text-4xl text-black mb-3 pb-4 tracking-tight"
            style={{
              borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
            }}
          >
            Today's trends
          </h1>
          <p className="text-base text-black/40 font-light mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {inputValue || 'Exploring trends'}
          </p>
        </div>

        {/* Trends Section */}
        <section className="mb-32">
          <TrendCard
            title="Late-night comfort food delivery is surging"
            score={92}
            sources={['Telegram', 'VK', 'Retail']}
            context="evening, at home, watching series"
            ideas={[
              'Create a "Midnight Snack Attack" campaign with comfort food bundles',
              'Highlight cozy, indulgent options for late-night cravings',
            ]}
          />

          <TrendCard
            title="Healthy meal prep kits gaining momentum"
            score={87}
            sources={['Instagram', 'TikTok', 'Blogs']}
            context="morning, planning ahead, fitness-focused"
            ideas={[
              'Launch "Meal Prep Mondays" with weekly meal kits',
              'Partner with fitness influencers for authentic content',
            ]}
          />

          <TrendCard
            title="Exotic cuisine exploration on the rise"
            score={82}
            sources={['YouTube', 'Reddit', 'Food Apps']}
            context="weekend, adventurous mood, trying new things"
            ideas={[
              'Develop "Around the World in 30 Days" featuring different cuisines',
              'Create educational content about cultural food traditions',
            ]}
          />

          <TrendCard
            title="Quick breakfast delivery for busy professionals"
            score={78}
            sources={['LinkedIn', 'News', 'Apps']}
            context="weekday mornings, rushing, need convenience"
            ideas={[
              'Introduce "Power Breakfast in 15 Minutes" for time-strapped users',
              'Emphasize speed and nutrition in marketing materials',
            ]}
          />
        </section>

        {/* Upcoming Section */}
        <section className="mb-32 pb-24 border-t border-black/5 pt-20">
          <h2
            className="text-3xl text-black mb-12 pb-4 tracking-tight"
            style={{
              borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
            }}
          >
            Upcoming
          </h2>

          <div className="space-y-10 mt-10">
            <UpcomingCard
              eventName="Earth Day"
              date="April 22, 2026"
              description="Eco-friendly and sustainable food options will be trending"
            />

            <UpcomingCard
              eventName="Champions League Final"
              date="May 30, 2026"
              description="Sports viewing parties and group orders expected to spike"
            />

            <UpcomingCard
              eventName="Summer Solstice"
              date="June 21, 2026"
              description="Light meals, outdoor dining, and BBQ themes trending"
            />
          </div>
        </section>

        {/* General Ideas Section */}
        <section className="mb-32 pb-24 border-t border-black/5 pt-20">
          <h2
            className="text-3xl text-black mb-12 pb-4 tracking-tight"
            style={{
              borderBottom: '1px solid rgba(13, 19, 35, 0.2)'
            }}
          >
            Additional ideas
          </h2>

          <ul className="space-y-5 text-base text-black/70 font-light mt-10" style={{ fontFamily: 'Inter, sans-serif' }}>
            <li>– Plant-based alternatives are becoming mainstream—consider dedicated vegan/vegetarian sections</li>
            <li>– Weekend brunch culture is strong—create special weekend-only offerings</li>
            <li>– Office lunch trends are shifting toward healthier, lighter options</li>
            <li>– Family dinner bundles gain traction on weeknights</li>
            <li>– Late-night dessert delivery has untapped potential in urban areas</li>
          </ul>
        </section>
      </main>
    </div>
  );
}