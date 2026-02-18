import { MenuItem, EventItem } from './types';

export const COLORS = {
  black: '#000000',
  white: '#ffffff',
  mossGreen: '#4a5d23',
  mossGreenLight: '#6b823a',
  tinto: '#800020', // Burdeos
  doce: '#ff8c00', // Laranxa
  espumoso: '#ffd700', // Amarela
};

export const WINE_DO_ORDER = [
  "Rias Baixas",
  "Ribeiro",
  "Barbanza",
  "Monterrei",
  "Ribeira Sacra",
  "Sin. D.O.",
  "Bierzo",
  "Toro",
  "Ribera del Duero",
  "Rioja",
  "Outros",
  "Cava",
  "Champagne"
];

export const FOOD_MENU: MenuItem[] = [
  // Entremés
  { 
    category: "Entremés", 
    name: "Patacas bravas", 
    description: "Clásicas con salsa brava.", 
    price: 5.3, 
    available: true,
    tags: ["Tapas"],
    image: "https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Entremés", 
    name: "Boniato con ali-oli de alfábega", 
    description: "Doce e aromático.", 
    price: 7.7, 
    available: true,
    tags: ["Vexetariano"],
    image: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Entremés", 
    name: "Mexillóns en escabeche - Dardo", 
    description: "Conserva de alta calidade.", 
    price: 8.5, 
    available: true,
    tags: ["Marisco"],
    image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Entremés", 
    name: "Croquetas artesás (8 Und.)", 
    description: "Cremosas e caseiras.", 
    price: 8.9, 
    available: true,
    tags: ["Caseiro"],
    image: "https://images.unsplash.com/photo-1562967914-6c82c637d7a4?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Entremés", 
    name: "Rixóns fritos con Yakiniku", 
    description: "Torreznos con toque xaponés.", 
    price: 9.9, 
    available: true,
    tags: ["Carne"],
    image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Entremés", 
    name: "Taboa de queixos “Prestes”", 
    description: "Selección de queixos galegos.", 
    price: 14.0, 
    available: true,
    tags: ["Para compartir"],
    image: "https://images.unsplash.com/photo-1631379544355-83569736639d?q=80&w=1000&auto=format&fit=crop"
  },

  // Pratos do Mundo
  { 
    category: "Pratos do Mundo", 
    name: "Hummus con “Mariñeiras”", 
    description: "Oriente Medio. Garavanzos e tahini.", 
    price: 5.3, 
    available: true,
    tags: ["Vegano"],
    image: "https://images.unsplash.com/photo-1577906030559-3bac211b5124?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Pratos do Mundo", 
    name: "Muhammara con totopos", 
    description: "Libia. Crema de pementos e noces.", 
    price: 7.5, 
    available: true,
    tags: ["Picante"],
    image: "https://images.unsplash.com/photo-1516685018646-527ad952f519?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Pratos do Mundo", 
    name: "Shakshuka con ovos", 
    description: "Maghreb. Ovos escalfados en salsa de tomate.", 
    price: 11.9, 
    available: true,
    tags: ["Quente"],
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Pratos do Mundo", 
    name: "Nachos con guacamole", 
    description: "México. Totopos con guacamole caseiro.", 
    price: 13.6, 
    available: true,
    tags: ["Para compartir"],
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Pratos do Mundo", 
    name: "Carpaccio de vaca vella", 
    description: "Italia. Láminas finas de carne madurada.", 
    price: 13.3, 
    available: true,
    tags: ["Crú"],
    image: "https://images.unsplash.com/photo-1511211023349-f06b64958327?q=80&w=1000&auto=format&fit=crop"
  },

  // Tostas
  { 
    category: "Tostas", 
    name: "Rixóns, Camembert e marmelo de tomate", 
    description: "Contraste doce e salgado.", 
    price: 10.2,
    available: true,
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Tostas", 
    name: "Lacón, grelos, Tetilla e allada", 
    description: "Sabor 100% galego.", 
    price: 10.9,
    available: true,
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Tostas", 
    name: "Cogumelos, guanciale e carbonara", 
    description: "Cremosa e intensa.", 
    price: 8.90,
    available: true,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"
  },

  // Larpeiradas
  { 
    category: "Larpeiradas", 
    name: "Gofre con chocolate quente", 
    description: "Para os máis gulosos.", 
    price: 6.0, 
    available: true,
    tags: ["Doce"],
    image: "https://images.unsplash.com/photo-1585501946343-bb9503e14d1c?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Larpeiradas", 
    name: "Torrada doce con xeado de vainilla", 
    description: "Torrija caramelizada.", 
    price: 6.0, 
    available: true,
    tags: ["Doce"],
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    category: "Larpeiradas", 
    name: "Flan de queixo con froitos vermellos", 
    description: "Cremoso e suave.", 
    price: 5.0, 
    available: true,
    tags: ["Doce"],
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1000&auto=format&fit=crop"
  }
];

export const WINE_MENU: MenuItem[] = [
  // Rías Baixas
  { category: "Rias Baixas", name: "ATTIS", winery: "ATTIS", winemaker: "Robustiano Fariña", grapes: "Albariño", wineType: "Blanco", price: 21.2, available: true, description: "Val do Salnés. Un branco con alma atlántica." },
  { category: "Rias Baixas", name: "SITTA PEREIRAS", winery: "ATTIS", winemaker: "Robustiano Fariña", grapes: "Albariño", wineType: "Blanco", price: 34.9, available: true, description: "Lías. Elegancia e profundidade." },
  { category: "Rias Baixas", name: "ALBAMAR", winery: "ALBAMAR", winemaker: "Xurxo Alba", grapes: "Albariño", wineType: "Blanco", price: 21.6, available: true, description: "Salinidade e frescura de Cambados." },
  { category: "Rias Baixas", name: "CÍES", winery: "RODRIGO MÉNDEZ", winemaker: "Rodrigo Méndez", grapes: "Albariño", wineType: "Blanco", price: 24.5, available: true, description: "Meaño. Viño de autor con gran carácter." },

  // Ribeiro
  { category: "Ribeiro", name: "FUSCO", winery: "ALBAMAR", winemaker: "Xurxo Alba", grapes: "Treixadura, Torrontes, Albariño, Loureiro", wineType: "Blanco", price: 20.2, available: true, description: "Equilibrio e harmonía no val do Avia." },
  { category: "Ribeiro", name: "CASAL DE ARMAN", winery: "CASAL DE ARMÁN", winemaker: "Javier González Vázquez", grapes: "Treixadura", wineType: "Blanco", price: 19.8, available: true, description: "Un clásico imprescindible do Ribeiro." },
  { category: "Ribeiro", name: "EIDOS ERMOS", winery: "LUIS ANXO RODRÍGUEZ", winemaker: "Luis Anxo Rodríguez", grapes: "Treixadura, Torrontes, Albariño, Loureiro", wineType: "Blanco", price: 20.5, available: true, description: "Arnoia. Pureza e frescura." },
  { category: "Ribeiro", name: "EIDOS ERMOS", winery: "LUIS ANXO RODRÍGUEZ", winemaker: "Luis Anxo Rodríguez", grapes: "Treixadura, Torrontes, Albariño, Loureiro", wineType: "Blanco", price: 21.9, available: true, description: "Arnoia. Seleccionado." },
  { category: "Ribeiro", name: "A TEIXA", winery: "LUIS ANXO RODRÍGUEZ", winemaker: "Luis Anxo Rodríguez", grapes: "Treixadura, Torrontes, Albariño, Loureiro", wineType: "Blanco", price: 36.3, available: true, description: "Viño de finca, complexo e mineral." },
  { category: "Ribeiro", name: "VIÑA DE MARTIN ESCOLMA", winery: "LUIS ANXO RODRÍGUEZ", winemaker: "Luis Anxo Rodríguez", grapes: "Treixadura, Torrontes, Albariño, Loureiro", wineType: "Blanco", price: 49.3, available: true, description: "A máxima expresión do branco en Arnoia." },
  { category: "Ribeiro", name: "A TORNA DOS PASAS", winery: "LUIS ANXO RODRÍGUEZ", winemaker: "Luis Anxo Rodríguez", grapes: "Sousón, Caiño", wineType: "Tinto", price: 36.0, available: true, description: "Tinto de guarda, auténtico e racial." },
  { category: "Ribeiro", name: "A SEARA", winery: "VIÑOS CON MEMORIA", winemaker: "Iria otero", grapes: "Treixadura, Godello, Loureiro e Torrontes", wineType: "Blanco", price: 21.6, available: true, description: "Sensibilidade e territorio." },
  { category: "Ribeiro", name: "COLLEITEIRO", winery: "MANUEL ROJO", winemaker: "Manuel Rojo", grapes: "Treixadura, Lado, Godello, Albariño", wineType: "Blanco", price: 33.0, available: true, description: "Artesanía líquida." },

  // Ribeira Sacra
  { category: "Ribeira Sacra", name: "SILIUS", winery: "ATRIUM VITIS", winemaker: "Ana Gadín", grapes: "Godello", wineType: "Blanco", price: 21.6, available: true, description: "Quiroga-Bibei. Godello vibrante." },
  { category: "Ribeira Sacra", name: "MIMOSA", winery: "ATRIUM VITIS", winemaker: "Ana Gadín", grapes: "Godello", wineType: "Blanco", price: 33.6, available: true, description: "Elegancia floral." },
  { category: "Ribeira Sacra", name: "SILIUS PIZARRA", winery: "ATRIUM VITIS", winemaker: "Ana Gadín", grapes: "Mencía", wineType: "Tinto", price: 33.6, available: true, description: "Expresión mineral da lousa." },
  { category: "Ribeira Sacra", name: "REFUGALLO", winery: "DOMINIO DE BIBEI", winemaker: "Paula Fernandez", grapes: "Godello, Albariño, Doña Blanca", wineType: "Blanco", price: 21.1, available: true, description: "Frescura silvestre." },
  { category: "Ribeira Sacra", name: "REFUGALLO", winery: "DOMINIO DE BIBEI", winemaker: "Paula Fernandez", grapes: "Garnacha, Mencía", wineType: "Tinto", price: 21.1, available: true, description: "Pureza froital." },
  { category: "Ribeira Sacra", name: "LALAMA", winery: "DOMINIO DE BIBEI", winemaker: "Paula Fernandez", grapes: "Mencía, Brancellao, Garnacha Tinta, Mouratón, Souson", wineType: "Tinto", price: 30.2, available: true, description: "O tinto de referencia en Bibei." },
  { category: "Ribeira Sacra", name: "VILA DESPASANDE 'SILENTE'", winery: "SAIÑAS", winemaker: "Javier Fernandez", grapes: "Mencía, Garnacha tintorera", wineType: "Tinto", price: 20.2, available: true, description: "Viño silencioso e profundo." },
  { category: "Ribeira Sacra", name: "CONASBRANCAS", winery: "FEDELLOS DO COUTO", winemaker: "Luis Taboada", grapes: "Godello, Dona Branca", wineType: "Blanco", price: 27.9, available: true, description: "Fresco, mineral e directo." },
  { category: "Ribeira Sacra", name: "LOMBA DOS ARES", winery: "FEDELLOS DO COUTO", winemaker: "Luis Taboada", grapes: "Mencía, Garnacha, Caíño", wineType: "Tinto", price: 27.9, available: true, description: "Paisaxe embotellada." },
  { category: "Ribeira Sacra", name: "BASTARDA", winery: "FEDELLOS DO COUTO", winemaker: "Luis Taboada", grapes: "Bastardo", wineType: "Tinto", price: 40.6, available: true, description: "Un tinto diferente e cativador." },
  { category: "Ribeira Sacra", name: "GUIMARO", winery: "GUÍMARO", winemaker: "Pedro Rodríguez", grapes: "Mencía, Brancellao, Merenzao", wineType: "Tinto", price: 15.8, available: true, description: "A esencia de Amandi." },
  { category: "Ribeira Sacra", name: "GUIMARO CEPAS VELLAS", winery: "GUÍMARO", winemaker: "Pedro Rodríguez", grapes: "Godello", wineType: "Blanco", price: 29.6, available: true, description: "Godello de cepas antigas." },
  { category: "Ribeira Sacra", name: "GUIMARO CAMIÑO REAL", winery: "GUÍMARO", winemaker: "Pedro Rodríguez", grapes: "Mencía, Brancellao, Merenzao", wineType: "Tinto", price: 24.6, available: true, description: "Estrutura e elegancia." },

  // Barbanza e Iria
  { category: "Barbanza", name: "CAZAPITAS RAPOSO", winery: "CAZAPITAS", winemaker: "David Rial", grapes: "Raposo", wineType: "Blanco", price: 28.7, available: true, description: "Unha rareza deliciosa de Barbanza." },
  { category: "Barbanza", name: "CAZAPITAS DOCE", winery: "CAZAPITAS", winemaker: "David Rial", grapes: "Albariño", wineType: "Doce", price: 28.7, available: true, description: "Doce natural de Albariño." },
  { category: "Barbanza", name: "KOMOKABRAS VERDE", winery: "ADEGA ENTRE OS RIOS", winemaker: "Jose Crusat", grapes: "Albariño", wineType: "Blanco", price: 19.7, available: true, description: "Viño con alma de mar e terra." },

  // Monterrei
  { category: "Monterrei", name: "CANDEA", winery: "QUINTA DA MURADELLA", winemaker: "Jose Luis Mateo", grapes: "Godello, Dona Branca, Treixadura", wineType: "Blanco", price: 18.5, available: true, description: "Equilibrio e pureza." },
  { category: "Monterrei", name: "CAMPO DE PROBAS 2015", winery: "QUINTA DA MURADELLA", winemaker: "Jose Luis Mateo", grapes: "Dona Branca", wineType: "Blanco", price: 36.3, available: true, description: "Experimentación e tradition." },
  { category: "Monterrei", name: "CANDEA", winery: "QUINTA DA MURADELLA", winemaker: "Jose Luis Mateo", grapes: "Mencía, Bastardo, Garnacha", wineType: "Tinto", price: 18.5, available: true, description: "Tinto fresco de Monterrei." },

  // Bierzo
  { category: "Bierzo", name: "VALTUILLE", winery: "BODEGA Y VIÑEDOS CASTRO VENTOSA", winemaker: "Raúl Pérez", grapes: "Godello", wineType: "Blanco", price: 55.4, available: true, description: "O branco de luxo de Raúl Pérez." },
  { category: "Bierzo", name: "VALTUILLE VINO DE VILLA", winery: "BODEGA Y VIÑEDOS CASTRO VENTOSA", winemaker: "Raúl Pérez", grapes: "Mencía, Alicante bouschet, Bastardo, Outras", wineType: "Tinto", price: 21.2, available: true, description: "Tipicidade berciana." },

  // Douro (Outros)
  { category: "Outros", name: "XISTO ILIMITADO", winery: "LUIS SEABRA", winemaker: "Luis Seabra", grapes: "Rabigato, Códega de Larinho, Outras", wineType: "Blanco", price: 22.6, available: true, description: "Douro vertical e mineral." },
  { category: "Outros", name: "XISTO ILIMITADO", winery: "LUIS SEABRA", winemaker: "Luis Seabra", grapes: "Tinta Amarela, Outras", wineType: "Tinto", price: 22.6, available: true, description: "Elegancia portuguesa." },

  // Ribera del Duero
  { category: "Ribera del Duero", name: "LADERAS DEL NORTE", winery: "BODEGAS ARZUAGA", winemaker: "Adolfo González", grapes: "Tinta del país", wineType: "Tinto", price: 27.4, available: true, description: "Carácter e forza." },
  { category: "Ribera del Duero", name: "ARZUAGA", winery: "BODEGAS ARZUAGA", winemaker: "Adolfo González", grapes: "Tempranillo, Cabernet Sauvignon, Merlot", wineType: "Tinto", price: 32.3, available: true, description: "O clásico de Arzuaga." },
  { category: "Ribera del Duero", name: "CARRAMIMBRE CR.", winery: "CARRAMIMBRE", winemaker: "Germán Medrano", grapes: "Tempranillo", wineType: "Tinto", price: 18.2, available: true, description: "Equilibrio ideal." },
  { category: "Ribera del Duero", name: "ALTAMIMBRE", winery: "CARRAMIMBRE", winemaker: "Germán Medrano", grapes: "Tempranillo", wineType: "Tinto", price: 37.6, available: true, description: "Selección especial." },
  { category: "Ribera del Duero", name: "3º AÑO.", winery: "TOMAS POSTIGO", winemaker: "Tomas Postigo", grapes: "Tinto Fino, Cabernet Sauvignon, Merlot, Malbec", wineType: "Tinto", price: 48.0, available: true, description: "Mestría e tempo." },

  // Rioja
  { category: "Rioja", name: "VIÑAS DEL GAIN", winery: "BODEGAS Y VIÑEDOS ARTADI", winemaker: "Jean Francois Gadeau", grapes: "Tempranillo", wineType: "Tinto", price: 33.2, available: true, description: "Viño de parcela con gran viveza." },
  { category: "Rioja", name: "SIERRA CANTABRIA CRIANZA", winery: "SIERRA CANTABRIA", winemaker: "Marcos Eguren", grapes: "Tempranillo", wineType: "Tinto", price: 18.1, available: true, description: "Tradición rioxana renovada." },
  { category: "Rioja", name: "SIERRA CANTABRIA CUVEE", winery: "SIERRA CANTABRIA", winemaker: "Marcos Eguren", grapes: "Tempranillo", wineType: "Tinto", price: 28.2, available: true, description: "Elegancia extrema." },
  { category: "Rioja", name: "SAN VICENTE", winery: "SIERRA CANTABRIA", winemaker: "Marcos Eguren", grapes: "Tempranillo peludo", wineType: "Tinto", price: 52.4, available: true, description: "Un viño único e lendario." },
  { category: "Rioja", name: "LA MONTESA", winery: "PALACIOS REDONDO", winemaker: "Álvaro Palacios", grapes: "Garnacha", wineType: "Tinto", price: 21.4, available: true, description: "A Garnacha máis refinada." },
  { category: "Rioja", name: "PROPIEDAD", winery: "PALACIOS REDONDO", winemaker: "Álvaro Palacios", grapes: "Garnacha", wineType: "Tinto", price: 41.7, available: true, description: "Complexidade e terroir." },
  { category: "Rioja", name: "ALTUM", winery: "ALTUM", winemaker: "Iker e Alberto Martínez Pangua", grapes: "Tempranillo", wineType: "Tinto", price: 19.7, available: true, description: "Modernidade e froita." },
  { category: "Rioja", name: "VILLACARDIEL", winery: "ALTUM", winemaker: "Iker e Alberto Martínez Pangua", grapes: "Tempranillo", wineType: "Tinto", price: 25.1, available: true, description: "Estrutura equilibrada." },

  // Toro
  { category: "Toro", name: "PRIMA", winery: "BODEGAS SAN ROMAN", winemaker: "Mariano García", grapes: "Tinta de Toro, Garnacha", wineType: "Tinto", price: 21.2, available: true, description: "A cara máis fresca de Toro." },
  { category: "Toro", name: "SAN ROMAN", winery: "BODEGAS SAN ROMAN", winemaker: "Mariano García", grapes: "Tinta de Toro, Garnacha", wineType: "Tinto", price: 45.4, available: true, description: "Potencia e elegancia." },

  // Mallorca (Outros)
  { category: "Outros", name: "SUPERNOVA", winery: "CA'N VERDURA VITICULTORS", winemaker: "Tomeu Llabrés", grapes: "Prensal Blanco", wineType: "Blanco", price: 21.8, available: true, description: "Mallorca branca e salina." },
  { category: "Outros", name: "CA'N VERDURA", winery: "CA'N VERDURA VITICULTORS", winemaker: "Tomeu Llabrés", grapes: "Manto Negro, Merlot, Callet, Outras", wineType: "Tinto", price: 19.4, available: true, description: "Paisaxe mediterránea." },

  // Sin. D.O. / Outros
  { category: "Sin. D.O.", name: "TOXAL", winery: "AMANDO GONZÁLEZ VIANA", winemaker: "Amando González", grapes: "Treixadura, Albariño", wineType: "Blanco", price: 27.9, available: true, description: "Viño sen fronteiras." },
  { category: "Sin. D.O.", name: "MIX BRANCO", winery: "MIXTURA", winemaker: "Gutier Seijo", grapes: "Treixadura, Albariño", wineType: "Blanco", price: 26.9, available: true, description: "A mestura perfecta." },
  { category: "Sin. D.O.", name: "MIX TINTO", winery: "MIXTURA", winemaker: "Gutier Seijo", grapes: "Mencía, Caíño, Brancellao, Sousón", wineType: "Tinto", price: 26.9, available: true, description: "Complexidade atlántica." },
  { category: "Sin. D.O.", name: "ANCESTRAL", winery: "ALBAMAR", winemaker: "Xurxo Alba", grapes: "Albariño", wineType: "Espumoso", price: 29.5, available: true, description: "Burbullas naturais sen D.O." },
  { category: "Sin. D.O.", name: "PAGO FLORENTINO", winery: "BODEGAS ARZUAGA", winemaker: "Adolfo González", grapes: "Cencibel", wineType: "Tinto", price: 20.2, available: true, description: "Viño de Pago de gran calidade." },

  // Cava / Champagne
  { category: "Cava", name: "GRAMONA “LA CUVEE”", winery: "GRAMONA", winemaker: "Jaume Gramona Martí", grapes: "Xarelo, Macabeo, Parellada", wineType: "Espumoso", price: 23.0, available: true, description: "Elegancia artesá." },
  { category: "Cava", name: "GRAMONA “ROSE”", winery: "GRAMONA", winemaker: "Jaume Gramona Martí", grapes: "Pinot Noir", wineType: "Espumoso", price: 29.5, available: true, description: "Sutileza rosada." },
  { category: "Champagne", name: "PHILIPPONNAT ROYALE", winery: "CHAMPAGNE PHILIPPONNAT", winemaker: "Thierry Garnier", grapes: "Pinot Noir, Chardonnay, Meunier", wineType: "Espumoso", price: 78.9, available: true, description: "O luxo francés en cada burbulla." }
];

export const EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Jazz e Viños",
    date: "15 OUT",
    time: "20:00",
    description: "Noite de Jazz en vivo acompañado dunha cata de viños galegos.",
    category: "Concerto",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop&grayscale"
  },
  {
    id: 2,
    title: "Obradoiro de Tapas",
    date: "22 OUT",
    time: "18:30",
    description: "Aprende a cociñar as nosas tapas máis icónicas co Chef.",
    category: "Cata",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop&grayscale"
  },
  {
    id: 3,
    title: "Sesión Vermú: [·] de encontro",
    date: "29 OUT",
    time: "13:00",
    description: "Ciclo de encontros con música, humor e diálogo.",
    category: "[·] de encontro",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop&grayscale"
  },
  {
    id: 4,
    title: "Exposición: Mar de Fondo",
    date: "01 NOV",
    time: "19:00",
    description: "Inauguración de fotografía costumista galega.",
    category: "Exposición",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop&grayscale"
  }
];