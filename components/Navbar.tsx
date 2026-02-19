import React, { useState, useEffect } from 'react';
import { Section } from '../types';
import { COLORS } from '../constants';

interface NavbarProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
  isLightBackground?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentSection, onNavigate, isLightBackground = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Inicio', id: Section.HOME },
    { label: 'Axenda', id: Section.EVENTS },
    { label: 'A Carta', id: Section.MENU },
    { label: 'Reservas', id: Section.RESERVATIONS },
    { label: 'Proxectos', id: Section.PROJECTS },
    { label: 'Traballa con nós', id: Section.CAREERS },
  ];

  // Determine colors based on scroll and page theme
  const useDarkText = isLightBackground && !isScrolled;
  const textColorClass = useDarkText ? 'text-black' : 'text-white';
  const logoColorClass = useDarkText ? 'text-black' : 'text-white';

  return (
    <nav 
      className={`fixed top-0 w-full z-40 transition-all duration-300 ease-in-out px-6 md:px-12 py-4 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div 
          className={`text-2xl font-bold tracking-[0.2em] cursor-pointer transition-colors duration-300 ${logoColorClass}`}
          onClick={() => {
            onNavigate(Section.HOME);
            setMobileMenuOpen(false);
          }}
        >
          A RIALA
          <span className="font-normal" style={{color: COLORS.mossGreen}}> TABERNA</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-sm uppercase tracking-widest hover:text-[#4a5d23] transition-colors relative group ${
                currentSection === item.id ? 'text-[#4a5d23]' : textColorClass
              }`}
            >
              {item.label}
              <span className={`absolute -bottom-1 left-0 w-0 h-[1px] bg-[#4a5d23] transition-all duration-300 group-hover:w-full ${currentSection === item.id ? 'w-full' : ''}`}></span>
            </button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={`md:hidden transition-colors duration-300 ${textColorClass}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-t border-gray-800 p-6 flex flex-col gap-4 shadow-xl">
           {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left text-lg uppercase tracking-widest ${
                currentSection === item.id ? 'text-[#4a5d23]' : 'text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;