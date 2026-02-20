import React, { useMemo } from 'react';
import { EventItem } from '../types';

type UpcomingEventsSectionProps = {
  events: EventItem[];
  onEventClick?: (event: EventItem) => void;
  onSeeAll?: () => void;
  title?: string;
};

const toDateValue = (e: EventItem): number => {
  if (!e.dateStart) return Number.POSITIVE_INFINITY;
  const t = new Date(e.dateStart).getTime();
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
};

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  onEventClick,
  onSeeAll,
  title = 'PRÓXIMOS ENCONTROS',
}) => {
  const upcoming = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    return (events || [])
      .filter((e) => {
        if (e.isPublished === false) return false;
        const t = toDateValue(e);
        if (!Number.isFinite(t)) return false;
        return t >= todayStartMs;
      })
      .sort((a, b) => toDateValue(a) - toDateValue(b))
      .slice(0, 3);
  }, [events]);

  if (!upcoming.length) return null;

  return (
    <section className="py-28 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="w-16 h-[2px] bg-[#4a5d23] mx-auto mb-10"></div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.35em] text-white/90">
            {title}
          </h2>
        </div>

        <div className="relative">
          <div className="flex gap-8 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
            {upcoming.map((event) => (
              <button
                key={event.id}
                type="button"
                className="snap-start shrink-0 text-left w-[78vw] sm:w-[420px] bg-[#0b0b0b] border border-gray-900 overflow-hidden transition-all duration-500 hover:border-[#4a5d23]/50"
                onClick={() => onEventClick?.(event)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover grayscale transition-all duration-700 hover:grayscale-0 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-center gap-6 mb-6">
                    <span className="text-[10px] bg-white text-black px-2 py-1 uppercase font-black">
                      {event.category}
                    </span>
                    <span className="text-[#4a5d23] font-bold text-xs uppercase tracking-widest whitespace-nowrap">
                      {event.date}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 hover:text-[#4a5d23] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 italic">{event.description}</p>
                  <div className="mt-8 pt-6 border-t border-gray-900 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <span>{event.time}</span>
                    <span className="text-white/60">Saber máis +</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {onSeeAll && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={onSeeAll}
                className="border border-gray-800 px-10 py-4 uppercase tracking-widest text-xs font-black hover:border-white hover:text-white transition-all"
              >
                Ver axenda completa
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
