
import React, { useState } from 'react';
import { Reservation, MenuItem, EventItem, ProjectProposal, EventCategory } from '../types';
import { COLORS, WINE_DO_ORDER } from '../constants';
import { backendApi, BasicAuth } from '../services/backendApi';

interface CMRSectionProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled') => void;
  foodMenu: MenuItem[];
  setFoodMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  wineMenu: MenuItem[];
  setWineMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  proposals: ProjectProposal[];
  setProposals: React.Dispatch<React.SetStateAction<ProjectProposal[]>>;
  onExit: () => void;
}

const CMRSection: React.FC<CMRSectionProps> = ({ 
    reservations, 
    onUpdateStatus, 
    foodMenu, setFoodMenu,
    wineMenu, setWineMenu,
    events, setEvents,
    proposals, setProposals,
    onExit 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [auth, setAuth] = useState<BasicAuth | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reservations' | 'customers' | 'menu' | 'events' | 'proposals'>('dashboard');

  // --- MENU MANAGEMENT STATE ---
  const [menuType, setMenuType] = useState<'food' | 'wine'>('food');
  const [editMenuIndex, setEditMenuIndex] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemAvailable, setNewItemAvailable] = useState(true);
  
  // Wine specific fields
  const [newItemWinery, setNewItemWinery] = useState('');
  const [newItemWinemaker, setNewItemWinemaker] = useState('');
  const [newItemGrapes, setNewItemGrapes] = useState('');
  const [newItemWineType, setNewItemWineType] = useState<'Blanco' | 'Tinto' | 'Doce' | 'Espumoso'>('Blanco');

  // --- EVENT MANAGEMENT STATE ---
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventImage, setNewEventImage] = useState('');
  const [newEventCat, setNewEventCat] = useState<EventCategory>('Concerto');

  // Stats
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.date === today && r.status === 'confirmed').length;
  const newProposalsCount = proposals.filter(p => p.status === 'new').length;

  // Unique customers logic
  const uniqueCustomers = Array.from(new Set(reservations.map(r => r.email)))
    .map(email => {
      return reservations.find(r => r.email === email);
    }).filter(Boolean) as Reservation[];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextAuth = { username, password };
    try {
      await backendApi.admin.listConfig(nextAuth);
      try {
        const items = await backendApi.admin.listEvents(nextAuth);
        setEvents(
          items
            .filter((it) => !!(it.title || it.name))
            .map((it) => ({
              id: typeof it.id === 'number' ? it.id : Number(it.id),
              title: (it.title || it.name || '').toString(),
              date: (it.date || '').toString(),
              time: (it.time || '').toString(),
              description: (it.description || '').toString(),
              image: (it.image || 'https://picsum.photos/800/600?grayscale').toString(),
              category: ((it.category || 'Concerto') as any) as EventItem['category'],
            }))
        );
      } catch {
        // ignore events load errors on login
      }
      setAuth(nextAuth);
      setIsAuthenticated(true);
      setError('');
    } catch {
      setAuth(null);
      setError('Credenciais incorrectas');
    }
  };

  const handleMenuImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth) return;

      const newItem: MenuItem = {
          name: newItemName,
          description: newItemDesc,
          price: parseFloat(newItemPrice),
          category: newItemCategory || (menuType === 'food' ? 'Novos' : 'Rias Baixas'),
          tags: [],
          available: newItemAvailable,
          image: newItemImage || undefined,
          winery: menuType === 'wine' ? newItemWinery : undefined,
          winemaker: menuType === 'wine' ? newItemWinemaker : undefined,
          grapes: menuType === 'wine' ? newItemGrapes : undefined,
          wineType: menuType === 'wine' ? newItemWineType : undefined,
      };

      try {
        if (menuType === 'food') {
          await backendApi.admin.createFood(auth, {
            name: newItem.name,
            description: newItem.description,
            price: newItem.price,
          });
        } else {
          await backendApi.admin.createWine(auth, {
            name: newItem.name,
            description: newItem.description,
            category: newItem.category,
            region: undefined,
            bottlePrice: newItem.price,
          });
        }

        const menu = await backendApi.getMenu();
        setFoodMenu(
          menu.food.map((i) => ({
            category: 'A Cociña',
            name: i.name,
            description: i.description || '',
            price: i.price ?? 0,
            available: i.isActive ?? true,
            tags: i.tags || [],
          }))
        );
        setWineMenu(
          menu.wines.map((i) => ({
            category: i.category || 'Outros',
            name: i.name,
            description: i.description || '',
            price: i.bottlePrice ?? i.glassPrice ?? 0,
            available: i.isActive ?? true,
          }))
        );

        resetMenuForm();
      } catch {
        // keep form state
      }
  };

  const handleToggleAvailability = (index: number) => {
      if (menuType === 'food') {
          const updated = [...foodMenu];
          updated[index].available = !updated[index].available;
          setFoodMenu(updated);
      } else {
          const updated = [...wineMenu];
          updated[index].available = !updated[index].available;
          setWineMenu(updated);
      }
  };

  const handleEditMenuItem = (index: number) => {
      const list = menuType === 'food' ? foodMenu : wineMenu;
      const item = list[index];
      setNewItemName(item.name);
      setNewItemDesc(item.description);
      setNewItemPrice(item.price.toString());
      setNewItemCategory(item.category);
      setNewItemImage(item.image || '');
      setNewItemAvailable(item.available);
      setNewItemWinery(item.winery || '');
      setNewItemWinemaker(item.winemaker || '');
      setNewItemGrapes(item.grapes || '');
      setNewItemWineType(item.wineType || 'Blanco');
      setEditMenuIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMenuItem = (index: number) => {
      if(menuType === 'food') {
          setFoodMenu(foodMenu.filter((_, i) => i !== index));
      } else {
          setWineMenu(wineMenu.filter((_, i) => i !== index));
      }
      if (editMenuIndex === index) resetMenuForm();
  };

  const resetMenuForm = () => {
      setNewItemName(''); setNewItemDesc(''); setNewItemPrice(''); setNewItemCategory('');
      setNewItemWinery(''); setNewItemWinemaker(''); setNewItemGrapes(''); setNewItemWineType('Blanco');
      setNewItemImage(''); setNewItemAvailable(true);
      setEditMenuIndex(null);
  };

  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEventImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    const payload = {
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime,
      description: newEventDesc,
      image: newEventImage || null,
      category: newEventCat,
    };

    try {
      if (editEventId !== null) {
        await backendApi.admin.updateEvent(auth, editEventId, payload);
      } else {
        await backendApi.admin.createEvent(auth, payload);
      }

      const items = await backendApi.admin.listEvents(auth);
      setEvents(
        items
          .filter((it) => !!(it.title || it.name))
          .map((it) => ({
            id: typeof it.id === 'number' ? it.id : Number(it.id),
            title: (it.title || it.name || '').toString(),
            date: (it.date || '').toString(),
            time: (it.time || '').toString(),
            description: (it.description || '').toString(),
            image: (it.image || 'https://picsum.photos/800/600?grayscale').toString(),
            category: ((it.category || 'Concerto') as any) as EventItem['category'],
          }))
      );
      resetEventForm();
    } catch {
      // keep form state
    }
  };

  const handleEditEvent = (event: EventItem) => {
      setNewEventTitle(event.title);
      setNewEventDate(event.date);
      setNewEventTime(event.time);
      setNewEventDesc(event.description);
      setNewEventCat(event.category);
      setNewEventImage(event.image);
      setEditEventId(event.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (id: number) => {
    if (!auth) return;
    try {
      await backendApi.admin.deleteEvent(auth, id);
      const items = await backendApi.admin.listEvents(auth);
      setEvents(
        items
          .filter((it) => !!(it.title || it.name))
          .map((it) => ({
            id: typeof it.id === 'number' ? it.id : Number(it.id),
            title: (it.title || it.name || '').toString(),
            date: (it.date || '').toString(),
            time: (it.time || '').toString(),
            description: (it.description || '').toString(),
            image: (it.image || 'https://picsum.photos/800/600?grayscale').toString(),
            category: ((it.category || 'Concerto') as any) as EventItem['category'],
          }))
      );
      if (editEventId === id) resetEventForm();
    } catch {
      // ignore
    }
  };

  const handleTogglePublish = async (eventId: number, nextPublished: boolean) => {
    if (!auth) return;
    try {
      if (nextPublished) {
        await backendApi.admin.publishEvent(auth, eventId);
      } else {
        await backendApi.admin.unpublishEvent(auth, eventId);
      }
      const items = await backendApi.admin.listEvents(auth);
      setEvents(
        items
          .filter((it) => !!(it.title || it.name))
          .map((it) => ({
            id: typeof it.id === 'number' ? it.id : Number(it.id),
            title: (it.title || it.name || '').toString(),
            date: (it.date || '').toString(),
            time: (it.time || '').toString(),
            description: (it.description || '').toString(),
            image: (it.image || 'https://picsum.photos/800/600?grayscale').toString(),
            category: ((it.category || 'Concerto') as any) as EventItem['category'],
          }))
      );
    } catch {
      // ignore
    }
  };

  const resetEventForm = () => {
      setNewEventTitle(''); setNewEventDate(''); setNewEventTime(''); setNewEventDesc(''); setNewEventImage('');
      setEditEventId(null);
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'Blanco': return COLORS.mossGreen;
      case 'Tinto': return COLORS.tinto;
      case 'Doce': return COLORS.doce;
      case 'Espumoso': return COLORS.espumoso;
      default: return '#000000';
    }
  };

  const handleMarkProposalRead = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'read' } : p));
  };

  const handleDeleteProposal = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Reservas Hoxe</div>
        <div className="text-3xl font-bold text-black">{todayReservations}</div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Pendentes</div>
        <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Novas Propostas</div>
        <div className="text-3xl font-bold text-blue-600">{newProposalsCount}</div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Confirmadas</div>
        <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
      </div>
    </div>
  );

  const renderMenuManagement = () => (
      <div>
          <div className="flex gap-4 mb-6">
              <button onClick={() => { setMenuType('food'); resetMenuForm(); }} className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider ${menuType === 'food' ? 'bg-[#4a5d23] text-white' : 'bg-white border text-gray-600'}`}>Cociña</button>
              <button onClick={() => { setMenuType('wine'); resetMenuForm(); }} className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider ${menuType === 'wine' ? 'bg-[#4a5d23] text-white' : 'bg-white border text-gray-600'}`}>Adega</button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 border-l-4" style={{ borderLeftColor: editMenuIndex !== null ? '#3b82f6' : COLORS.mossGreen }}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                  {editMenuIndex !== null ? `Editando: ${menuType === 'food' ? foodMenu[editMenuIndex]?.name : wineMenu[editMenuIndex]?.name}` : `Engadir Novo ${menuType === 'food' ? 'Prato' : 'Viño'}`}
              </h3>
              <form onSubmit={handleSaveMenuItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <input type="text" placeholder="Nome" required value={newItemName} onChange={e => setNewItemName(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  
                  {menuType === 'wine' ? (
                    <>
                      <input type="text" placeholder="Adega" value={newItemWinery} onChange={e => setNewItemWinery(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                      <input type="text" placeholder="Vinicultor / Enólogo" value={newItemWinemaker} onChange={e => setNewItemWinemaker(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                      <input type="text" placeholder="Uvas" value={newItemGrapes} onChange={e => setNewItemGrapes(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                      <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="border p-2 rounded text-sm w-full text-black">
                        <option value="">Selecciona D.O.</option>
                        {WINE_DO_ORDER.map(doName => <option key={doName} value={doName}>{doName}</option>)}
                      </select>
                      <select value={newItemWineType} onChange={e => setNewItemWineType(e.target.value as any)} className="border p-2 rounded text-sm w-full text-black">
                        <option value="Blanco">Blanco</option>
                        <option value="Tinto">Tinto</option>
                        <option value="Doce">Doce</option>
                        <option value="Espumoso">Espumoso</option>
                      </select>
                    </>
                  ) : (
                    <input type="text" placeholder="Categoría (Ex: Entremés)" value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  )}

                  <input type="text" placeholder="Descrición / Notas" required value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <input type="number" placeholder="Prezo (€)" step="0.1" required value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  
                  {/* Image Upload for Menu Item */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Foto do Prato/Botella</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleMenuImageUpload} 
                      className="border p-1.5 rounded text-xs w-full text-black file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300" 
                    />
                    {newItemImage && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={newItemImage} alt="Preview" className="w-10 h-10 object-cover rounded border" />
                        <button type="button" onClick={() => setNewItemImage('')} className="text-[10px] text-red-500 uppercase font-bold">Eliminar foto</button>
                      </div>
                    )}
                  </div>

                  {/* Availability Toggle in Form */}
                  <div className="flex items-center gap-2 p-2">
                    <input 
                        type="checkbox" 
                        id="form-available" 
                        checked={newItemAvailable} 
                        onChange={e => setNewItemAvailable(e.target.checked)}
                        className="w-4 h-4 accent-[#4a5d23]"
                    />
                    <label htmlFor="form-available" className="text-xs font-bold uppercase tracking-wider text-gray-700">En carta (Dispoñible)</label>
                  </div>

                  <div className="md:col-span-4 flex gap-2 pt-2">
                      <button type="submit" className={`flex-1 text-white p-2 rounded text-sm font-bold uppercase ${editMenuIndex !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
                          {editMenuIndex !== null ? 'Actualizar' : 'Engadir'}
                      </button>
                      {editMenuIndex !== null && <button type="button" onClick={resetMenuForm} className="px-4 bg-gray-200 text-gray-700 p-2 rounded text-sm font-bold uppercase hover:bg-gray-300">Cancelar</button>}
                  </div>
              </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                      <tr>
                          <th className="px-6 py-3">Estado</th>
                          <th className="px-6 py-3">Imaxe</th>
                          <th className="px-6 py-3">Nome / Detalle</th>
                          <th className="px-6 py-3">D.O. / Cat</th>
                          <th className="px-6 py-3">Prezo</th>
                          <th className="px-6 py-3 text-right">Acción</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {(menuType === 'food' ? foodMenu : wineMenu).map((item, idx) => (
                          <tr key={idx} className={`hover:bg-gray-50 transition-all ${!item.available ? 'bg-gray-50/80 opacity-60' : ''} ${editMenuIndex === idx ? 'bg-blue-50' : ''}`}>
                              <td className="px-6 py-3">
                                <button 
                                  onClick={() => handleToggleAvailability(idx)}
                                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${item.available ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${item.available ? 'left-6' : 'left-1'}`}></div>
                                </button>
                                <div className="text-[8px] uppercase font-bold mt-1 text-center w-10">
                                  {item.available ? 'ON' : 'OFF'}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                {item.image ? (
                                  <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-sm border" />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded-sm border border-dashed flex items-center justify-center text-[10px] text-gray-400">Sen foto</div>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <div className="font-bold text-black flex items-center gap-2">
                                  {item.name}
                                  {menuType === 'wine' && item.wineType && (
                                    <span className="text-[9px] uppercase font-black" style={{ color: getTypeColor(item.wineType) }}>
                                      {item.wineType}
                                    </span>
                                  )}
                                  {!item.available && (
                                    <span className="bg-red-100 text-red-600 text-[8px] px-1 rounded font-bold uppercase">Esgotado</span>
                                  )}
                                </div>
                                {menuType === 'wine' && (
                                  <div className="text-[10px] text-gray-500">
                                    {item.winery && <span className="uppercase">{item.winery}</span>}
                                    {item.winemaker && ` — ${item.winemaker}`}
                                  </div>
                                )}
                                <div className="text-gray-600 text-[11px] mt-0.5">{item.description}</div>
                              </td>
                              <td className="px-6 py-3 text-gray-600 font-medium">{item.category}</td>
                              <td className="px-6 py-3 text-black font-bold">{item.price.toFixed(2)}€</td>
                              <td className="px-6 py-3 text-right">
                                  <div className="flex justify-end gap-3">
                                    <button onClick={() => handleEditMenuItem(idx)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Editar</button>
                                    <button onClick={() => handleDeleteMenuItem(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Borrar</button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderEventManagement = () => (
      <div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 border-l-4" style={{ borderLeftColor: editEventId !== null ? '#3b82f6' : COLORS.mossGreen }}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{editEventId !== null ? 'Editando Evento' : 'Novo Evento'}</h3>
              <form onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <input type="text" placeholder="Título" required value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <input type="text" placeholder="Data (Ex: 15 OUT)" required value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <input type="text" placeholder="Hora (Ex: 21:00)" required value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <select value={newEventCat} onChange={e => setNewEventCat(e.target.value as any)} className="border p-2 rounded text-sm w-full text-black">
                      <option value="Exposición">Exposición</option>
                      <option value="Zona dos viños">Zona dos viños</option>
                      <option value="Cata">Cata</option>
                      <option value="[·] de encontro">[·] de encontro</option>
                      <option value="Concerto">Concerto</option>
                      <option value="Arte escénica">Arte escénica</option>
                      <option value="Humor">Humor</option>
                      <option value="Palabra dita e escrita">Palabra dita e escrita</option>
                  </select>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Cargar Imaxe</label>
                    <input type="file" accept="image/*" onChange={handleEventImageUpload} className="border p-1.5 rounded text-xs w-full text-black file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300" />
                    {newEventImage && <div className="mt-2 flex items-center gap-2"><img src={newEventImage} alt="Preview" className="w-10 h-10 object-cover rounded border" /><button type="button" onClick={() => setNewEventImage('')} className="text-[10px] text-red-500 uppercase font-bold">Quitar</button></div>}
                  </div>
                  <input type="text" placeholder="Descrición" required value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <div className="md:col-span-2 lg:col-span-3 flex gap-2 pt-4">
                    <button type="submit" className={`flex-1 text-white p-2 rounded text-sm font-bold uppercase ${editEventId !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}>{editEventId !== null ? 'Actualizar Evento' : 'Publicar Evento'}</button>
                    {editEventId !== null && <button type="button" onClick={resetEventForm} className="px-4 bg-gray-200 text-gray-700 p-2 rounded text-sm font-bold uppercase hover:bg-gray-300">Cancelar</button>}
                  </div>
              </form>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                      <tr><th className="px-6 py-3">Estado</th><th className="px-6 py-3">Miniatura</th><th className="px-6 py-3">Evento</th><th className="px-6 py-3">Data/Hora</th><th className="px-6 py-3">Tipo</th><th className="px-6 py-3 text-right">Acción</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {events.map((event) => (
                          <tr key={event.id} className={`hover:bg-gray-50 ${editEventId === event.id ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-3">
                              <button
                                onClick={() => handleTogglePublish(event.id, true)}
                                className="text-[10px] font-bold uppercase text-green-700 hover:text-green-900"
                              >
                                Publicar
                              </button>
                              <span className="text-gray-300 mx-2">|</span>
                              <button
                                onClick={() => handleTogglePublish(event.id, false)}
                                className="text-[10px] font-bold uppercase text-gray-500 hover:text-gray-800"
                              >
                                Ocultar
                              </button>
                            </td>
                            <td className="px-6 py-3"><img src={event.image} alt="" className="w-12 h-12 object-cover rounded-sm grayscale" /></td>
                            <td className="px-6 py-3 font-medium text-black">{event.title}</td>
                            <td className="px-6 py-3 text-gray-500">{event.date} - {event.time}</td>
                            <td className="px-6 py-3"><span className="bg-black text-white text-[10px] px-2 py-1 uppercase">{event.category}</span></td>
                            <td className="px-6 py-3 text-right"><div className="flex justify-end gap-3"><button onClick={() => handleEditEvent(event)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Editar</button><button onClick={() => handleDeleteEvent(event.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Borrar</button></div></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderProposalsManagement = () => (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Candidato / Contacto</th><th className="px-6 py-4">Proxecto / Disciplina</th><th className="px-6 py-4">Detalles</th><th className="px-6 py-4 text-right">Accións</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proposals.map((prop) => (
                <tr key={prop.id} className={`hover:bg-gray-50 ${prop.status === 'new' ? 'bg-blue-50/50' : ''}`}>
                   <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${prop.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>{prop.status === 'new' ? 'Novo' : 'Lido'}</span><div className="text-[10px] text-gray-400 mt-1">{prop.createdAt}</div></td>
                   <td className="px-6 py-4"><div className="font-bold text-black">{prop.name}</div><div className="text-gray-500 text-xs">{prop.email}</div><div className="text-gray-500 text-xs">{prop.phone}</div><div className="text-[#4a5d23] text-xs mt-1">{prop.socials}</div></td>
                   <td className="px-6 py-4"><div className="font-bold text-black">{prop.title}</div><div className="inline-block bg-gray-200 text-gray-700 text-[10px] px-1 rounded uppercase">{prop.discipline}</div>{prop.hasFile && <div className="text-xs text-blue-600 mt-1">📎 CV/Portfolio adxunto</div>}</td>
                   <td className="px-6 py-4 max-w-xs"><div className="text-xs text-gray-800 mb-1"><span className="font-bold">Desc:</span> {prop.description.substring(0, 80)}...</div><div className="text-xs text-gray-500 italic"><span className="font-bold not-italic">Bio:</span> {prop.bio.substring(0, 50)}...</div></td>
                   <td className="px-6 py-4 text-right space-x-2">{prop.status === 'new' && <button onClick={() => handleMarkProposalRead(prop.id)} className="text-[#4a5d23] hover:text-green-800 font-bold text-xs uppercase block ml-auto mb-2">Marcar Lido</button>}<button onClick={() => handleDeleteProposal(prop.id)} className="text-red-500 hover:text-red-700 text-xs underline">Eliminar</button></td>
                </tr>
              ))}
               {proposals.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">Non hai propostas recibidas aínda.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
  );

  const renderReservationsTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Data / Hora</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Pax</th>
              <th className="px-6 py-4">Observacións</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4 text-right">Accións</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((res) => (
              <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' : res.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{res.status === 'pending' ? 'Pendente' : res.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}</span></td>
                <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">{res.date} <span className="text-gray-400">|</span> {res.time}</td>
                <td className="px-6 py-4 text-gray-900 font-bold">{res.name}</td>
                <td className="px-6 py-4 text-gray-900">{res.guests}</td>
                <td className="px-6 py-4 text-gray-600 max-w-xs text-xs italic">{res.observations || '—'}</td>
                <td className="px-6 py-4 text-gray-500"><div className="flex flex-col"><span>{res.phone}</span><span className="text-xs">{res.email}</span></div></td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">{res.status === 'pending' && <><button onClick={() => onUpdateStatus(res.id, 'confirmed')} className="text-green-600 hover:text-green-800 font-bold text-xs uppercase">Aceptar</button><button onClick={() => onUpdateStatus(res.id, 'cancelled')} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase">Rexeitar</button></>}{res.status !== 'pending' && <button onClick={() => onUpdateStatus(res.id, res.status === 'confirmed' ? 'cancelled' : 'confirmed')} className="text-gray-400 hover:text-gray-600 text-xs underline">Cambiar Estado</button>}</td>
              </tr>
            ))}
            {reservations.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">Non hai reservas rexistradas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
       <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
            <tr><th className="px-6 py-4">Nome</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Teléfono</th><th className="px-6 py-4">Última Visita</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {uniqueCustomers.map((cust) => (
                <tr key={cust.email} className="hover:bg-gray-50"><td className="px-6 py-4 font-bold text-gray-900">{cust.name}</td><td className="px-6 py-4 text-gray-600">{cust.email}</td><td className="px-6 py-4 text-gray-600">{cust.phone}</td><td className="px-6 py-4 text-gray-400">{cust.date}</td></tr>
            ))}
          </tbody>
        </table>
       </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-md border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-tighter text-black">Acceso CMR</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#4a5d23] text-black"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Contrasinal</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#4a5d23] text-black" 
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <button type="submit" className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-[#4a5d23] transition-colors">Entrar</button>
            <button type="button" onClick={onExit} className="w-full text-gray-400 text-xs uppercase font-bold mt-4 hover:text-black">Volver á web</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold tracking-tight text-gray-900">CMR <span style={{color: COLORS.mossGreen}}>Taberna</span></h1><p className="text-gray-500">Panel de Xestión e Relación con Clientes</p></div>
          <button onClick={onExit} className="text-sm bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors uppercase tracking-widest">Saír á Web</button>
        </div>
        <div className="flex gap-6 border-b border-gray-300 mb-8 overflow-x-auto">
          {['dashboard', 'reservations', 'proposals', 'customers', 'menu', 'events'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 uppercase text-xs font-bold tracking-widest transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-[#4a5d23] text-[#4a5d23]' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab === 'dashboard' ? 'Panel Principal' : tab === 'reservations' ? 'Reservas' : tab === 'proposals' ? `Propostas (${newProposalsCount})` : tab === 'customers' ? 'Clientes' : tab === 'menu' ? 'Xestión Carta' : 'Xestión Eventos'}
            </button>
          ))}
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && renderDashboard()}
            {(activeTab === 'dashboard' || activeTab === 'reservations') && renderReservationsTable()}
            {activeTab === 'proposals' && renderProposalsManagement()}
            {activeTab === 'customers' && renderCustomers()}
            {activeTab === 'menu' && renderMenuManagement()}
            {activeTab === 'events' && renderEventManagement()}
        </div>
      </div>
    </div>
  );
};

export default CMRSection;
