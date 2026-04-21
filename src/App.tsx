import React, { useState, useEffect } from 'react';
import { Activity, Play, Square, Accessibility, Footprints, Clock, Droplets, Plus, Home, Calendar, User, ChevronLeft, BarChart3, Mail, Lock, UserPlus, LogOut, Settings, Award, Info, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AlertType = 'none' | 'soft' | 'active' | 'water';
type TabType = 'home' | 'stats' | 'water' | 'account';
type AppStatus = 'welcome' | 'dashboard';

// Dynamic Color Palette from provided image
const COLORS = {
  bg: '#E2F0BD', // Pale Green
  primary: '#8DB654', // Medium Green
  yellow: '#FBE577', // Yellow
  amber: '#FFBA18', // Amber/Orange
  rust: '#DB5B23', // Deep Orange
  dark: '#1A1A1A',
};

export default function App() {
  const [appStatus, setAppStatus] = useState<AppStatus>('welcome');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('20');
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [activeAlert, setActiveAlert] = useState<AlertType>('none');
  const [waterToday, setWaterToday] = useState(5);
  const [showWaterInfo, setShowWaterInfo] = useState(false);

  // Mock user data
  const [user] = useState({
    name: 'George',
    email: 'george.wellness@example.com',
    avatar: 'https://picsum.photos/seed/george/200',
    streak: 5,
    rank: 'Wellness Ninja'
  });

  // Mock stats
  const [stats] = useState({
    weeklyProgress: 8.8,
    activeBreaks: 12,
    activities: 8,
    waterWeek: 32,
    waterMonth: 124
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && activeAlert === 'none') {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            setIsActive(false);
            return 0;
          }
          const newTime = prev - 1;
          const elapsed = totalTime - newTime;
          
          if (newTime <= 0) {
            setIsActive(false);
            if (totalTime < 1200) {
              setActiveAlert('soft');
            }
            return 0;
          }

          if (elapsed > 0) {
            if (elapsed % 3600 === 0) {
              setActiveAlert('active');
            } else if (elapsed % 1200 === 0) {
              setActiveAlert('water');
            }
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, totalTime, activeAlert]);

  const handleStart = () => {
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    const secs = (h * 3600) + (m * 60);
    if (secs <= 0) return;
    setTotalTime(secs);
    setTimeRemaining(secs);
    setIsActive(true);
    setActiveAlert('none');
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeRemaining(0);
    setActiveAlert('none');
  };

  const handleManualBreak = () => {
    setActiveAlert('active');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setAppStatus('dashboard');
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderWelcome = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-[#1A1A1A] text-white relative overflow-hidden"
    >
      {/* Playful Blob Character (Inspired by Image 1) */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#8DB654] rounded-full flex items-center justify-center"
      >
        <div className="relative w-full h-full">
           <div className="absolute top-[40%] left-[30%] w-4 h-4 bg-black rounded-full shadow-[60px_0_0_0_black]"></div>
           <motion.div 
             animate={{ scaleY: [1, 0.5, 1] }}
             transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
             className="absolute top-[55%] left-[45%] w-8 h-4 border-b-4 border-black rounded-full"
           ></motion.div>
        </div>
      </motion.div>

      <div className="z-10 w-full max-w-md">
        <motion.div
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold leading-none mb-4 lowercase tracking-tight font-title">
            pure<br />
            <span className="text-[#8DB654]">pause</span>
          </h1>
          <p className="text-xl font-medium text-slate-400 mb-12 font-body">
            "Cuida tu tiempo, cuida tu cuerpo"
          </p>

          <div className="space-y-4">
             <button 
               onClick={handleLogin}
               className="w-full bg-[#8DB654] hover:bg-[#7a9d4a] text-black font-black py-6 rounded-3xl text-xl transition-all active:scale-95 flex items-center justify-center gap-3"
             >
               INICIAR SESIÓN
             </button>
             <button 
               className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-6 rounded-3xl text-xl transition-all active:scale-95"
             >
               CREAR CUENTA
             </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 bg-white rounded-[40px] text-black flex items-center gap-4"
        >
          <div className="text-sm font-bold">¡SE SIENTE MEJOR JUNTOS!</div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderHome = () => (
    <AnimatePresence mode="wait">
      {!isActive && timeRemaining === 0 ? (
        <motion.div 
          key="setup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full"
        >
          <h1 className="text-4xl font-bold mb-2 font-title">¡Hola, {user.name}!</h1>
          <p className="text-slate-500 mb-8 font-body">Empieza tu día con agua, ¡te dará energía!</p>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
            {/* Animated character blob in corner */}
            <motion.div 
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#FBE577] rounded-3xl flex items-center justify-center opacity-50"
            >
              <div className="w-1 h-1 bg-black rounded-full shadow-[10px_0_0_0_black]"></div>
            </motion.div>

            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-[#E2F0BD] rounded-2xl flex items-center justify-center mb-4">
                <Clock className="text-[#8DB654]" size={32} />
              </div>
              <h2 className="text-xl font-bold">Duración de la tarea</h2>
            </div>

            <div className="flex gap-4 mb-8">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Horas</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full text-center text-2xl font-bold bg-[#F8F9FA] rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-[#8DB654]/20"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Minutos</label>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full text-center text-2xl font-bold bg-[#F8F9FA] rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-[#8DB654]/20"
                  min="0"
                  max="59"
                />
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-[#8DB654] text-white font-bold rounded-full py-5 text-lg shadow-lg shadow-[#8DB654]/20 active:scale-95 transition-transform"
            >
              Iniciar sesión
            </button>
          </div>

          <div className="bg-[#E1F5FE] rounded-[32px] p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#039BE5]">
              <Droplets size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#039BE5] uppercase tracking-wider mb-1 font-body">Hidratación</p>
              <p className="text-sm font-medium text-slate-800 font-body">Has bebido {waterToday} vasos hoy. ¡Sigue así!</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="timer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full flex flex-col items-center"
        >
          <div className="relative w-80 h-80 flex items-center justify-center mb-12">
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M 50,10 A 40,40 0 0,1 85,30" fill="none" stroke="#FBE577" strokeWidth="8" strokeLinecap="round" />
                <path d="M 90,50 A 40,40 0 0,1 70,85" fill="none" stroke="#8DB654" strokeWidth="8" strokeLinecap="round" />
                <path d="M 50,90 A 40,40 0 0,1 15,70" fill="none" stroke="#FFBA18" strokeWidth="8" strokeLinecap="round" />
                <path d="M 10,50 A 40,40 0 0,1 30,15" fill="none" stroke="#DB5B23" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FBE577] rounded-full flex items-center justify-center shadow-sm">
              <Droplets size={14} className="text-[#DB5B23]" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#8DB654] rounded-full flex items-center justify-center shadow-sm">
              <Accessibility size={14} className="text-white" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FFBA18] rounded-full flex items-center justify-center shadow-sm">
              <Footprints size={14} className="text-white" />
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#DB5B23] rounded-full flex items-center justify-center shadow-sm">
              <Activity size={14} className="text-white" />
            </div>

            <div className="flex flex-col items-center z-10">
              <span className="text-7xl font-bold tracking-tighter mb-1">{formatTime(timeRemaining)}</span>
              <p className="text-slate-400 font-medium text-sm">tiempo restante</p>
            </div>
          </div>

          <button
            onClick={handleStop}
            className="w-full max-w-xs bg-[#DB5B23] text-white font-bold rounded-full py-5 shadow-lg active:scale-95 transition-transform"
          >
            Detener
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderStats = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full font-body"
    >
      <h1 className="text-4xl font-bold mb-2 font-title">Estadísticas</h1>
      <p className="text-slate-500 mb-8">Tu progreso de la semana</p>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 mb-6 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-7xl font-bold mb-2">{stats.weeklyProgress}</div>
          <p className="text-slate-400 font-medium">tu health score semanal</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBE577]/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#DB5B23]/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#E2F0BD] rounded-[32px] p-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8DB654] mb-4">
            <Accessibility size={20} />
          </div>
          <div className="text-3xl font-bold">{stats.activeBreaks}</div>
          <p className="text-xs font-bold text-[#8DB654] uppercase tracking-wider">Pausas Activas</p>
        </div>
        <div className="bg-[#FFBA18]/20 rounded-[32px] p-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#DB5B23] mb-4">
            <Footprints size={20} />
          </div>
          <div className="text-3xl font-bold">{stats.activities}</div>
          <p className="text-xs font-bold text-[#DB5B23] uppercase tracking-wider">Actividades</p>
        </div>
      </div>

    </motion.div>
  );

  const renderWater = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full font-body"
    >
      <h1 className="text-4xl font-bold mb-2 font-title">Hidratación</h1>
      <p className="text-slate-500 mb-8">Seguimiento de consumo de agua</p>

      <div className="bg-[#E2F0BD]/30 rounded-[40px] p-8 mb-6 flex flex-col items-center border border-[#8DB654]/10 relative font-body">
        <button 
          onClick={() => setShowWaterInfo(!showWaterInfo)}
          className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-[#8DB654] transition-colors border"
        >
          <Info size={18} />
        </button>

        <AnimatePresence>
          {showWaterInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-16 left-6 right-6 bg-white p-4 rounded-2xl shadow-xl z-20 border text-xs leading-relaxed text-slate-600"
            >
              En promedio, un adulto saludable debe tomar entre 8 y 10 vasos de agua al día (aprox. 2-2.5 litros) para mantener sus funciones vitales óptimas.
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
           animate={{ 
             y: [0, -10, 0],
             rotate: [0, 5, -5, 0]
           }}
           transition={{ duration: 4, repeat: Infinity }}
           className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-[#039BE5] mb-6 shadow-sm ring-4 ring-white/50"
        >
          <Droplets size={48} />
        </motion.div>
        
        <div className="flex items-center gap-6 mb-2">
          <button 
            onClick={() => setWaterToday(Math.max(0, waterToday - 1))}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform text-[#DB5B23]"
          >
            <Minus size={24} />
          </button>
          <div className="text-5xl font-bold">{waterToday}</div>
          <button 
            onClick={() => setWaterToday(waterToday + 1)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform text-[#8DB654]"
          >
            <Plus size={24} />
          </button>
        </div>
        <p className="text-[#8DB654] font-bold uppercase tracking-widest text-xs">Vasos hoy</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 flex justify-between items-center transition-all hover:border-[#8DB654]/30">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Esta semana</p>
            <p className="text-2xl font-bold">{stats.waterWeek} vasos</p>
          </div>
          <div className="w-12 h-12 bg-[#E2F0BD] rounded-2xl flex items-center justify-center text-[#8DB654]">
            <BarChart3 size={24} />
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 flex justify-between items-center transition-all hover:border-[#FBE577]/60">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Este mes</p>
            <p className="text-2xl font-bold">{stats.waterMonth} vasos</p>
          </div>
          <div className="w-12 h-12 bg-[#FBE577] rounded-2xl flex items-center justify-center text-[#DB5B23]">
            <Calendar size={24} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAccount = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full font-body"
    >
      <h1 className="text-4xl font-bold mb-2 font-title">Mi Perfil</h1>
      <p className="text-slate-500 mb-8">Información de tu bienestar</p>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-[28px] object-cover ring-4 ring-[#E2F0BD]" aria-hidden="true" />
              <div className="absolute -bottom-1 -right-1 bg-[#8DB654] text-white p-1.5 rounded-lg border-2 border-white">
                < Award size={14} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-sm text-slate-400 font-medium">{user.rank}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 rounded-2xl border">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Racha</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{user.streak} días</span>
                </div>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Puntos</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">1240</span>
                </div>
             </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-[40px] p-4 shadow-sm border border-slate-100 divide-y divide-slate-50">
           <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-3">
                 <Settings size={20} className="text-slate-400" />
                 <span className="font-bold">Configuración</span>
              </div>
              <ChevronLeft size={18} className="rotate-180 text-slate-300" />
           </button>
           <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-3">
                 <Mail size={20} className="text-slate-400" />
                 <span className="font-bold">Notificaciones</span>
              </div>
              <ChevronLeft size={18} className="rotate-180 text-slate-300" />
           </button>
           <button 
              onClick={() => {
                setIsLoggedIn(false);
                setAppStatus('welcome');
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-rose-50 text-rose-500 rounded-2xl transition-colors mt-2"
           >
              <div className="flex items-center gap-3">
                 <LogOut size={20} />
                 <span className="font-bold">Cerrar sesión</span>
              </div>
           </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${appStatus === 'dashboard' ? 'bg-[#FDF9ED]' : 'bg-[#1A1A1A]'} transition-colors duration-500 font-body`}>
      <AnimatePresence mode="wait">
        {appStatus === 'welcome' ? (
          <motion.div key="landing">
             {renderWelcome()}
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center pb-32 pt-6 px-6"
          >
            {/* Top Bar */}
            <div className="w-full max-w-md flex justify-between items-center mb-8">
              <button 
                onClick={() => setCurrentTab('home')}
                className="w-10 h-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center bg-white shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-1.5 p-1.5 bg-white/50 backdrop-blur rounded-full shadow-inner border">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'home' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'stats' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'water' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'account' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md flex-1 flex flex-col items-center">
              {currentTab === 'home' && renderHome()}
              {currentTab === 'stats' && renderStats()}
              {currentTab === 'water' && renderWater()}
              {currentTab === 'account' && renderAccount()}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-50">
              <div className="bg-[#1A1A1A] rounded-full h-20 flex items-center justify-around px-4 relative shadow-2xl">
                <button 
                  onClick={() => setCurrentTab('home')}
                  className={`transition-all duration-300 ${currentTab === 'home' ? 'text-[#8DB654] scale-110' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Home size={24} />
                </button>
                <button 
                  onClick={() => setCurrentTab('stats')}
                  className={`transition-all duration-300 ${currentTab === 'stats' ? 'text-[#8DB654] scale-110' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Calendar size={24} />
                </button>
                
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <button 
                    onClick={handleManualBreak}
                    className="w-16 h-16 bg-[#FBE577] hover:bg-[#f6da4d] rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-90 transition-transform border-4 border-[#1A1A1A]"
                  >
                    <Plus size={28} className="text-slate-800" />
                  </button>
                </div>

                <div className="w-12"></div>

                <button 
                  onClick={() => setCurrentTab('water')}
                  className={`transition-all duration-300 ${currentTab === 'water' ? 'text-[#8DB654] scale-110' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Droplets size={24} />
                </button>
                <button 
                  onClick={() => setCurrentTab('account')}
                  className={`transition-all duration-300 ${currentTab === 'account' ? 'text-[#8DB654] scale-110' : 'text-white/40 hover:text-white/60'}`}
                >
                  <User size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeAlert !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="bg-white rounded-[48px] p-10 max-w-sm w-full text-center shadow-2xl border border-white/20"
            >
              {activeAlert === 'soft' && (
                <>
                  <div className="mx-auto w-24 h-24 bg-[#E2F0BD] rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                    <Accessibility size={48} className="text-[#8DB654]" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Pausa Suave</h2>
                  <p className="text-slate-500 mb-10 leading-relaxed">
                    Estira los brazos y rota los hombros durante 30 segundos. ¡Relaja la tensión!
                  </p>
                  <button
                    onClick={() => setActiveAlert('none')}
                    className="w-full bg-[#1A1A1A] text-white font-bold rounded-full py-5 text-lg shadow-lg active:scale-95 transition-transform"
                  >
                    Continuar
                  </button>
                </>
              )}
              {activeAlert === 'active' && (
                <>
                  <div className="mx-auto w-24 h-24 bg-[#F48FB1] rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                    <Footprints size={48} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Pausa Activa</h2>
                  <p className="text-slate-500 mb-10 leading-relaxed">
                    Levántate, camina un poco o estira las piernas por 2 minutos. ¡Activa tu circulación!
                  </p>
                  <button
                    onClick={() => setActiveAlert('none')}
                    className="w-full bg-[#1A1A1A] text-white font-bold rounded-full py-5 text-lg shadow-lg active:scale-95 transition-transform"
                  >
                    Hecho
                  </button>
                </>
              )}
              {activeAlert === 'water' && (
                <>
                  <div className="mx-auto w-24 h-24 bg-[#E1F5FE] rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                    <Droplets size={48} className="text-[#039BE5]" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-[#039BE5]">¡Hidrátate!</h2>
                  <p className="text-slate-500 mb-10 leading-relaxed">
                    Es momento de tomar un vaso de agua. Mantenerte hidratado mejora tu concentración y salud.
                  </p>
                  <button
                    onClick={() => setActiveAlert('none')}
                    className="w-full bg-[#039BE5] text-white font-bold rounded-full py-5 text-lg shadow-lg active:scale-95 transition-transform"
                  >
                    Entendido
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
