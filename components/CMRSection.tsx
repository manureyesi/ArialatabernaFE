import React, { useEffect, useMemo, useState } from 'react';
import { Reservation, MenuItem, EventItem, ProjectProposal, EventCategory } from '../types';
import { COLORS } from '../constants';
import { backendApi, BasicAuth, BackendAdminMenuCategoryNode } from '../services/backendApi';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [auth, setAuth] = useState<BasicAuth | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reservations' | 'customers' | 'menu' | 'events' | 'proposals' | 'config'>('dashboard');

  const [projectContacts, setProjectContacts] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      company?: string | null;
      subject: string;
      message: string;
      consent?: boolean;
      source?: string | null;
      createdAt: string;
      read?: boolean;
      isRead?: boolean;
    }>
  >([]);
  const [isLoadingProjectContacts, setIsLoadingProjectContacts] = useState(false);
  const [selectedProjectContact, setSelectedProjectContact] = useState<null | {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    subject: string;
    message: string;
    consent?: boolean;
    source?: string | null;
    createdAt: string;
  }>(null);

  const [projectContactsStats, setProjectContactsStats] = useState<{ total: number; unread: number } | null>(null);
  const [readProjectContactIds, setReadProjectContactIds] = useState<Record<string, true>>({});

  const [adminConfigItems, setAdminConfigItems] = useState<Array<{ key: string; value: string }>>([]);
  const [adminConfigDraft, setAdminConfigDraft] = useState<Record<string, string>>({});
  const [isLoadingAdminConfig, setIsLoadingAdminConfig] = useState(false);
  const [savingConfigKey, setSavingConfigKey] = useState<string | null>(null);

  // --- MENU MANAGEMENT STATE ---
  const [menuType, setMenuType] = useState<'food' | 'wine'>('food');
  const [editMenuIndex, setEditMenuIndex] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemRegion, setNewItemRegion] = useState('');
  const [newItemWineType, setNewItemWineType] = useState('');
  const [newItemGrapes, setNewItemGrapes] = useState('');
  const [newItemGlassPrice, setNewItemGlassPrice] = useState('');
  const [newItemBottlePrice, setNewItemBottlePrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemAvailable, setNewItemAvailable] = useState(true);

  const [menuAvailableCategories, setMenuAvailableCategories] = useState<Array<string>>([]);
  const [isLoadingMenuAvailableCategories, setIsLoadingMenuAvailableCategories] = useState(false);

  const flattenMenuCategoryNodes = (nodes: Array<{ category: string; subcategory: string | null; orden: number; children: any[] }>): Array<string> => {
    const acc: Array<{ label: string; orden: number }> = [];

    const walk = (items: Array<{ category: string; subcategory: string | null; orden: number; children: any[] }>) => {
      items.forEach((n) => {
        const label = (n.subcategory ?? n.category ?? '').trim();
        if (label) {
          if (n.subcategory !== null || (!Array.isArray(n.children) || n.children.length === 0)) {
            acc.push({ label, orden: Number(n.orden ?? 0) });
          }
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

  const [menuCategories, setMenuCategories] = useState<Array<BackendAdminMenuCategoryNode>>([]);
  const [isLoadingMenuCategories, setIsLoadingMenuCategories] = useState(false);
  const [newMenuCategory, setNewMenuCategory] = useState('');
  const [newMenuSubcategory, setNewMenuSubcategory] = useState('');
  const [newMenuOrden, setNewMenuOrden] = useState('1');
  
  // --- EVENT MANAGEMENT STATE ---
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDateStart, setNewEventDateStart] = useState('');
  const [newEventDateEnd, setNewEventDateEnd] = useState('');
  const [newEventTimezone, setNewEventTimezone] = useState('Europe/Madrid');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventImage, setNewEventImage] = useState('');
  const [newEventLocationName, setNewEventLocationName] = useState('');
  const [newEventIsPublished, setNewEventIsPublished] = useState(true);
  const [newEventCat, setNewEventCat] = useState<EventCategory>('Concerto');

  // Stats
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.date === today && r.status === 'confirmed').length;
  const newProposalsCount = proposals.filter(p => p.status === 'new').length;

  type CustomerRow = {
    name: string;
    email: string;
    phone: string;
    date: string;
    createdAt: string;
  };

  const uniqueCustomers = useMemo<Array<CustomerRow>>(() => {
    const byEmail = new Map<string, CustomerRow>();

    reservations.forEach((r) => {
      const key = String(r.email || '').trim().toLowerCase();
      if (!key) return;

      const next: CustomerRow = {
        name: r.name,
        email: r.email,
        phone: r.phone,
        date: `${r.date} ${r.time}`,
        createdAt: r.createdAt,
      };

      const prev = byEmail.get(key);
      if (!prev) {
        byEmail.set(key, next);
        return;
      }

      const prevTs = new Date(prev.createdAt).getTime();
      const nextTs = new Date(next.createdAt).getTime();
      if (Number.isFinite(nextTs) && (!Number.isFinite(prevTs) || nextTs > prevTs)) {
        byEmail.set(key, next);
      }
    });

    return Array.from(byEmail.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reservations]);

  const projectContactsNewCount = useMemo(() => projectContacts.length, [projectContacts]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice('');
    setNewItemCategory('');
    setNewItemRegion('');
    setNewItemGlassPrice('');
    setNewItemBottlePrice('');
    setNewItemImage('');
    setNewItemAvailable(true);
    setEditMenuIndex(null);

    setNewEventTitle('');
    setNewEventDateStart('');
    setNewEventDateEnd('');
    setNewEventTimezone('Europe/Madrid');
    setNewEventDesc('');
    setNewEventImage('');
    setNewEventLocationName('');
    setNewEventIsPublished(true);
    setEditEventId(null);

    if (!auth) return;

    if (activeTab === 'dashboard') {
      backendApi.admin
        .getProjectContactsStats(auth)
        .then((res) => {
          setProjectContactsStats({
            total: Number(res?.total ?? 0),
            unread: Number(res?.unread ?? 0),
          });
        })
        .catch(() => {
          setProjectContactsStats(null);
        });
    }

    if (activeTab === 'menu') {
      backendApi
        .getMenu()
        .then((menu) => {
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
          // ignore
        });

      setIsLoadingMenuCategories(true);
      backendApi.admin
        .listMenuCategories(auth)
        .then((items) => {
          setMenuCategories(items || []);
        })
        .catch(() => {
          setMenuCategories([]);
        })
        .finally(() => {
          setIsLoadingMenuCategories(false);
        });
    }

    if (activeTab === 'events') {
      backendApi.admin
        .listEvents(auth)
        .then((items) => {
          setEvents(
            items
              .filter((it) => !!it.title)
              .map((it) => {
                const dt = it.dateStart ? new Date(it.dateStart) : null;
                const date = dt ? dt.toLocaleDateString('gl-ES', { day: '2-digit', month: 'short' }).toUpperCase() : '';
                const time = dt ? dt.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' }) : '';
                return {
                  id: it.id,
                  title: it.title,
                  date,
                  time,
                  description: it.description,
                  image: it.imageUrl || 'https://picsum.photos/800/600?grayscale',
                  category: (it.category as any) as EventItem['category'],
                  dateStart: it.dateStart,
                  dateEnd: it.dateEnd ?? null,
                  timezone: it.timezone,
                  locationName: it.locationName ?? null,
                  isPublished: it.isPublished,
                  imageUrl: it.imageUrl,
                };
              })
          );
        })
        .catch(() => {
          // ignore
        });
    }

    if (activeTab === 'proposals') {
      setIsLoadingProjectContacts(true);
      backendApi.admin
        .listProjectContacts(auth, 100, 0)
        .then((res) => {
          setProjectContacts(Array.isArray(res.items) ? res.items : []);
        })
        .catch(() => {
          setProjectContacts([]);
        })
        .finally(() => {
          setIsLoadingProjectContacts(false);
        });
    }

    if (activeTab === 'config') {
      setIsLoadingAdminConfig(true);
      backendApi.admin
        .listConfig(auth)
        .then((items) => {
          const next = Array.isArray(items) ? items : [];
          setAdminConfigItems(next);
          setAdminConfigDraft(next.reduce((acc, it) => ({ ...acc, [it.key]: it.value }), {} as Record<string, string>));
        })
        .catch(() => {
          setAdminConfigItems([]);
          setAdminConfigDraft({});
        })
        .finally(() => {
          setIsLoadingAdminConfig(false);
        });
    }
  }, [activeTab, auth]);

  useEffect(() => {
    if (activeTab !== 'menu') return;
    setIsLoadingMenuAvailableCategories(true);
    backendApi
      .getMenuCategories(menuType === 'wine' ? 'adega' : 'cocina')
      .then((items) => {
        const next = Array.isArray(items) ? flattenMenuCategoryNodes(items as any) : [];
        setMenuAvailableCategories(next);
      })
      .catch(() => {
        setMenuAvailableCategories([]);
      })
      .finally(() => {
        setIsLoadingMenuAvailableCategories(false);
      });
  }, [activeTab, menuType]);

  const handleCreateMenuCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    const payload = {
      category: newMenuCategory.trim(),
      subcategory: newMenuSubcategory.trim() ? newMenuSubcategory.trim() : null,
      orden: Number(newMenuOrden || 1),
    };

    try {
      await backendApi.admin.createMenuCategory(auth, payload);
      const items = await backendApi.admin.listMenuCategories(auth);
      setMenuCategories(items || []);
      setNewMenuCategory('');
      setNewMenuSubcategory('');
      setNewMenuOrden('1');
    } catch {
      // ignore
    }
  };

  const handleDeleteMenuCategoryNode = async (id?: number | string) => {
    if (!auth) return;
    if (!id) return;
    try {
      await backendApi.admin.deleteMenuCategory(auth, id);
      setIsLoadingMenuCategories(true);
      const items = await backendApi.admin.listMenuCategories(auth);
      setMenuCategories(items || []);
    } catch {
      // ignore
    } finally {
      setIsLoadingMenuCategories(false);
    }
  };

  const getMenuCategoryNodeId = (node: unknown): number | string | undefined => {
    if (!node || typeof node !== 'object') return undefined;
    const anyNode = node as any;
    const raw = anyNode.id ?? anyNode.categoryId ?? anyNode.menuCategoryId ?? anyNode.category_id ?? anyNode.menu_category_id;
    if (raw === null || raw === undefined) return undefined;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    return undefined;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextAuth = { username, password };
    try {
      await backendApi.admin.listConfig(nextAuth);
      try {
        const items = await backendApi.admin.listEvents(nextAuth);
        setEvents(
          items
            .filter((it) => !!it.title)
            .map((it) => {
              const dt = it.dateStart ? new Date(it.dateStart) : null;
              const date = dt ? dt.toLocaleDateString('gl-ES', { day: '2-digit', month: 'short' }).toUpperCase() : '';
              const time = dt ? dt.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' }) : '';
              return {
                id: it.id,
                title: it.title,
                date,
                time,
                description: it.description,
                image: it.imageUrl || 'https://picsum.photos/800/600?grayscale',
                category: (it.category as any) as EventItem['category'],
                dateStart: it.dateStart,
                dateEnd: it.dateEnd ?? null,
                timezone: it.timezone,
                locationName: it.locationName ?? null,
                isPublished: it.isPublished,
                imageUrl: it.imageUrl,
              };
            })
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

      const editList = menuType === 'food' ? foodMenu : wineMenu;
      const editItem = editMenuIndex !== null ? editList[editMenuIndex] : null;

      const basePrice =
        menuType === 'wine'
          ? Number(newItemBottlePrice || newItemGlassPrice || 0)
          : parseFloat(newItemPrice);

      const newItem: MenuItem = {
          name: newItemName,
          description: newItemDesc,
          price: basePrice,
          category: newItemCategory,
          tags: [],
          available: newItemAvailable,
          image: newItemImage || undefined,
          region: menuType === 'wine' ? (newItemRegion.trim() ? newItemRegion.trim() : null) : undefined,
          wineType: menuType === 'wine' ? ((newItemWineType.trim() ? newItemWineType.trim() : undefined) as any) : undefined,
          grapes: menuType === 'wine' ? (newItemGrapes.trim() ? newItemGrapes.trim() : undefined) : undefined,
          glassPrice: menuType === 'wine' ? (newItemGlassPrice.trim() ? Number(newItemGlassPrice) : null) : undefined,
          bottlePrice: menuType === 'wine' ? (newItemBottlePrice.trim() ? Number(newItemBottlePrice) : null) : undefined,
      };

      try {
        if (editItem?.id) {
          if (menuType === 'food') {
            await backendApi.admin.updateMenuItem(auth, editItem.id, {
              name: newItem.name,
              description: newItem.description,
              category: newItem.category,
              price: newItem.price,
              imageUrl: newItemImage || null,
              isActive: newItemAvailable,
            });
          } else {
            await backendApi.admin.updateMenuItem(auth, editItem.id, {
              name: newItem.name,
              description: newItem.description,
              category: newItem.category,
              region: newItem.region ?? null,
              wineType: (newItem as any).wineType ?? null,
              grapes: (newItem as any).grapes ?? null,
              glassPrice: newItem.glassPrice ?? null,
              bottlePrice: newItem.bottlePrice ?? null,
              imageUrl: newItemImage || null,
              isActive: newItemAvailable,
            });
          }
        } else {
          if (menuType === 'food') {
            await backendApi.admin.createFood(auth, {
              name: newItem.name,
              description: newItem.description,
              category: newItem.category,
              price: newItem.price,
              imageUrl: newItemImage || undefined,
              isActive: newItemAvailable,
            });
          } else {
            await backendApi.admin.createWine(auth, {
              name: newItem.name,
              description: newItem.description,
              category: newItem.category,
              region: newItem.region ?? null,
              wineType: (newItem as any).wineType ?? null,
              grapes: (newItem as any).grapes ?? null,
              glassPrice: newItem.glassPrice ?? null,
              bottlePrice: newItem.bottlePrice ?? null,
              imageUrl: newItemImage || undefined,
              isActive: newItemAvailable,
            });
          }
        }

        const menu = await backendApi.getMenu();
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
      if (menuType === 'wine') {
        setNewItemPrice(String(item.bottlePrice ?? item.glassPrice ?? item.price));
      } else {
        setNewItemPrice(item.price.toString());
      }
      setNewItemCategory(item.category);
      setNewItemImage(item.image || '');
      setNewItemAvailable(item.available);
      setNewItemRegion(String(item.region ?? ''));
      setNewItemWineType(String((item as any).wineType ?? ''));
      setNewItemGrapes(String((item as any).grapes ?? ''));
      setNewItemGlassPrice(item.glassPrice === null || item.glassPrice === undefined ? '' : String(item.glassPrice));
      setNewItemBottlePrice(item.bottlePrice === null || item.bottlePrice === undefined ? '' : String(item.bottlePrice));
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

  const handleDeleteMenuItemFromBackend = async (index: number) => {
    if (!auth) return;
    const list = menuType === 'food' ? foodMenu : wineMenu;
    const item = list[index];
    if (!item) return;

    if (!item.id) {
      handleDeleteMenuItem(index);
      return;
    }

    try {
      await backendApi.admin.deleteMenuItem(auth, item.id);
      const menu = await backendApi.getMenu();
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
      if (editMenuIndex === index) resetMenuForm();
    } catch {
      // ignore
    }
  };

  const resetMenuForm = () => {
      setNewItemName(''); setNewItemDesc(''); setNewItemPrice(''); setNewItemCategory('');
      setNewItemRegion(''); setNewItemWineType(''); setNewItemGrapes(''); setNewItemGlassPrice(''); setNewItemBottlePrice('');
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

    const toIso = (dtLocal: string): string => {
      const d = new Date(dtLocal);
      return d.toISOString();
    };

    const payload = {
      title: newEventTitle,
      dateStart: toIso(newEventDateStart),
      dateEnd: newEventDateEnd ? toIso(newEventDateEnd) : null,
      timezone: newEventTimezone,
      description: newEventDesc,
      category: newEventCat,
      imageUrl: newEventImage || '',
      locationName: newEventLocationName || null,
      isPublished: newEventIsPublished,
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
          .filter((it) => !!it.title)
          .map((it) => {
            const dt = it.dateStart ? new Date(it.dateStart) : null;
            const date = dt ? dt.toLocaleDateString('gl-ES', { day: '2-digit', month: 'short' }).toUpperCase() : '';
            const time = dt ? dt.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' }) : '';
            return {
              id: it.id,
              title: it.title,
              date,
              time,
              description: it.description,
              image: it.imageUrl || 'https://picsum.photos/800/600?grayscale',
              category: (it.category as any) as EventItem['category'],
              dateStart: it.dateStart,
              dateEnd: it.dateEnd ?? null,
              timezone: it.timezone,
              locationName: it.locationName ?? null,
              isPublished: it.isPublished,
              imageUrl: it.imageUrl,
            };
          })
      );
      resetEventForm();
    } catch {
      // keep form state
    }
  };

  const handleEditEvent = (event: EventItem) => {
      setNewEventTitle(event.title);
      setNewEventDesc(event.description);
      setNewEventCat(event.category);
      setNewEventImage(event.imageUrl || event.image);
      setNewEventDateStart(event.dateStart ? event.dateStart.slice(0, 16) : '');
      setNewEventDateEnd(event.dateEnd ? event.dateEnd.slice(0, 16) : '');
      setNewEventTimezone(event.timezone || 'Europe/Madrid');
      setNewEventLocationName(event.locationName || '');
      setNewEventIsPublished(event.isPublished ?? true);
      setEditEventId(event.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!auth) return;
    try {
      await backendApi.admin.deleteEvent(auth, id);
      const items = await backendApi.admin.listEvents(auth);
      setEvents(
        items
          .filter((it) => !!it.title)
          .map((it) => {
            const dt = it.dateStart ? new Date(it.dateStart) : null;
            const date = dt ? dt.toLocaleDateString('gl-ES', { day: '2-digit', month: 'short' }).toUpperCase() : '';
            const time = dt ? dt.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' }) : '';
            return {
              id: it.id,
              title: it.title,
              date,
              time,
              description: it.description,
              image: it.imageUrl || 'https://picsum.photos/800/600?grayscale',
              category: (it.category as any) as EventItem['category'],
              dateStart: it.dateStart,
              dateEnd: it.dateEnd ?? null,
              timezone: it.timezone,
              locationName: it.locationName ?? null,
              isPublished: it.isPublished,
              imageUrl: it.imageUrl,
            };
          })
      );
      if (editEventId === id) resetEventForm();
    } catch {
      // ignore
    }
  };

  const handleTogglePublish = async (eventId: string, nextPublished: boolean) => {
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
          .filter((it) => !!it.title)
          .map((it) => {
            const dt = it.dateStart ? new Date(it.dateStart) : null;
            const date = dt ? dt.toLocaleDateString('gl-ES', { day: '2-digit', month: 'short' }).toUpperCase() : '';
            const time = dt ? dt.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' }) : '';
            return {
              id: it.id,
              title: it.title,
              date,
              time,
              description: it.description,
              image: it.imageUrl || 'https://picsum.photos/800/600?grayscale',
              category: (it.category as any) as EventItem['category'],
              dateStart: it.dateStart,
              dateEnd: it.dateEnd ?? null,
              timezone: it.timezone,
              locationName: it.locationName ?? null,
              isPublished: it.isPublished,
              imageUrl: it.imageUrl,
            };
          })
      );
    } catch {
      // ignore
    }
  };

  const resetEventForm = () => {
      setNewEventTitle('');
      setNewEventDateStart('');
      setNewEventDateEnd('');
      setNewEventTimezone('Europe/Madrid');
      setNewEventDesc('');
      setNewEventImage('');
      setNewEventLocationName('');
      setNewEventIsPublished(true);
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
        <div className="text-3xl font-bold text-blue-600">{projectContactsStats?.unread ?? newProposalsCount}</div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Propostas Totais</div>
        <div className="text-3xl font-bold text-green-600">{projectContactsStats?.total ?? confirmedCount}</div>
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
                  
                  <select
                    required
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="border p-2 rounded text-sm w-full text-black"
                    disabled={isLoadingMenuAvailableCategories}
                  >
                    <option value="">
                      {isLoadingMenuAvailableCategories
                        ? 'Cargando categorías...'
                        : menuType === 'wine'
                          ? 'Selecciona categoría'
                          : 'Selecciona categoría'}
                    </option>
                    {newItemCategory && !menuAvailableCategories.includes(newItemCategory) ? (
                      <option value={newItemCategory}>{newItemCategory}</option>
                    ) : null}
                    {menuAvailableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {menuType === 'wine' ? (
                    <select
                      value={newItemWineType}
                      onChange={(e) => setNewItemWineType(e.target.value)}
                      className="border p-2 rounded text-sm w-full text-black"
                    >
                      <option value="">Tipo (opcional)</option>
                      <option value="Blanco">Blanco</option>
                      <option value="Tinto">Tinto</option>
                      <option value="Doce">Doce</option>
                      <option value="Espumoso">Espumoso</option>
                    </select>
                  ) : null}

                  {menuType === 'wine' ? (
                    <input
                      type="text"
                      placeholder="Uvas (opcional)"
                      value={newItemGrapes}
                      onChange={(e) => setNewItemGrapes(e.target.value)}
                      className="border p-2 rounded text-sm w-full text-black placeholder-gray-400"
                    />
                  ) : null}

                  {menuType === 'wine' ? (
                    <input
                      type="text"
                      placeholder="Rexión (opcional)"
                      value={newItemRegion}
                      onChange={(e) => setNewItemRegion(e.target.value)}
                      className="border p-2 rounded text-sm w-full text-black placeholder-gray-400"
                    />
                  ) : null}

                  <input type="text" placeholder="Descrición / Notas" required value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  {menuType === 'wine' ? (
                    <>
                      <input
                        type="number"
                        placeholder="Prezo Copa (€)"
                        step="0.1"
                        value={newItemGlassPrice}
                        onChange={e => setNewItemGlassPrice(e.target.value)}
                        className="border p-2 rounded text-sm w-full text-black placeholder-gray-400"
                      />
                      <input
                        type="number"
                        placeholder="Prezo Botella (€)"
                        step="0.1"
                        value={newItemBottlePrice}
                        onChange={e => setNewItemBottlePrice(e.target.value)}
                        className="border p-2 rounded text-sm w-full text-black placeholder-gray-400"
                      />
                    </>
                  ) : (
                    <input type="number" placeholder="Prezo (€)" step="0.1" required value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  )}
                  
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
                                  {!item.available && (
                                    <span className="bg-red-100 text-red-600 text-[8px] px-1 rounded font-bold uppercase">Esgotado</span>
                                  )}
                                </div>
                                <div className="text-gray-600 text-[11px] mt-0.5">{item.description}</div>
                              </td>
                              <td className="px-6 py-3 text-gray-600 font-medium">{item.category}</td>
                              <td className="px-6 py-3 text-black font-bold">
                                {menuType === 'wine' ? (
                                  <div className="flex flex-col items-end">
                                    {item.glassPrice !== null && item.glassPrice !== undefined && (
                                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                        Copa {Number(item.glassPrice).toFixed(2)}€
                                      </div>
                                    )}
                                    {item.bottlePrice !== null && item.bottlePrice !== undefined && (
                                      <div>{Number(item.bottlePrice).toFixed(2)}€</div>
                                    )}
                                    {(item.glassPrice === null || item.glassPrice === undefined) &&
                                      (item.bottlePrice === null || item.bottlePrice === undefined) && (
                                        <div>{item.price.toFixed(2)}€</div>
                                      )}
                                  </div>
                                ) : (
                                  <>{item.price.toFixed(2)}€</>
                                )}
                              </td>
                              <td className="px-6 py-3 text-right">
                                  <div className="flex justify-end gap-3">
                                    <button onClick={() => handleEditMenuItem(idx)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Editar</button>
                                    <button onClick={() => handleDeleteMenuItemFromBackend(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Borrar</button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Categorías do menú</h3>

            <form onSubmit={handleCreateMenuCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8">
              <input
                type="text"
                placeholder="Categoría (Ex: vino / comida)"
                required
                value={newMenuCategory}
                onChange={(e) => setNewMenuCategory(e.target.value)}
                className="border p-2 rounded text-sm w-full text-black placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Subcategoría (opcional)"
                value={newMenuSubcategory}
                onChange={(e) => setNewMenuSubcategory(e.target.value)}
                className="border p-2 rounded text-sm w-full text-black placeholder-gray-400"
              />
              <input
                type="number"
                placeholder="Orden"
                required
                value={newMenuOrden}
                onChange={(e) => setNewMenuOrden(e.target.value)}
                className="border p-2 rounded text-sm w-full text-black placeholder-gray-400"
              />
              <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white p-2 rounded text-sm font-bold uppercase">
                Gardar
              </button>
            </form>

            {isLoadingMenuCategories ? (
              <div className="text-sm text-gray-400 italic">Cargando categorías...</div>
            ) : menuCategories.length === 0 ? (
              <div className="text-sm text-gray-400 italic">Non hai categorías.</div>
            ) : (
              <div className="space-y-3">
                {menuCategories
                  .slice()
                  .sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0))
                  .map((cat) => (
                    <div key={`${cat.category}-${cat.subcategory ?? 'root'}`} className="border border-gray-100 rounded p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-black uppercase tracking-wider">{cat.category}</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Orden: {cat.orden}</div>
                      </div>

                      {cat.children && cat.children.length > 0 && (
                        <div className="mt-3 pl-4 border-l border-gray-200 space-y-2">
                          {cat.children
                            .slice()
                            .sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0))
                            .map((sub) => (
                              <div key={`${sub.category}-${sub.subcategory ?? 'root'}`} className="flex items-center justify-between gap-3">
                                <div className="text-sm text-gray-800">{sub.subcategory}</div>
                                <div className="flex items-center gap-3">
                                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Orden: {sub.orden}</div>
                                  {(() => {
                                    const subId = getMenuCategoryNodeId(sub);
                                    return (
                                  <button
                                    type="button"
                                    disabled={!subId}
                                    onClick={() => handleDeleteMenuCategoryNode(subId as any)}
                                    className={`text-[10px] font-bold uppercase ${subId ? 'text-red-500 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'}`}
                                  >
                                    Borrar
                                  </button>
                                    );
                                  })()}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
      </div>
  );

  const renderEventManagement = () => (
      <div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 border-l-4" style={{ borderLeftColor: editEventId !== null ? '#3b82f6' : COLORS.mossGreen }}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{editEventId !== null ? 'Editando Evento' : 'Novo Evento'}</h3>
              <form onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <input type="text" placeholder="Título" required value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <input type="datetime-local" required value={newEventDateStart} onChange={e => setNewEventDateStart(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <input type="datetime-local" value={newEventDateEnd} onChange={e => setNewEventDateEnd(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
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
                  <input type="text" placeholder="Localización (opcional)" value={newEventLocationName} onChange={e => setNewEventLocationName(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <input type="text" placeholder="Timezone" value={newEventTimezone} onChange={e => setNewEventTimezone(e.target.value)} className="border p-2 rounded text-sm w-full text-black placeholder-gray-400" />
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Cargar Imaxe</label>
                    <input type="file" accept="image/*" onChange={handleEventImageUpload} className="border p-1.5 rounded text-xs w-full text-black file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300" />
                    {newEventImage && <div className="mt-2 flex items-center gap-2"><img src={newEventImage} alt="Preview" className="w-10 h-10 object-cover rounded border" /><button type="button" onClick={() => setNewEventImage('')} className="text-[10px] text-red-500 uppercase font-bold">Quitar</button></div>}
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <input
                        type="checkbox"
                        id="form-published"
                        checked={newEventIsPublished}
                        onChange={e => setNewEventIsPublished(e.target.checked)}
                        className="w-4 h-4 accent-[#4a5d23]"
                    />
                    <label htmlFor="form-published" className="text-xs font-bold uppercase tracking-wider text-gray-700">Publicado</label>
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
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Nome / Contacto</th>
                <th className="px-6 py-4">Asunto</th>
                <th className="px-6 py-4">Mensaxe</th>
                <th className="px-6 py-4">Fonte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projectContacts
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((lead) => (
                  (() => {
                    const backendIsRead = Boolean((lead as any).isRead ?? (lead as any).read ?? false);
                    const isUnread = !backendIsRead && !readProjectContactIds[lead.id];
                    return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-gray-50 cursor-pointer ${isUnread ? 'bg-blue-50/30' : ''}`}
                    onClick={async () => {
                      setSelectedProjectContact(lead);
                      if (!auth) return;
                      if (readProjectContactIds[lead.id]) return;
                      try {
                        await backendApi.admin.markProjectContactRead(auth, lead.id);
                        setReadProjectContactIds((prev) => ({ ...prev, [lead.id]: true }));
                        setProjectContacts((prev) => prev.map((x) => (x.id === lead.id ? { ...x, read: true, isRead: true } : x)));
                        const stats = await backendApi.admin.getProjectContactsStats(auth);
                        setProjectContactsStats({
                          total: Number(stats?.total ?? 0),
                          unread: Number(stats?.unread ?? 0),
                        });
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{lead.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className={`${isUnread ? 'font-black' : 'font-bold'} text-black flex items-center gap-3`}>
                        <span>{lead.name}</span>
                        {isUnread && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white px-2 py-1 rounded-full">
                            Non lida
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs">{lead.email}</div>
                      {lead.phone && <div className="text-gray-500 text-xs">{lead.phone}</div>}
                      {lead.company && <div className="text-gray-400 text-xs italic">{lead.company}</div>}
                    </td>
                    <td className={`px-6 py-4 text-black ${isUnread ? 'font-black' : 'font-medium'}`}>{lead.subject}</td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-4">{lead.message}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs uppercase tracking-widest">{lead.source || '—'}</td>
                  </tr>
                    );
                  })()
                ))}

              {isLoadingProjectContacts && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                    Cargando propostas...
                  </td>
                </tr>
              )}

              {!isLoadingProjectContacts && projectContacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                    Non hai propostas recibidas aínda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedProjectContact && (
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
            onClick={() => setSelectedProjectContact(null)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
            <div
              className="relative bg-white max-w-5xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProjectContact(null)}
                className="absolute top-4 right-4 z-10 bg-black text-white p-2 hover:bg-[#4a5d23] transition-colors rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8 md:p-12 text-black">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <div className="text-[#4a5d23] font-bold text-xs uppercase tracking-[0.3em] mb-2">Proposta</div>
                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-tight">{selectedProjectContact.subject}</h3>
                    <div className="text-gray-400 text-xs uppercase tracking-widest mt-3">{selectedProjectContact.createdAt}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-gray-400">Fonte</div>
                    <div className="text-sm font-bold text-black uppercase tracking-widest">{selectedProjectContact.source || '—'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Contacto</div>
                    <div className="space-y-2">
                      <div className="font-bold text-black">{selectedProjectContact.name}</div>
                      <div className="text-sm text-gray-600 break-words">{selectedProjectContact.email}</div>
                      {selectedProjectContact.phone && <div className="text-sm text-gray-600">{selectedProjectContact.phone}</div>}
                      {selectedProjectContact.company && <div className="text-sm text-gray-500 italic">{selectedProjectContact.company}</div>}
                      {selectedProjectContact.consent !== undefined && (
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold pt-3">
                          Consentimento: {selectedProjectContact.consent ? 'Si' : 'Non'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Mensaxe</div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 border border-gray-100 p-6 rounded-sm max-h-[60vh] overflow-auto">
                      {((selectedProjectContact as any).proposalDescription || (selectedProjectContact as any).proposalBio || (selectedProjectContact as any).proposalSocials) ? (
                        <div className="space-y-6">
                          {(selectedProjectContact as any).proposalTitle && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Título</div>
                              <div className="text-sm text-gray-900 font-bold">{(selectedProjectContact as any).proposalTitle}</div>
                            </div>
                          )}
                          {(selectedProjectContact as any).proposalDiscipline && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Disciplina</div>
                              <div className="text-sm text-gray-800">{(selectedProjectContact as any).proposalDiscipline}</div>
                            </div>
                          )}
                          {(selectedProjectContact as any).proposalDescription && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Descrición</div>
                              <div className="text-sm text-gray-800 whitespace-pre-wrap">{(selectedProjectContact as any).proposalDescription}</div>
                            </div>
                          )}
                          {(selectedProjectContact as any).proposalBio && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Bio</div>
                              <div className="text-sm text-gray-800 whitespace-pre-wrap">{(selectedProjectContact as any).proposalBio}</div>
                            </div>
                          )}
                          {(selectedProjectContact as any).proposalSocials && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Redes / Links</div>
                              <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">{(selectedProjectContact as any).proposalSocials}</div>
                            </div>
                          )}
                          {(selectedProjectContact as any).proposalHasFile !== undefined && (selectedProjectContact as any).proposalHasFile !== null && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Portfolio (PDF)</div>
                              <div className="text-sm text-gray-800 font-bold">
                                {(selectedProjectContact as any).proposalHasFile ? 'Si' : 'Non'}
                              </div>
                            </div>
                          )}

                          {(selectedProjectContact as any).proposalFileBase64 && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Arquivo (base64)</div>
                              <a
                                href={(selectedProjectContact as any).proposalFileBase64}
                                download={`proposta_${selectedProjectContact.id}.pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block text-xs font-bold uppercase tracking-widest bg-black text-white px-4 py-2 hover:bg-[#4a5d23] transition-colors"
                              >
                                Descargar PDF
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        selectedProjectContact.message
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
            {uniqueCustomers.map((cust: CustomerRow) => (
                <tr key={cust.email} className="hover:bg-gray-50"><td className="px-6 py-4 font-bold text-gray-900">{cust.name}</td><td className="px-6 py-4 text-gray-600">{cust.email}</td><td className="px-6 py-4 text-gray-600">{cust.phone}</td><td className="px-6 py-4 text-gray-400">{cust.date}</td></tr>
            ))}
          </tbody>
        </table>
       </div>
    </div>
  );

  const renderConfigManagement = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">Configuración</div>
          <div className="text-sm text-gray-600">Valores do sistema (ex: reserva-activa)</div>
        </div>
        <button
          onClick={() => {
            if (!auth) return;
            setIsLoadingAdminConfig(true);
            backendApi.admin
              .listConfig(auth)
              .then((items) => {
                const next = Array.isArray(items) ? items : [];
                setAdminConfigItems(next);
                setAdminConfigDraft(next.reduce((acc, it) => ({ ...acc, [it.key]: it.value }), {} as Record<string, string>));
              })
              .catch(() => {
                setAdminConfigItems([]);
                setAdminConfigDraft({});
              })
              .finally(() => {
                setIsLoadingAdminConfig(false);
              });
          }}
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black"
        >
          Recargar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Key</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {adminConfigItems.map((it) => (
              <tr key={it.key} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-700">{it.key}</td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={adminConfigDraft[it.key] ?? ''}
                    onChange={(e) => setAdminConfigDraft((prev) => ({ ...prev, [it.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded p-2 text-sm text-black"
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={async () => {
                      if (!auth) return;
                      const nextValue = adminConfigDraft[it.key] ?? '';
                      try {
                        setSavingConfigKey(it.key);
                        await backendApi.admin.setConfig(auth, it.key, nextValue);
                        const items = await backendApi.admin.listConfig(auth);
                        const next = Array.isArray(items) ? items : [];
                        setAdminConfigItems(next);
                        setAdminConfigDraft(next.reduce((acc, x) => ({ ...acc, [x.key]: x.value }), {} as Record<string, string>));
                      } catch {
                        // ignore
                      } finally {
                        setSavingConfigKey(null);
                      }
                    }}
                    className="text-xs font-bold uppercase tracking-widest text-[#4a5d23] hover:text-green-800 disabled:opacity-30"
                    disabled={savingConfigKey === it.key}
                  >
                    Gardar
                  </button>
                </td>
              </tr>
            ))}

            {isLoadingAdminConfig && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                  Cargando configuración...
                </td>
              </tr>
            )}

            {!isLoadingAdminConfig && adminConfigItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                  Non hai configuración dispoñible.
                </td>
              </tr>
            )}
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
          {['dashboard', 'reservations', 'proposals', 'customers', 'menu', 'events', 'config'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 uppercase text-xs font-bold tracking-widest transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-[#4a5d23] text-[#4a5d23]' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab === 'dashboard' ? 'Panel Principal' : tab === 'reservations' ? 'Reservas' : tab === 'proposals' ? `Propostas (${projectContactsNewCount || newProposalsCount})` : tab === 'customers' ? 'Clientes' : tab === 'menu' ? 'Xestión Carta' : tab === 'events' ? 'Xestión Eventos' : 'Config'}
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
            {activeTab === 'config' && renderConfigManagement()}
        </div>
      </div>
    </div>
  );
};

export default CMRSection;
