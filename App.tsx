
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import MenuSection from './components/MenuSection';
import CMRSection from './components/CMRSection';
import ProjectSection from './components/ProjectSection';
import LegalSection from './components/LegalSection';
import CookieBanner from './components/CookieBanner';
import Logo from './components/Logo';
import { Section, MenuItem, EventItem, Reservation, ProjectProposal } from './types';
import { backendApi } from './services/backendApi';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.HOME);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('Todos');

  const sectionToPath = (section: Section): string => {
    switch (section) {
      case Section.HOME:
        return '/home';
      case Section.EVENTS:
        return '/axenda';
      case Section.MENU:
        return '/carta';
      case Section.RESERVATIONS:
        return '/reservas';
      case Section.PROJECTS:
        return '/proxectos';
      case Section.CAREERS:
        return '/equipo';
      case Section.LEGAL:
        return '/legal';
      case Section.PRIVACY:
        return '/privacidade';
      case Section.COOKIES:
        return '/cookies';
      case Section.CMR:
        return '/cmr';
      default:
        return '/home';
    }
  };

  const pathToSection = (pathname: string): Section => {
    const clean = String(pathname || '/').trim().toLowerCase();
    if (clean === '/' || clean === '/home') return Section.HOME;
    if (clean === '/axenda') return Section.EVENTS;
    if (clean === '/carta') return Section.MENU;
    if (clean === '/reservas') return Section.RESERVATIONS;
    if (clean === '/proxectos') return Section.PROJECTS;
    if (clean === '/equipo' || clean === '/traballa') return Section.CAREERS;
    if (clean === '/legal') return Section.LEGAL;
    if (clean === '/privacidade') return Section.PRIVACY;
    if (clean === '/cookies') return Section.COOKIES;
    if (clean === '/cmr' || clean === '/admin') return Section.CMR;
    return Section.HOME;
  };

  const navigateToSection = (section: Section, opts?: { replace?: boolean }) => {
    setActiveSection(section);

    const target = sectionToPath(section);
    const current = window.location.pathname || '/';

    if (section === Section.HOME) {
      if (current !== '/' && current !== '/home') {
        const method = opts?.replace ? 'replaceState' : 'pushState';
        window.history[method]({}, '', '/');
      }
      return;
    }

    if (current !== target) {
      const method = opts?.replace ? 'replaceState' : 'pushState';
      window.history[method]({}, '', target);
    }
  };

  useEffect(() => {
    const initial = pathToSection(window.location.pathname);
    if (initial !== activeSection) {
      setActiveSection(initial);
    }

    const onPopState = () => {
      const next = pathToSection(window.location.pathname);
      setActiveSection(next);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const [isReservationsEnabled, setIsReservationsEnabled] = useState<boolean>(true);
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactMail, setContactMail] = useState<string>('');
  const [scheduleText, setScheduleText] = useState<string>('');

  // --- DATA STATE ---
  const [foodMenu, setFoodMenu] = useState<MenuItem[]>([]);
  const [wineMenu, setWineMenu] = useState<MenuItem[]>([]);
  const [foodCategoryOrder, setFoodCategoryOrder] = useState<Array<string>>([]);
  const [wineCategoryOrder, setWineCategoryOrder] = useState<Array<string>>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);

  useEffect(() => {
    let cancelled = false;

    const flattenCategoryOrder = (nodes: Array<{ category: string; subcategory: string | null; orden: number; children: any[] }>): Array<string> => {
      const acc: Array<{ label: string; orden: number }> = [];

      const walk = (items: Array<{ category: string; subcategory: string | null; orden: number; children: any[] }>) => {
        items.forEach((n) => {
          const label = (n.subcategory ?? '').trim();
          if (label) {
            acc.push({ label, orden: Number(n.orden ?? 0) });
          }
          if (Array.isArray(n.children) && n.children.length > 0) {
            walk(n.children as any);
          }
        });
      };

      walk(nodes);
      return acc
        .sort((a, b) => (a.orden - b.orden) || a.label.localeCompare(b.label))
        .map((it) => it.label);
    };

    backendApi
      .getConfig()
      .then((items) => {
        if (cancelled) return;
        if (!Array.isArray(items)) return;

        const reserva = items.find((it) => it.key === 'reserva-activa');
        if (reserva) {
          const raw = String(reserva.value ?? '').trim().toLowerCase();
          if (raw === 'false' || raw === '0' || raw === 'no') {
            setIsReservationsEnabled(false);
          } else if (raw === 'true' || raw === '1' || raw === 'si' || raw === 'sí' || raw === 'yes') {
            setIsReservationsEnabled(true);
          }
        }

        const phone = items.find((it) => it.key === 'telefono-contacto');
        if (phone) setContactPhone(String(phone.value ?? '').trim());

        const mail = items.find((it) => it.key === 'mail-contacto');
        if (mail) setContactMail(String(mail.value ?? '').trim());

        const horario = items.find((it) => it.key === 'horario');
        if (horario) {
          setScheduleText(String(horario.value ?? '').trim());
        }
      })
      .catch(() => {
        // ignore config errors
      });

    backendApi
      .getMenu()
      .then((menu) => {
        if (cancelled) return;
        setFoodMenu(
          menu.food.map((i) => ({
            id: i.id,
            category: i.category || 'Outros',
            name: i.name,
            description: i.description || '',
            image: i.imageUrl || undefined,
            price: i.price ?? 0,
            available: i.isActive ?? true,
            tags: i.tags || [],
          }))
        );
        setWineMenu(
          menu.wines.map((i) => ({
            id: i.id,
            category: i.category || 'Outros',
            name: i.name,
            description: i.description || '',
            image: i.imageUrl || undefined,
            price: i.bottlePrice ?? i.glassPrice ?? 0,
            region: i.region ?? null,
            grapes: i.grapes ?? undefined,
            wineType: (i.wineType ?? undefined) as any,
            glassPrice: i.glassPrice ?? null,
            bottlePrice: i.bottlePrice ?? null,
            available: i.isActive ?? true,
          }))
        );
      })
      .catch(() => {
        // keep local constants as fallback
      });

    Promise.all([backendApi.getMenuCategories('cocina'), backendApi.getMenuCategories('adega')])
      .then(([cocina, vino]) => {
        if (cancelled) return;
        setFoodCategoryOrder(Array.isArray(cocina) ? flattenCategoryOrder(cocina as any) : []);
        setWineCategoryOrder(Array.isArray(vino) ? flattenCategoryOrder(vino as any) : []);
      })
      .catch(() => {
        if (cancelled) return;
        setFoodCategoryOrder([]);
        setWineCategoryOrder([]);
      });

    backendApi
      .getEvents()
      .then((items) => {
        if (cancelled) return;
        setEvents(
          items
            .filter((e) => !!e.title)
            .map((e) => {
              const dt = e.dateStart ? new Date(e.dateStart) : null;
              const date = dt ? dt.toLocaleDateString('gl-ES', { day: '2-digit', month: 'short' }).toUpperCase() : '';
              const time = dt ? dt.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' }) : '';
              return {
                id: e.id,
                title: e.title,
                date,
                time,
                description: e.description,
                image: e.imageUrl || 'https://picsum.photos/800/600?grayscale',
                category: (e.category as any) as EventItem['category'],
                dateStart: e.dateStart,
                dateEnd: e.dateEnd ?? null,
                timezone: e.timezone,
                locationName: e.locationName ?? null,
                isPublished: e.isPublished,
                imageUrl: e.imageUrl,
              };
            })
        );
      })
      .catch(() => {
        // keep local constants as fallback
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'Todos') return events;
    return events.filter(e => e.category === eventFilter);
  }, [events, eventFilter]);

  // Reservation Form Logic
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formGuests, setFormGuests] = useState(2);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formObservations, setFormObservations] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    if (!isReservationsEnabled) {
      setAvailableTimes([]);
      setFormTime('');
      return;
    }
    if (!formDate) {
      setAvailableTimes([]);
      setFormTime('');
      return;
    }

    setIsLoadingAvailability(true);
    backendApi
      .getAvailability(formDate, formGuests)
      .then((res) => {
        setAvailableTimes(res.slots.filter((s) => s.available).map((s) => s.time));
      })
      .catch(() => {
        setAvailableTimes([]);
      })
      .finally(() => setIsLoadingAvailability(false));
  }, [formDate, formGuests, isReservationsEnabled]);

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReservationsEnabled) return;
    try {
      const out = await backendApi.createReservation({
        date: formDate,
        time: formTime,
        partySize: formGuests,
        customer: { name: formName, email: formEmail, phone: formPhone },
        notes: formObservations,
      });

      const newRes: Reservation = {
        id: out.id,
        date: out.date,
        time: out.time,
        guests: out.partySize,
        name: out.customer.name,
        email: out.customer.email || formEmail,
        phone: out.customer.phone || formPhone,
        observations: out.notes || undefined,
        status: 'pending',
        createdAt: out.createdAt,
      };

      setReservations((prev) => [newRes, ...prev]);
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setFormName('');
        setFormEmail('');
        setFormPhone('');
        setFormObservations('');
        setFormDate('');
        setFormTime('');
      }, 5000);
    } catch {
      setFormSuccess(false);
    }
  };

  const handleProposalSubmit = (p: ProjectProposal) => {
    setProposals(prev => [p, ...prev]);
    backendApi.contactProjects({
      name: p.name,
      email: p.email,
      phone: p.phone,
      subject: p.title,
      message: `${p.description}\n\n${p.bio}\n\n${p.socials}`,
      consent: true,
      source: 'website',
      proposalTitle: p.title,
      proposalDiscipline: p.discipline,
      proposalDescription: p.description,
      proposalBio: p.bio,
      proposalSocials: p.socials,
      proposalHasFile: p.hasFile,
      proposalFileBase64: p.fileBase64,
    }).catch(() => {
      // ignore UI errors for now
    });
  };

  if (activeSection === Section.CMR) {
    return (
      <CMRSection 
        reservations={reservations}
        onUpdateStatus={(id, status) => setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))}
        foodMenu={foodMenu} setFoodMenu={setFoodMenu} 
        wineMenu={wineMenu} setWineMenu={setWineMenu}
        events={events} setEvents={setEvents}
        proposals={proposals} setProposals={setProposals}
        onExit={() => navigateToSection(Section.HOME)}
      />
    );
  }

  const isLightBackground = activeSection === Section.MENU || activeSection === Section.CAREERS;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#4a5d23] flex flex-col">
      <Navbar currentSection={activeSection} onNavigate={navigateToSection} isLightBackground={isLightBackground} />
      <main className="flex-grow">
        {activeSection === Section.HOME && (
          <div className="animate-in fade-in duration-1000">
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=2000&auto=format&fit=crop&grayscale" alt="A Riala Taberna Interior" className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black"></div>
              </div>
              <div className="relative z-10 text-center px-4 max-w-6xl mx-auto flex flex-col items-center">
                <h2 className="text-sm md:text-base uppercase tracking-[0.6em] mb-8 text-white/70 font-light animate-in slide-in-from-top duration-1000">Gastronomía Galega · Cultura · Viños</h2>
                <div className="mb-14 w-full animate-in zoom-in duration-1000 delay-200">
                  <Logo className="drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] scale-110 md:scale-150" />
                </div>
                <p className="text-xl md:text-3xl font-light max-w-3xl mx-auto mb-14 text-gray-100 leading-relaxed italic animate-in fade-in duration-1000 delay-500">
                  "Onde o tempo detense entre conversas e o mellor da nosa terra."
                </p>
                <div className="flex flex-col md:flex-row gap-8 justify-center animate-in slide-in-from-bottom duration-1000 delay-700">
                  <button onClick={() => navigateToSection(Section.RESERVATIONS)} className="group relative overflow-hidden border-2 border-white px-12 py-5 uppercase tracking-widest text-sm font-bold transition-all duration-300 hover:text-black">
                    <span className="relative z-10">Reservar Mesa</span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                  <button onClick={() => navigateToSection(Section.MENU)} className="bg-[#4a5d23] hover:bg-[#5b722d] text-white px-12 py-5 uppercase tracking-widest text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-[#4a5d23]/20">
                    Descubrir a Carta
                  </button>
                </div>

              </div>
            </section>
            
            <section className="py-32 px-6 bg-black">
              <div className="max-w-4xl mx-auto text-center">
                <div className="w-16 h-[2px] bg-[#4a5d23] mx-auto mb-12"></div>
                <h2 className="text-4xl md:text-6xl font-black uppercase mb-10 tracking-tighter">A RIALA TABERNA</h2>
                <p className="text-gray-400 max-w-2xl mx-auto italic text-xl leading-loose mb-12">
                  No corazón da Estrada, recuperamos a esencia das tabernas de sempre cunha ollada contemporánea. Un punto de encontro cultural onde o produto galego e os viños de autor son os protagonistas.
                </p>

                {scheduleText ? (
                  <div className="max-w-xl mx-auto mb-14 border border-gray-900 bg-[#0a0a0a] p-8">
                    <div className="text-[#4a5d23] font-bold tracking-[0.4em] text-xs uppercase mb-4">HORARIO</div>
                    <div className="text-gray-200 text-base md:text-lg whitespace-pre-line leading-relaxed font-semibold">
                      {scheduleText.replace(/\s*\|\s*/g, '\n')}
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                  <div>
                    <h3 className="text-[#4a5d23] font-bold uppercase tracking-widest text-xs mb-4">Cociña</h3>
                    <p className="text-sm text-gray-500">Sabores auténticos e honestos con materia prima de proximidade.</p>
                  </div>
                  <div>
                    <h3 className="text-[#4a5d23] font-bold uppercase tracking-widest text-xs mb-4">Adega</h3>
                    <p className="text-sm text-gray-500">Unha viaxe polas D.O. galegas e seleccións exclusivas de viticultores.</p>
                  </div>
                  <div>
                    <h3 className="text-[#4a5d23] font-bold uppercase tracking-widest text-xs mb-4">Cultura</h3>
                    <p className="text-sm text-gray-500">Exposicións, música e encontros que dan vida ao noso espazo.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeSection === Section.EVENTS && (
          <div className="pt-40 pb-32 px-6 md:px-12 bg-[#0a0a0a] min-h-screen">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <div>
                  <h2 className="text-6xl md:text-8xl font-black mb-4 uppercase tracking-tighter">AXENDA</h2>
                  <p className="text-[#4a5d23] font-bold tracking-[0.3em] text-sm uppercase">Cultura viva na Estrada</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {['Todos', 'Concerto', 'Cata', 'Exposición', '[·] de encontro'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setEventFilter(cat)}
                      className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        eventFilter === cat ? 'bg-[#4a5d23] border-[#4a5d23] text-white' : 'border-gray-800 text-gray-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="group bg-[#111] border border-gray-900 overflow-hidden cursor-pointer transition-all duration-500 hover:border-[#4a5d23]/50" 
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] bg-white text-black px-2 py-1 uppercase font-black">{event.category}</span>
                        <span className="text-[#4a5d23] font-bold text-xs uppercase tracking-widest">{event.date}</span>
                      </div>
                      <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 group-hover:text-[#4a5d23] transition-colors">{event.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 italic">{event.description}</p>
                      <div className="mt-8 pt-6 border-t border-gray-900 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <span>{event.time}</span>
                        <span className="group-hover:text-white transition-colors">Saber máis +</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === Section.MENU && (
          <div className="pt-40 pb-32 bg-white min-h-screen">
            <MenuSection
              foodItems={foodMenu}
              wineItems={wineMenu}
              foodCategoryOrder={foodCategoryOrder}
              wineCategoryOrder={wineCategoryOrder}
            />
          </div>
        )}
        
        {activeSection === Section.RESERVATIONS && (
          <div className="pt-40 pb-32 px-6 bg-black min-h-screen flex items-center">
             <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div>
                  <h2 className="text-6xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-none">RESERVA A TÚA <span className="text-[#4a5d23]">EXPERIENCIA</span></h2>
                  <p className="text-xl text-gray-400 italic mb-12">Para mesas de máis de 8 persoas ou eventos privados, por favor contacta directamente por teléfono.</p>
                  <div className="space-y-4 text-gray-400">
                    <p className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#4a5d23]"></span> Tel: {contactPhone || '+34 986 XX XX XX'}</p>
                    <p className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#4a5d23]"></span> Mail: {contactMail || 'reservas@ariala.gal'}</p>
                    <p className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#4a5d23]"></span> Zona dos Viños, A Estrada</p>
                  </div>
               </div>
               <div className="bg-[#111] p-10 border border-gray-900 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#4a5d23]"></div>

                  {!isReservationsEnabled && (
                    <div className="mb-8 border border-gray-800 bg-black/30 p-6">
                      <div className="text-[#4a5d23] text-xs font-bold uppercase tracking-[0.4em] mb-3">Reservas non dispoñibles</div>
                      <p className="text-gray-400 text-sm italic leading-relaxed">
                        Neste momento as reservas están desactivadas. Por favor, contacta connosco por teléfono ou email.
                      </p>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleReservationSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Data</label>
                          <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full bg-black border border-gray-800 p-4 text-white disabled:opacity-30 focus:border-[#4a5d23] outline-none transition-colors" disabled={!isReservationsEnabled} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Hora</label>
                          <select required value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full bg-black border border-gray-800 p-4 text-white disabled:opacity-30 focus:border-[#4a5d23] outline-none transition-colors" disabled={!isReservationsEnabled || !formDate || isLoadingAvailability || availableTimes.length === 0}>
                              <option value="">{formDate ? (isLoadingAvailability ? 'Cargando...' : (availableTimes.length > 0 ? 'Escoller' : 'Non dispoñible')) : '—'}</option>
                              {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Comensais</label>
                          <input type="number" min="1" max="8" required value={formGuests} onChange={e => setFormGuests(parseInt(e.target.value))} className="w-full bg-black border border-gray-800 p-4 text-white disabled:opacity-30 focus:border-[#4a5d23] outline-none transition-colors" disabled={!isReservationsEnabled} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Nome</label>
                          <input type="text" placeholder="O teu nome" required value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-black border border-gray-800 p-4 text-white disabled:opacity-30 focus:border-[#4a5d23] outline-none transition-colors" disabled={!isReservationsEnabled} />
                        </div>
                      </div>
                      <input type="email" placeholder="Correo electrónico" required value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full bg-black border border-gray-800 p-4 text-white disabled:opacity-30 focus:border-[#4a5d23] outline-none transition-colors" disabled={!isReservationsEnabled} />
                      <button type="submit" className="w-full bg-[#4a5d23] py-5 uppercase font-black tracking-widest hover:bg-[#5b722d] transition-all shadow-xl disabled:opacity-30 disabled:hover:bg-[#4a5d23]" disabled={!isReservationsEnabled}>Solicitar Confirmación</button>
                  </form>
                  {formSuccess && <p className="mt-6 text-green-500 text-center font-bold animate-in fade-in slide-in-from-top-2">Recibimos a túa solicitude. Confirmaremos por email!</p>}
               </div>
             </div>
          </div>
        )}

        {activeSection === Section.PROJECTS && <div className="pt-40 pb-32 px-6 bg-[#0d0d0d] min-h-screen"><ProjectSection onSubmit={handleProposalSubmit} /></div>}
        
        {activeSection === Section.CAREERS && (
          <div className="pt-40 pb-32 px-6 bg-white text-black min-h-screen flex flex-col items-center justify-center text-center">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-8 tracking-tighter">EQUIPO</h2>
            <p className="text-2xl max-w-2xl italic text-gray-600 leading-relaxed mb-12">Buscamos persoas con paixón pola hostalería e a cultura que queiran formar parte dun proxecto diferente na Estrada.</p>
            <a href="mailto:info@ariala.gal" className="bg-black text-white px-12 py-5 uppercase font-bold tracking-widest hover:bg-[#4a5d23] transition-all">Envíanos o teu CV</a>
          </div>
        )}
        
        {(activeSection === Section.LEGAL || activeSection === Section.PRIVACY || activeSection === Section.COOKIES) && <div className="pt-32 min-h-screen bg-[#0d0d0d]"><LegalSection activeTab={activeSection} /></div>}
      </main>

      <footer className="bg-black text-gray-600 py-24 px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-2">
              <div className="text-white font-black text-2xl uppercase tracking-tighter mb-8">A RIALA <span className="font-light text-gray-500">TABERNA</span></div>
              <p className="max-w-xs text-sm italic leading-relaxed">Zona dos Viños. Un espazo de encontro cultural e gastronómico no corazón da Estrada.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Navegación</h4>
              <button onClick={() => navigateToSection(Section.MENU)} className="block hover:text-white transition-colors">A Carta</button>
              <button onClick={() => navigateToSection(Section.EVENTS)} className="block hover:text-white transition-colors">Axenda</button>
              <button onClick={() => navigateToSection(Section.RESERVATIONS)} className="block hover:text-white transition-colors">Reservas</button>
            </div>
            <div className="space-y-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Legal</h4>
              <button onClick={() => navigateToSection(Section.LEGAL)} className="block hover:text-white transition-colors">Aviso Legal</button>
              <button onClick={() => navigateToSection(Section.PRIVACY)} className="block hover:text-white transition-colors">Privacidade</button>
              <button onClick={() => navigateToSection(Section.COOKIES)} className="block hover:text-white transition-colors">Cookies</button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-gray-900 text-[10px] font-bold uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} A Riala Taberna. Todos os dereitos reservados.</p>
            <div className="flex items-center gap-6">
              <a href="https://instagram.com/arialataberna" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <button onClick={() => navigateToSection(Section.CMR)} className="border border-gray-800 px-4 py-2 hover:border-white hover:text-white transition-all">Acceso Admin</button>
            </div>
          </div>
        </div>
      </footer>
      <CookieBanner onNavigate={navigateToSection} />

      {selectedEvent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/98 backdrop-blur-md" onClick={() => setSelectedEvent(null)}></div>
            <div className="relative bg-[#111] border border-gray-800 max-w-5xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="md:w-1/2 aspect-square md:aspect-auto"><img src={selectedEvent.image} alt="" className="w-full h-full object-cover grayscale" /></div>
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                    <span className="text-[#4a5d23] font-bold text-xs uppercase tracking-[0.4em] mb-4 block">{selectedEvent.category}</span>
                    <h2 className="text-5xl font-black mb-8 uppercase tracking-tighter leading-none">{selectedEvent.title}</h2>
                    <div className="flex gap-8 mb-10 text-xs font-bold uppercase tracking-widest text-white/60">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4a5d23]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {selectedEvent.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4a5d23]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedEvent.time}
                      </div>
                    </div>
                    <p className="text-gray-400 mb-12 italic text-lg leading-relaxed">{selectedEvent.description}</p>
                    <button onClick={() => setSelectedEvent(null)} className="w-full bg-[#4a5d23] text-white py-5 uppercase font-black tracking-widest hover:bg-[#5b722d] transition-all shadow-xl">Pechar Detalle</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
