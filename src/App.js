import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Send,
  ChevronRight,
  MessageSquare,
  X,
  Trees,
  TowerControl as Tower,
  ChevronLeft,
  CheckCircle2,
  Fingerprint,
  Activity,
  Compass,
  Instagram,
  Twitter,
  Linkedin,
  Palette,
  ShieldAlert,
  Rocket,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

// --- CONFIGURATION ---
const apiKey = ""; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// --- DONNÉES HISTORIQUES ---
const destinations = [
  {
    id: 'paris-1889',
    title: 'Paris 1889',
    subtitle: 'La Cité de Fer et de Lumière',
    description: "Vivez l'Exposition Universelle. Admirez la Tour Eiffel en construction et les 56 000 becs de gaz parisiens.",
    longDescription: "Paris, 1889. Le monde entier converge vers le Champ-de-Mars pour l'Exposition Universelle. Entre les structures métalliques audacieuses de la Galerie des Machines et l'élégance de la Belle Époque, découvrez une capitale à l'apogée de son influence.",
    historicalDetails: [
      "Tour Eiffel : Érigée pour l'Expo, culminant à plus de 300m.",
      "Galerie des Machines : Nef métallique monumentale de 420m de long.",
      "Mode : Silhouette en 'S' et chapeaux surdimensionnés.",
      "Lumière : Éclairage par 56 573 becs de gaz parisiens."
    ],
    image: "/paris1889_hero_16_9.png",
    fallback: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?q=80&w=1000&auto=format&fit=crop",
    color: "from-amber-200 to-amber-500",
    icon: <Tower className="w-6 h-6" />,
    price: "18,890 €",
    duration: "4 jours"
  },
  {
    id: 'cretace',
    title: 'Crétacé -65M',
    subtitle: 'L\'Empire des Géants',
    description: "Explorez un monde sauvage sans glace. Rencontrez le T-Rex et les titanosaures dans des forêts vierges.",
    longDescription: "Un voyage aux origines de la Terre. Sous un climat tropical humide, parcourez des forêts de conifères géants. Observez la majesté du Tyrannosaurus Rex et la grâce des Tricératops.",
    historicalDetails: [
      "Faune : Tyrannosaurus rex, Velociraptor et Patagotitan.",
      "Flore : Forêts denses d'araucarias, de ginkgos et de fougères.",
      "Climat : Chaud, humide, sans calottes glaciaires aux pôles.",
      "Ciel : Activité volcanique intense et nuits étoilées."
    ],
    image: "/cretace_hero_16_9.png",
    fallback: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop",
    color: "from-green-400 to-emerald-700",
    icon: <Trees className="w-6 h-6" />,
    price: "25,000 €",
    duration: "6 jours"
  },
  {
    id: 'florence-1504',
    title: 'Florence 1504',
    subtitle: 'Le Berceau de la Renaissance',
    description: "Arpentez les rues de la Toscane. Rencontrez Michel-Ange et admirez le dôme de Brunelleschi.",
    longDescription: "Florence, 1504. La cité est en pleine ébullition créative. Du Palazzo Vecchio à la coupole de Santa Maria del Fiore, découvrez le génie de Michel-Ange et Léonard de Vinci.",
    historicalDetails: [
      "Architecture : Dôme de Brunelleschi et Bibliothèque Laurentienne.",
      "Art : Utilisation de pigments rares comme l'ultramarine.",
      "Mode : Robes en soie brodée et velours luxueux.",
      "Esprit : Naissance de l'humanisme moderne."
    ],
    image: "/florence1504_hero_16_9.png",
    fallback: "https://images.unsplash.com/photo-1534445161038-038234676527?q=80&w=1000&auto=format&fit=crop",
    color: "from-red-400 to-rose-700",
    icon: <Palette className="w-6 h-6" />,
    price: "15,040 €",
    duration: "5 jours"
  }
];

// --- COMPOSANTS UI ---

const SafeImage = ({ src, fallback, alt, className, layoutId }) => {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <motion.img 
      layoutId={layoutId}
      src={imgSrc} 
      onError={() => setImgSrc(fallback)}
      alt={alt}
      className={className}
    />
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', type="button" }) => {
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-black font-black shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    outline: 'border border-amber-500/50 hover:border-amber-500 text-amber-500 bg-amber-500/5',
    ghost: 'hover:bg-white/5 text-zinc-400 hover:text-white',
    highlight: 'border-2 border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.3)] backdrop-blur-xl hover:bg-amber-500/20'
  };
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      className={`px-8 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-xs uppercase tracking-widest ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

const SectionTitle = ({ children, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-16"
  >
    <h2 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter uppercase">{children}</h2>
    <div className="flex items-center gap-4">
      <div className="h-px w-12 bg-amber-500" />
      <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px] font-black">{subtitle}</p>
    </div>
  </motion.div>
);

const MagneticButton = ({ children, onClick, variant = 'primary', className = '' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const variants = {
    primary: 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    outline: 'border border-amber-500/50 text-amber-500 bg-amber-500/5 backdrop-blur-md',
    ghost: 'text-zinc-400 hover:text-white hover:bg-white/5',
    highlight: 'border-2 border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.3)] backdrop-blur-xl hover:bg-amber-500/20'
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onClick={onClick}
      className={`relative px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 overflow-hidden ${variants[variant]} ${className}`}
    >
      {variant === 'highlight' && (
        <motion.div 
          animate={{ x: [-300, 300] }} 
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" 
        />
      )}
      {children}
    </motion.button>
  );
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-amber-500 z-[100] origin-left" style={{ scaleX }} />;
};

const InteractiveCard = ({ dest, onClick, idx }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.2, duration: 0.8 }}
      whileHover={{ y: -20 }}
      className="group relative h-[700px] rounded-[60px] overflow-hidden cursor-pointer bg-zinc-900 border border-white/5 shadow-2xl"
      onClick={() => onClick(dest)}
    >
      <SafeImage 
        src={dest.image} 
        fallback={dest.fallback} 
        alt={dest.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
      <div className="absolute inset-0 border-[20px] border-transparent group-hover:border-amber-500/10 transition-all duration-700 rounded-[60px]" />
      
      <div className="absolute bottom-0 p-12 w-full">
        <motion.div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${dest.color} flex items-center justify-center mb-8 text-white shadow-2xl`}>
          {dest.icon}
        </motion.div>
        <h3 className="text-5xl font-black mb-4 tracking-tighter leading-none uppercase">{dest.title}</h3>
        <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-8">{dest.subtitle}</p>
        
        <div className="flex items-center gap-4 text-white/50 group-hover:text-amber-500 transition-colors">
          <span className="text-[10px] font-black uppercase tracking-widest">Voir l'expédition</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

// --- CHATBOT IA FONCTIONNEL ---
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Bonjour ! Comment puis-je vous aider ?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages, isOpen]);

  const callGemini = async (text) => {
    setIsTyping(true);
    const system = "Tu es l'assistant de TimeTravel Agency. Réponds très brièvement (1 phrase). Réponds en français.";
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `System: ${system}\nUser: ${text}` }] }] })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur.";
    } catch (e) { return "Indisponible."; } finally { setIsTyping(false); }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input; setInput("");
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    const res = await callGemini(msg);
    setMessages(prev => [...prev, { role: 'assistant', content: res }]);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-black/80 border border-white/10 w-[400px] h-[550px] rounded-[40px] shadow-2xl flex flex-col mb-6 overflow-hidden backdrop-blur-3xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900">
              <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white">ASSISTANT IA</span>
              <button onClick={() => setIsOpen(false)}><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[28px] text-sm ${m.role === 'user' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-zinc-300'}`}>{m.content}</div>
                </div>
              ))}
              {isTyping && (
                <div className="text-amber-500 text-xs animate-pulse">
                  Assistant réfléchit...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-8 bg-black/40 flex gap-4">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-white/5 rounded-2xl px-6 py-4 text-sm" placeholder="Question..." />
              <button onClick={handleSend} className="bg-amber-500 p-4 rounded-2xl text-black shadow-lg"><Send className="w-5 h-5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className="bg-amber-500 p-6 rounded-full text-black shadow-lg hover:scale-110 transition-transform"><MessageSquare /></button>
    </div>
  );
};

// --- APPLICATION PRINCIPALE ---

export default function App() {
  const [view, setView] = useState('home');
  const [selectedDest, setSelectedDest] = useState(null);
  const [recommendedId, setRecommendedId] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [activeService, setActiveService] = useState(null);

  const navigateToDest = (dest) => {
    setSelectedDest(dest);
    setView('destination');
    setBookingConfirmed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id, delay = 0) => {
    if (view !== 'home') setView('home');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, delay);
  };

  const serviceInfo = {
    'paradox': { title: 'Assurance Paradoxe', icon: <ShieldAlert />, desc: 'Protection totale contre les boucles temporelles. En cas de paradoxe, notre système vous extrait instantanément vers une timeline refuge.' },
    'alpha': { title: 'Vaisseaux Alpha', icon: <Rocket />, desc: 'La pointe de la technologie spatio-temporelle. Moteurs à courbure chronale certifiés pour des sauts de plus de 100 millions d\'années.' },
    'guide': { title: 'Guide Expert', icon: <UserCheck />, desc: 'Des historiens et ethnologues de classe mondiale vous accompagnent pour garantir une immersion authentique et sécurisée.' }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <ScrollProgress />
      
      <nav className="fixed top-0 w-full z-50 px-8 py-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-4 cursor-pointer bg-black/40 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10" onClick={() => {setView('home'); setRecommendedId(null);}}>
            <Clock className="text-amber-500 w-6 h-6" />
            <span className="text-xl font-black tracking-tighter uppercase">TIMETRAVEL</span>
          </div>
          <div className="hidden lg:flex gap-4 p-2 bg-black/40 backdrop-blur-3xl rounded-full border border-white/10">
            <button onClick={() => setView('home')} className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-all">Univers</button>
            <button onClick={() => scrollToSection('destinations', 100)} className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-amber-500">Expéditions</button>
            <button onClick={() => setView('quiz')} className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-all">Expertise IA</button>
          </div>
          <MagneticButton onClick={() => setView('quiz')} variant="highlight" className="hidden sm:flex py-3 px-8 text-[10px]">Démarrer</MagneticButton>
        </div>
      </nav>

      <main>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Hero Section Cinématique - FOND ORIGINAL RESTAURÉ */}
              <section className="relative h-screen flex items-center justify-center overflow-hidden px-8">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
                  <motion.div 
                    initial={{ scale: 1.1 }} 
                    animate={{ scale: 1 }} 
                    transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
                    className="w-full h-full"
                  >
                    <img src="https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Nébuleuse" />
                  </motion.div>
                </div>
                
                <div className="relative z-20 text-center max-w-6xl">
                  <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <span className="inline-block px-8 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] font-black tracking-[0.8em] mb-12 uppercase">Le Temps est une Illusion</span>
                    <h1 className="text-7xl md:text-[140px] font-black mb-12 tracking-tighter leading-[0.75] uppercase text-white">L'HISTOIRE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 animate-gradient-x">RÉINVENTÉE</span></h1>
                    <div className="flex flex-col sm:flex-row gap-12 justify-center items-center mt-12">
                      <MagneticButton onClick={() => scrollToSection('destinations')}>Explorer</MagneticButton>
                      <MagneticButton onClick={() => setView('quiz')} variant="highlight" className="scale-150 border-amber-400 z-10">Profil Temporel <ChevronRight className="w-4 h-4" /></MagneticButton>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Destinations Gallery */}
              <section id="destinations" className="py-60 px-8 max-w-[1600px] mx-auto">
                <SectionTitle subtitle="03 Expéditions Exclusives">Horizons Temporels</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                  {destinations.map((dest, idx) => (
                    <InteractiveCard key={dest.id} dest={dest} idx={idx} onClick={navigateToDest} />
                  ))}
                </div>
              </section>

              {/* Section Héritage (Comble l'espace vide) */}
              <section className="py-40 bg-zinc-950 relative overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
                  <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <SectionTitle subtitle="Sécurité Alpha">Un Héritage d'Excellence</SectionTitle>
                    <p className="text-zinc-500 text-xl font-light leading-relaxed mb-12">
                      Depuis plus de deux décennies, TimeTravel Agency définit les standards du voyage chronologique de luxe. Nos protocoles de sécurité garantissent une protection absolue contre les altérations historiques.
                    </p>
                    <div className="grid grid-cols-2 gap-12">
                      <div>
                        <h4 className="text-5xl font-black text-amber-500 mb-2">12k+</h4>
                        <p className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Sauts Réussis</p>
                      </div>
                      <div>
                        <h4 className="text-5xl font-black text-amber-500 mb-2">0.0%</h4>
                        <p className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Incident Temporel</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                    <div className="aspect-square rounded-[60px] bg-gradient-to-br from-amber-500/10 to-transparent border border-white/5 flex items-center justify-center">
                      <div className="text-center p-20">
                        <Activity className="w-20 h-20 text-amber-500 mx-auto mb-8 animate-pulse" />
                        <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">Monitoring Chronal</h3>
                        <p className="text-zinc-500 text-sm font-medium">Chaque seconde de votre séjour est surveillée par notre IA centrale pour prévenir toute déviation historique.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          )}

          {view === 'destination' && selectedDest && (
            <motion.div key="dest" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-8 py-40">
              <button onClick={() => setView('home')} className="flex items-center gap-4 text-zinc-500 hover:text-amber-500 mb-24 font-black uppercase text-[10px] tracking-[0.4em] group transition-all"><ChevronLeft className="group-hover:-translate-x-2 transition-transform" /> Retour</button>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
                <div className="relative aspect-[3/4] rounded-[80px] overflow-hidden shadow-2xl group">
                  <SafeImage src={selectedDest.image} fallback={selectedDest.fallback} alt={selectedDest.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-16 left-16 right-16 p-12 bg-black/40 backdrop-blur-3xl rounded-[50px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Tarif de l'Expédition</p>
                        <p className="text-6xl font-black text-amber-500 tracking-tighter">{selectedDest.price}</p>
                      </div>
                      <div className="p-6 bg-amber-500 rounded-3xl text-black shadow-2xl"><Compass className="w-8 h-8" /></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-20 py-10">
                  <div className="space-y-6">
                    <h1 className="text-8xl md:text-[120px] font-black mb-6 tracking-tighter leading-[0.8] uppercase">{selectedDest.title}</h1>
                    <p className="text-3xl text-amber-500/80 font-light italic tracking-tight uppercase">{selectedDest.subtitle}</p>
                  </div>
                  <p className="text-zinc-400 text-2xl leading-relaxed font-light">{selectedDest.longDescription}</p>
                  <div className="space-y-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.8em] text-amber-500">Archives Digitales</h3>
                    <div className="grid gap-6">
                      {selectedDest.historicalDetails.map((detail, i) => (
                        <div key={i} className="flex gap-8 p-8 bg-zinc-900/40 rounded-[40px] border border-white/5 text-lg text-zinc-400 font-light leading-relaxed hover:bg-zinc-900/60 transition-all">
                          <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8 pt-20">
                    <Button className="flex-1 py-8 text-2xl" onClick={() => {setIsBooking(true); setBookingConfirmed(false);}}>Réclamer mon Passage</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex items-center justify-center bg-black px-8">
               {recommendedId ? (
                <div className="text-center max-w-4xl bg-zinc-900/20 p-20 rounded-[80px] border border-amber-500/20 backdrop-blur-3xl shadow-2xl">
                  <div className="bg-amber-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-12 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                    <CheckCircle2 className="text-black w-12 h-12" />
                  </div>
                  <h2 className="text-6xl font-black mb-6 tracking-tighter uppercase leading-none">RÉSONANCE ÉTABLIE</h2>
                  <div className="flex flex-col md:flex-row items-center gap-12 p-10 bg-black/60 rounded-[50px] mb-16 border border-white/5 text-left">
                    <SafeImage src={destinations.find(d => d.id === recommendedId).image} fallback={destinations.find(d => d.id === recommendedId).fallback} className="w-56 h-56 rounded-[40px] object-cover shadow-2xl" />
                    <div className="flex-1">
                      <h4 className="text-5xl font-black mb-2 tracking-tighter uppercase">{destinations.find(d => d.id === recommendedId).title}</h4>
                      <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-8">{destinations.find(d => d.id === recommendedId).subtitle}</p>
                      <Button onClick={() => navigateToDest(destinations.find(d => d.id === recommendedId))}>Accéder à l'Histoire</Button>
                    </div>
                  </div>
                  <button onClick={() => setRecommendedId(null)} className="text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-[0.5em]">Recommencer</button>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto p-12 bg-zinc-900/80 border border-white/10 rounded-[50px] backdrop-blur-3xl shadow-2xl text-center">
                   <h3 className="text-4xl font-black uppercase tracking-tighter mb-10 text-amber-500">Profil Voyageur</h3>
                   <div className="grid gap-4">
                     {[
                       { text: "L'odeur du fer et du gaz (Paris)", value: "paris-1889" },
                       { text: "L'humidité d'une forêt vierge (Crétacé)", value: "cretace" },
                       { text: "Le toucher du velours précieux (Florence)", value: "florence-1504" }
                     ].map((opt, i) => (
                       <motion.button key={i} whileHover={{ x: 10, backgroundColor: "rgba(245,158,11,0.1)" }} onClick={() => setRecommendedId(opt.value)} className="p-6 text-left rounded-2xl border border-white/5 bg-white/5 transition-all flex justify-between items-center group">
                         <span className="font-bold text-sm tracking-tight">{opt.text}</span>
                         <ChevronRight className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </motion.button>
                     ))}
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL RÉSERVATION */}
      <AnimatePresence>
        {isBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsBooking(false)} />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-zinc-900/80 w-full max-w-4xl rounded-[80px] border border-white/10 overflow-hidden shadow-[0_0_200px_rgba(0,0,0,1)] flex flex-col md:flex-row backdrop-blur-3xl">
              <div className="w-full md:w-1/2 relative h-64 md:h-auto">
                <SafeImage src={selectedDest?.image} fallback={selectedDest?.fallback} alt={selectedDest?.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/90 hidden md:block" />
              </div>
              <div className="p-12 md:p-20 flex-1 text-center md:text-left flex flex-col justify-center">
                {!bookingConfirmed ? (
                  <>
                    <div className="bg-amber-500 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto md:mx-0 mb-10 shadow-[0_20px_50px_rgba(245,158,11,0.4)]"><Fingerprint className="text-black w-10 h-10" /></div>
                    <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase leading-none text-white">AUTHENTIFICATION</h3>
                    <p className="text-zinc-500 mb-12 font-light text-lg">Confirmez votre empreinte pour initialiser le saut vers <span className="text-amber-500 font-black">{selectedDest?.title}</span>.</p>
                    <div className="space-y-6">
                      <Button className="w-full py-6 text-xl" onClick={() => setBookingConfirmed(true)}>Confirmer l'empreinte</Button>
                      <button onClick={() => setIsBooking(false)} className="text-zinc-700 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.5em]">Annuler l'Expédition</button>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-10 shadow-[0_0_50px_rgba(34,197,94,0.3)]"><CheckCircle2 className="text-black w-10 h-10" /></motion.div>
                    <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase leading-none text-white">VOYAGE CONFIRMÉ</h3>
                    <p className="text-zinc-400 mb-12 font-light text-lg">Votre passage vers <span className="text-amber-500 font-black">{selectedDest?.title}</span> a été validé. Préparez-vous pour le saut temporel.</p>
                    <Button className="w-full py-6 text-xl" onClick={() => setIsBooking(false)}>Terminer</Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SERVICES INFORMATION */}
      <AnimatePresence>
        {activeService && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setActiveService(null)} />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-zinc-900 border border-white/10 p-16 rounded-[60px] max-w-xl text-center backdrop-blur-3xl shadow-2xl">
              <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-8">
                {serviceInfo[activeService].icon}
              </div>
              <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">{serviceInfo[activeService].title}</h3>
              <p className="text-zinc-400 text-lg leading-relaxed mb-12 font-light">{serviceInfo[activeService].desc}</p>
              <Button className="w-full" onClick={() => setActiveService(null)}>Fermer</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PIED DE PAGE INTERACTIF */}
      <footer className="mt-40 bg-zinc-950 border-t border-white/5 px-8 py-40">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <Clock className="text-amber-500 w-8 h-8" />
              <span className="text-3xl font-black tracking-tighter uppercase">TIMETRAVEL</span>
            </div>
            <p className="text-zinc-600 text-lg leading-relaxed">Redéfinir le futur en explorant le passé.</p>
            <div className="flex gap-6">
              <Instagram className="text-zinc-700 hover:text-amber-500 transition-colors cursor-pointer" />
              <Twitter className="text-zinc-700 hover:text-amber-500 transition-colors cursor-pointer" />
              <Linkedin className="text-zinc-700 hover:text-amber-500 transition-colors cursor-pointer" />
            </div>
          </div>
          
          <div className="space-y-8">
             <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Expéditions</h4>
             <ul className="space-y-4 text-sm font-bold uppercase text-zinc-500">
               {destinations.map(d => (
                 <li key={d.id} onClick={() => navigateToDest(d)} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                   <ChevronRight className="w-3 h-3 text-amber-500" /> {d.title}
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="space-y-8">
             <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Expertise</h4>
             <ul className="space-y-4 text-sm font-bold uppercase text-zinc-500">
               <li onClick={() => setActiveService('paradox')} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                 <ShieldAlert className="w-3 h-3 text-amber-500" /> Assurance Paradoxe
               </li>
               <li onClick={() => setActiveService('alpha')} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                 <Rocket className="w-3 h-3 text-amber-500" /> Vaisseaux Alpha
               </li>
               <li onClick={() => setActiveService('guide')} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                 <UserCheck className="w-3 h-3 text-amber-500" /> Guides Experts
               </li>
             </ul>
          </div>
          
          <div className="space-y-8 text-right lg:text-left">
             <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Contact</h4>
             <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
               Secteur Alpha-1 <br /> 75007 Paris, Présent <br /><br />
               <span className="text-zinc-800">Support Temporel 24/7</span>
             </p>
          </div>
        </div>
      </footer>

      <ChatBot />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 15s ease infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}