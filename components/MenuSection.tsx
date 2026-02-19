import React, { useState, useMemo } from 'react';
import { MenuItem } from '../types';
import { COLORS, WINE_DO_ORDER } from '../constants';

interface MenuSectionProps {
  foodItems: MenuItem[];
  wineItems: MenuItem[];
  foodCategoryOrder?: Array<string>;
  wineCategoryOrder?: Array<string>;
}

const MenuSection: React.FC<MenuSectionProps> = ({ foodItems, wineItems, foodCategoryOrder = [], wineCategoryOrder = [] }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [wineFilter, setWineFilter] = useState<string>('Todos');

  // Grouping logic helper (only for available items)
  const groupBy = (items: MenuItem[]) => {
    return items
      .filter(item => item.available) // CRITICAL: Only show available items to customer
      .reduce((groups: { [key: string]: MenuItem[] }, item) => {
        const category = item.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      }, {});
  };

  const foodGroups = groupBy(foodItems);
  const orderedFoodCategories = useMemo(() => {
    const categories = Object.keys(foodGroups);
    const normalized = categories
      .map((c) => (c && c.trim() ? c : 'Outros'))
      .filter((c, idx, arr) => arr.indexOf(c) === idx);
    const orderIndex = new Map<string, number>();
    foodCategoryOrder.forEach((c, idx) => orderIndex.set(c, idx));

    const hasBackendOrder = foodCategoryOrder.length > 0;
    return normalized.sort((a, b) => {
      if (a === 'Outros' && b !== 'Outros') return 1;
      if (b === 'Outros' && a !== 'Outros') return -1;
      if (hasBackendOrder) {
        const ia = orderIndex.has(a) ? (orderIndex.get(a) as number) : Number.POSITIVE_INFINITY;
        const ib = orderIndex.has(b) ? (orderIndex.get(b) as number) : Number.POSITIVE_INFINITY;
        if (ia !== ib) return ia - ib;
      }
      return a.localeCompare(b);
    });
  }, [foodGroups, foodCategoryOrder]);
  
  // Filtered wine groups
  const filteredWineItems = useMemo(() => {
    const availableWines = wineItems.filter(item => item.available);
    if (wineFilter === 'Todos') return availableWines;
    return availableWines.filter(item => item.category === wineFilter);
  }, [wineItems, wineFilter]);

  const wineGroups = groupBy(filteredWineItems);

  const getTypeColor = (type?: string): string | undefined => {
    switch (type) {
      case 'Branco':
        return '#4ade80';
      case 'Tinto':
        return '#a78bfa';
      case 'Doce':
        return '#fb923c';
      case 'Espumoso':
        return '#fde047';
      default:
        return undefined;
    }
  };

  const renderItem = (item: MenuItem, index: number, type: 'food' | 'wine') => {
    const hasImage = !!item.image;
    const wineBottle = type === 'wine' ? item.bottlePrice : null;
    const wineGlass = type === 'wine' ? item.glassPrice : null;

    return (
      <div 
        key={`${type}-${index}`} 
        onClick={() => hasImage && setSelectedItem(item)}
        className={`group relative flex flex-col mb-8 animate-in fade-in duration-500 ${hasImage ? 'cursor-pointer' : ''}`}
      >
        <div className="flex justify-between items-baseline mb-1 border-b border-gray-200 pb-1">
          <h4 className="text-sm md:text-base font-bold uppercase tracking-tight text-black group-hover:text-[#4a5d23] transition-colors flex items-center gap-2">
            {item.name}
            {hasImage && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-300 group-hover:text-[#4a5d23] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {type === 'wine' && item.wineType && (
              (() => {
                const color = getTypeColor(item.wineType);
                return (
                  <span
                    className="ml-1 text-[10px] font-black uppercase tracking-widest"
                    style={color ? { color } : undefined}
                  >
                    {item.wineType}
                  </span>
                );
              })()
            )}
          </h4>
          {type === 'wine' ? (
            <span className="text-[10px] font-bold ml-2 whitespace-nowrap text-black uppercase tracking-widest text-right">
              {wineGlass !== null && wineGlass !== undefined && (
                <span>Copa {Number(wineGlass).toFixed(2)}€</span>
              )}
              {wineBottle !== null && wineBottle !== undefined && (
                <span>
                  {wineGlass !== null && wineGlass !== undefined ? ' · ' : ''}
                  Botella {Number(wineBottle).toFixed(2)}€
                </span>
              )}
              {(wineGlass === null || wineGlass === undefined) && (wineBottle === null || wineBottle === undefined) && (
                <span>{item.price.toFixed(2)}€</span>
              )}
            </span>
          ) : (
            <span className="text-sm font-bold ml-2 whitespace-nowrap text-black">{item.price.toFixed(2)}€</span>
          )}
        </div>
        
        <div className="pr-2 space-y-1">
           {type === 'wine' && (item.winery || item.winemaker) && (
             <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
               {item.winery} {item.winemaker && `— ${item.winemaker}`}
             </p>
           )}
           {type === 'wine' && item.region && (
             <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
               {item.region}
             </p>
           )}
           {type === 'wine' && item.grapes && (
             <p className="text-[10px] italic text-gray-600">
               <span className="font-bold not-italic">Uvas:</span> {item.grapes}
             </p>
           )}
           <p className="text-gray-700 text-xs md:text-sm italic leading-relaxed">{item.description}</p>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.tags.map(tag => (
              <span key={tag} className="text-[8px] md:text-[9px] uppercase tracking-wider text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded-sm bg-gray-50/50 font-bold">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCategoryBlock = (title: string, items: MenuItem[], type: 'food' | 'wine') => (
    <div key={title} className="mb-16 last:mb-0">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-[#4a5d23] whitespace-nowrap">{title}</h3>
        <div className="h-[1px] bg-gray-200 flex-1"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-2">
        {items.map((item, idx) => renderItem(item, idx, type))}
      </div>
    </div>
  );

  const wineCategories = useMemo(() => {
    const order = wineCategoryOrder.length > 0 ? wineCategoryOrder : WINE_DO_ORDER;
    return ['Todos', ...order];
  }, [wineCategoryOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      {/* COCIÑA BLOCK */}
      <div className="mb-32">
        <div className="text-center mb-20 relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-black uppercase tracking-tighter">A COCIÑA</h2>
          <div className="w-20 h-1 bg-[#4a5d23] mx-auto"></div>
          <p className="text-black text-xs uppercase tracking-[0.4em] mt-5 font-bold">Gastronomía Galega e do Mundo</p>
          <p className="text-gray-400 text-[10px] uppercase mt-2 font-bold tracking-widest italic">Pulsa nos pratos para velos</p>
        </div>

        {orderedFoodCategories.map((category) => {
          const items = foodGroups[category] ?? foodGroups[''] ?? foodGroups['Outros'] ?? [];
          return renderCategoryBlock(category, items, 'food');
        })}
      </div>

      {/* DIVIDER */}
      <div className="flex items-center justify-center mb-32 gap-6">
        <div className="h-[1px] bg-gray-300 flex-1"></div>
        <div className="w-4 h-4 border border-[#4a5d23] rotate-45 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#4a5d23]"></div>
        </div>
        <div className="h-[1px] bg-gray-300 flex-1"></div>
      </div>

      {/* ADEGA BLOCK */}
      <div className="mb-20">
        <div className="text-center mb-20 relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-black uppercase tracking-tighter">A ADEGA</h2>
          <div className="w-20 h-1 bg-[#4a5d23] mx-auto"></div>
          <p className="text-black text-xs uppercase tracking-[0.4em] mt-5 font-bold mb-10">Selección de Viticultores e D.O.</p>
          
          {/* WINE FILTERS */}
          <div className="flex gap-2 mb-16 overflow-x-auto no-scrollbar pb-4 justify-start md:justify-center">
            {wineCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setWineFilter(cat)}
                className={`px-5 py-2 whitespace-nowrap rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  wineFilter === cat 
                    ? 'bg-[#4a5d23] border-[#4a5d23] text-white shadow-lg' 
                    : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(wineGroups).length > 0 ? (
          (() => {
            const orderIndex = new Map<string, number>();
            const order = wineCategoryOrder.length > 0 ? wineCategoryOrder : WINE_DO_ORDER;
            order.forEach((c, idx) => orderIndex.set(c, idx));
            const hasBackendOrder = wineCategoryOrder.length > 0;

            return Object.entries(wineGroups)
              .sort(([a], [b]) => {
                if (hasBackendOrder) {
                  const ia = orderIndex.has(a) ? (orderIndex.get(a) as number) : Number.POSITIVE_INFINITY;
                  const ib = orderIndex.has(b) ? (orderIndex.get(b) as number) : Number.POSITIVE_INFINITY;
                  if (ia !== ib) return ia - ib;
                  return a.localeCompare(b);
                }

                const indexA = WINE_DO_ORDER.indexOf(a);
                const indexB = WINE_DO_ORDER.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              })
              .map(([category, items]) => renderCategoryBlock(category, items, 'wine'));
          })()
        ) : (
          <div className="py-20 text-center border border-dashed border-gray-200 text-gray-400 italic">
            Non hai viños dispoñibles nesta categoría de momento.
          </div>
        )}
        
        <div className="mt-24 p-12 bg-gray-50 border border-gray-200 rounded-sm text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#4a5d23]"></div>
          <p className="text-gray-800 mb-6 font-serif italic text-xl md:text-2xl leading-relaxed">
            "O viño é a única obra de arte que se pode beber."
          </p>
          <p className="text-xs uppercase tracking-[0.5em] text-[#4a5d23] font-bold">Luis Fernando Olaverri</p>
        </div>
      </div>

      {/* MODAL PARA IMAXES DA CARTA */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedItem(null)}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
          <div 
            className="relative bg-white max-w-4xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 rounded-sm"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-black text-white p-2 hover:bg-[#4a5d23] transition-colors rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-3/5 aspect-square md:aspect-auto">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              </div>
              <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-white text-black">
                <span className="text-[#4a5d23] font-bold text-xs uppercase tracking-[0.3em] mb-4 block">{selectedItem.category}</span>
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter leading-tight border-b border-gray-100 pb-4">{selectedItem.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-8 italic">{selectedItem.description}</p>
                {(selectedItem.region || selectedItem.winery || selectedItem.winemaker || selectedItem.grapes) && (
                  <div className="text-[11px] text-gray-600 mb-8 space-y-1">
                    {selectedItem.region && <div className="uppercase font-bold tracking-widest text-gray-500">{selectedItem.region}</div>}
                    {(selectedItem.winery || selectedItem.winemaker) && (
                      <div className="uppercase font-bold tracking-widest text-gray-500">
                        {selectedItem.winery} {selectedItem.winemaker && `— ${selectedItem.winemaker}`}
                      </div>
                    )}
                    {selectedItem.grapes && (
                      <div className="italic">
                        <span className="font-bold not-italic">Uvas:</span> {selectedItem.grapes}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-50">
                   <span className="text-2xl font-black text-black">
                     {selectedItem.glassPrice !== null && selectedItem.glassPrice !== undefined && (
                       <span className="mr-4">Copa {Number(selectedItem.glassPrice).toFixed(2)}€</span>
                     )}
                     {selectedItem.bottlePrice !== null && selectedItem.bottlePrice !== undefined && (
                       <span>Botella {Number(selectedItem.bottlePrice).toFixed(2)}€</span>
                     )}
                     {(selectedItem.glassPrice === null || selectedItem.glassPrice === undefined) &&
                       (selectedItem.bottlePrice === null || selectedItem.bottlePrice === undefined) && (
                         <span>{selectedItem.price.toFixed(2)}€</span>
                       )}
                   </span>
                   <div className="flex gap-2">
                     {selectedItem.tags?.map(t => (
                       <span key={t} className="text-[9px] uppercase font-bold tracking-widest text-gray-400">{t}</span>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuSection;