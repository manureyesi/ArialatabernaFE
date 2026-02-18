import React, { useState } from 'react';
import { ProjectProposal } from '../types';

interface ProjectSectionProps {
  onSubmit: (proposal: ProjectProposal) => void;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    discipline: '',
    description: '',
    bio: '',
    socials: '',
    termsAccepted: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) return;

    let fileBase64: string | undefined = undefined;
    if (file) {
      fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      }).catch(() => undefined);
    }
    
    const newProposal: ProjectProposal = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        title: formData.title,
        discipline: formData.discipline,
        description: formData.description,
        bio: formData.bio,
        socials: formData.socials,
        hasFile: !!file,
        fileBase64,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'new'
    };

    onSubmit(newProposal);
    setIsSubmitted(true);
    
    // Reset after delay
    setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
            name: '', email: '', phone: '', title: '', discipline: '',
            description: '', bio: '', socials: '', termsAccepted: false
        });
        setFile(null);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto text-white">
        <div className="text-center mb-16 relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">ENVÍA O TEU PROXECTO</h2>
            <div className="w-24 h-1 bg-[#4a5d23] mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Buscas un espazo único para desenvolver o teu proxecto? Convidámoste a que nos envíes a túa proposta.
                Na Riala Taberna apoiamos a cultura e a creatividade local.
            </p>
        </div>

        {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-8 md:p-12 rounded-sm border border-gray-800 space-y-8">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Nome e Apelidos *</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-[#4a5d23] focus:outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">E-mail *</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-[#4a5d23] focus:outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Teléfono *</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-[#4a5d23] focus:outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Redes Sociais do Proxecto</label>
                        <input type="text" name="socials" value={formData.socials} onChange={handleChange} placeholder="@instagram, web..." className="w-full bg-black border border-gray-700 text-white p-3 focus:border-[#4a5d23] focus:outline-none transition-colors" />
                    </div>
                </div>

                {/* Project Details */}
                <div className="border-t border-gray-800 pt-8">
                    <h3 className="text-xl font-bold mb-6 text-[#4a5d23]">DETALLES DO PROXECTO</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                         <div className="md:col-span-2">
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Título do proxecto *</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-[#4a5d23] focus:outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">En que disciplina se enmarca? *</label>
                            <select name="discipline" required value={formData.discipline} onChange={handleChange} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-[#4a5d23] focus:outline-none transition-colors">
                                <option value="">Selecciona unha opción</option>
                                <option value="musica">Música / Concertos</option>
                                <option value="arte">Arte / Exposición</option>
                                <option value="literatura">Literatura / Poesía</option>
                                <option value="gastronomia">Gastronomía / Cata</option>
                                <option value="outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Cóntanos brevemente en que consiste (aprox. 10 liñas) *</label>
                        <textarea name="description" required rows={6} value={formData.description} onChange={handleChange} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-[#4a5d23] focus:outline-none transition-colors" />
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Fálanos de ti (persoa/entidade organizadora) *</label>
                        <textarea name="bio" required rows={4} value={formData.bio} onChange={handleChange} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-[#4a5d23] focus:outline-none transition-colors" />
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Portfolio / Currículum Vitae (PDF)</label>
                        <div className="relative">
                            <input 
                                type="file" 
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-xs file:font-semibold file:uppercase file:bg-[#4a5d23] file:text-white hover:file:bg-[#3a4a1b] bg-black border border-gray-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-800 pt-6">
                    <input 
                        type="checkbox" 
                        id="terms" 
                        checked={formData.termsAccepted} 
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 accent-[#4a5d23] bg-black border-gray-700"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-400">
                        Lin e acepto os <a href="#" className="underline hover:text-white">termos e condicións</a> para o envío de propostas. *
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={!formData.termsAccepted}
                    className={`w-full py-4 uppercase tracking-[0.2em] font-bold transition-all duration-300 mt-4 ${
                        formData.termsAccepted 
                        ? 'bg-[#4a5d23] hover:bg-[#3a4a1b] text-white' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Enviar Proposta
                </button>
                <p className="text-xs text-gray-500 mt-4">* Os campos marcados son obrigatorios.</p>
            </form>
        ) : (
             <div className="bg-[#1a1a1a] p-12 md:p-24 rounded-sm border border-gray-800 text-center animate-in fade-in duration-700">
                 <div className="inline-block p-4 rounded-full border-2 border-[#4a5d23] mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#4a5d23]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
                <h3 className="text-3xl font-bold mb-4">Proposta Enviada</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                    Grazas por querer formar parte da Riala. Revisaremos a túa proposta e contactaremos contigo se encaixa na nosa axenda cultural.
                </p>
            </div>
        )}
    </div>
  );
};

export default ProjectSection;