import React, { useState, useEffect } from 'react';
import { Activity, Play, Square, Accessibility, PersonStanding, Footprints, Clock, Droplets, Home, Calendar, User, ChevronLeft, BarChart3, Mail, Lock, UserPlus, LogOut, Settings, Award, Info, Minus, Plus, Hand, X, Cat, Coins, Store, HelpCircle, Eye, Wind, RefreshCw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from './useAuth';

type AlertType = 'none' | 'soft' | 'active' | 'water';
type TabType = 'home' | 'stats' | 'water' | 'account' | 'store';
type AppStatus = 'welcome' | 'onboarding' | 'dashboard';

// Dynamic Color Palette from provided image
const COLORS = {
  bg: '#FFFEF9',
  green: '#BAD66C',
  yellow: '#FDE278',
  dark: '#353A26',
  nav: '#2C311D',
  accent: '#FBBC36',
};

const BREAK_ACTIVITIES = [
  { icon: Footprints, title: 'Caminata corta', desc: 'Levántate y camina un poco o estira las piernas por 2 minutos. ¡Activa tu circulación!' },
  { icon: Accessibility, title: 'Estiramiento de brazos', desc: 'Estira tus brazos hacia arriba y a los lados suavemente para relajar los hombros y la espalda.' },
  { icon: RefreshCw, title: 'Rotación de cuello', desc: 'Gira suavemente tu cuello en círculos, primero hacia la derecha y luego a la izquierda por 1 minuto.' },
  { icon: Wind, title: 'Respiración profunda', desc: 'Inhala por la nariz 4 segundos, sostén 4 segundos y exhala por la boca 6 segundos.' },
  { icon: Eye, title: 'Ejercicios visuales', desc: 'Mira a un objeto lejano por 20 segundos y luego parpadea varias veces para descansar tus ojos.' }
];

const DEFAULT_OFFSETS = {
  dragon_hat: { top: -12, left: 50, scale: 2 },
  be_mine_shirt: { top: 48, left: 50, scale: 1 },
  heart_mug: { top: 40, left: 90, scale: 1 },
  anubis_mask: { top: 10, left: 50, scale: 1.5 },
  striped_shirt: { top: 48, left: 50, scale: 1 },
  polka_shirt: { top: 48, left: 50, scale: 1 },
  shorts: { top: 80, left: 50, scale: 1 },
  derby_hat: { top: -12, left: 50, scale: 1.5 },
  sunglasses: { top: 28, left: 50, scale: 1 },
  pharaoh: { top: -10, left: 50, scale: 1.5 }
};

export default function App() {
  const [appStatus, setAppStatus] = useState<AppStatus>('welcome');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [breakActivityIndex, setBreakActivityIndex] = useState(0);
  const [availableBreaks, setAvailableBreaks] = useState<number[]>([0, 1, 2, 3, 4]);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('20');
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [activeAlert, setActiveAlert] = useState<AlertType>('none');
  const [sessionCompleteData, setSessionCompleteData] = useState<{points: number} | null>(null);
  const [waterToday, setWaterToday] = useState(5);
  const [streak, setStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState('');
  const [showWaterInfo, setShowWaterInfo] = useState(false);
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [waterPointsMessage, setWaterPointsMessage] = useState<{title: string, message: string, points: number} | null>(null);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [pendingWater, setPendingWater] = useState(0);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [calcResult, setCalcResult] = useState<{ liters: number; glasses: number } | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [localOffsets, setLocalOffsets] = useState<Record<string, { top: number, left: number, scale: number }>>({});
  
  const { user: authUser, userData, loading, signInWithGoogle, signOut, updateUserData } = useAuth();
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from Firebase on start
  useEffect(() => {
    if (!loading && authUser && userData && !hasLoaded) {
      setAppStatus(userData.appStatus === 'welcome' ? 'onboarding' : userData.appStatus);
      setPoints(userData.pet_points);
      setEquippedAccessory(userData.pet_equipped);
      setPurchasedAccessories(userData.pet_purchased);
      setStats({
        activeBreaks: userData.stats.activeBreaks || 0,
        activities: userData.stats.activities || 0,
        sessionsThisWeek: userData.stats.sessionsThisWeek || 0,
        waterWeek: userData.stats.waterWeek || 0,
        waterMonth: userData.stats.waterMonth || 0,
        dailyActivity: userData.stats.dailyActivity || [0, 0, 0, 0, 0, 0, 0]
      });
      setWaterToday(userData.stats.waterToday || 0);
      setStreak(userData.streak || 0);
      setLastActivityDate(userData.lastActivityDate || '');
      setLocalOffsets(userData.accessoryOffsets || {});
      setUser(prev => ({
        ...prev,
        name: userData.name,
        email: authUser.email || '',
        avatar: authUser.photoURL || '',
        streak: userData.streak || 0
      }));
      setHasLoaded(true);
    } else if (!loading && !authUser) {
      setAppStatus('welcome');
      setHasLoaded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, authUser, userData, hasLoaded]);

  const [points, setPoints] = useState(150);
  const [equippedAccessory, setEquippedAccessory] = useState('');
  const [purchasedAccessories, setPurchasedAccessories] = useState<string[]>([]);
  const [confirmPurchase, setConfirmPurchase] = useState<{id: string, name: string, price: number} | null>(null);

  // Sync to Firebase
  useEffect(() => {
    if (authUser) {
      updateUserData({ pet_points: points });
    }
  }, [points]);

  useEffect(() => {
    if (authUser) {
      updateUserData({ pet_equipped: equippedAccessory });
    }
  }, [equippedAccessory]);

  useEffect(() => {
    if (authUser) {
      updateUserData({ pet_purchased: purchasedAccessories });
    }
  }, [purchasedAccessories]);

  useEffect(() => {
    if (authUser) {
      updateUserData({ appStatus });
    }
  }, [appStatus]);

  useEffect(() => {
    if (authUser) {
      updateUserData({ streak });
      setUser(prev => ({ ...prev, streak }));
    }
  }, [streak]);

  useEffect(() => {
    if (authUser) {
      updateUserData({ lastActivityDate });
    }
  }, [lastActivityDate]);

  // Streak logic helper
  const triggerStreakUpdate = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastActivityDate === today) return;

    const lastDateObj = lastActivityDate ? new Date(lastActivityDate + 'T00:00:00') : null;
    const todayObj = new Date(today + 'T00:00:00');

    let newStreak = 1;
    if (lastDateObj) {
      const diffTime = todayObj.getTime() - lastDateObj.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = streak + 1;
      } else if (diffDays === 0) {
        return; // Already updated today
      }
    }

    setStreak(newStreak);
    setLastActivityDate(today);
  };

  // Check for streak reset/update on app entry
  useEffect(() => {
    if (hasLoaded && authUser) {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = lastActivityDate;
      
      if (lastDate && lastDate !== today) {
        // Reset daily indicators since a new day has started
        setWaterToday(0);

        const lastDateObj = new Date(lastDate + 'T00:00:00');
        const todayObj = new Date(today + 'T00:00:00');
        const diffTime = todayObj.getTime() - lastDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          setStreak(0); // Reset if missed more than 1 day
          // Note: triggerStreakUpdate will set it to 1 when an action happens or right now if we want "login" to count.
          // The user said "Entra a la aplicación" counts as an action.
        }
      }
      
      // Auto-trigger on entry as per "Entra a la aplicación"
      triggerStreakUpdate();
    }
  }, [hasLoaded]);

  // Mock user data
  const [user, setUser] = useState({
    name: 'George',
    email: 'george.wellness@example.com',
    avatar: 'https://picsum.photos/seed/george/200',
    streak: 0,
    rank: 'Semilla'
  });

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tempIsDarkMode, setTempIsDarkMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const getRank = (activities: number) => {
    if (activities <= 3) return 'Semilla';
    if (activities <= 10) return 'Brote';
    if (activities <= 20) return 'Germinando';
    if (activities <= 35) return 'Tallo Firme';
    if (activities <= 50) return 'Capullo';
    return 'Floración';
  };

  // State for user statistics
  const [stats, setStats] = useState({
    activeBreaks: 0,
    activities: 0,
    sessionsThisWeek: 0,
    waterWeek: 0,
    waterMonth: 0,
    dailyActivity: [0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    if (authUser) {
      updateUserData({ stats: { ...stats, waterToday } });
    }
  }, [stats, waterToday]);

  // Calculate Health Score (0-10)
  const healthScore = React.useMemo(() => {
    // 1. Sessions: Goal 10/week (50% weight -> max 5 pts)
    const sessionScore = Math.min(5, (stats.sessionsThisWeek / 10) * 5);
    
    // 2. Water: Goal 40/week (30% weight -> max 3 pts)
    const waterScore = Math.min(3, (stats.waterWeek / 40) * 3);
    
    // 3. Active Breaks: Goal 14/week (20% weight -> max 2 pts)
    const breakScore = Math.min(2, (stats.activeBreaks / 14) * 2);
    
    return Math.round(sessionScore + waterScore + breakScore);
  }, [stats]);

  const consistencyPercentage = React.useMemo(() => {
    const sessionScore = (stats.sessionsThisWeek / 10) * 5;
    const waterScore = (stats.waterWeek / 40) * 3;
    const breakScore = (stats.activeBreaks / 14) * 2;
    const total = sessionScore + waterScore + breakScore;
    return Math.min(100, Math.round((total / 10) * 100));
  }, [stats]);

  const daysLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  const activityData = daysLabels.map((day, idx) => ({
    day,
    hours: stats.dailyActivity[idx] || 0
  }));

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
            
            setStats(prev => {
              const dayOfWeek = (new Date().getDay() + 6) % 7; // Lun=0, Dom=6
              const newDailyActivity = [...(prev.dailyActivity || [0,0,0,0,0,0,0])];
              const addedHours = totalTime / 3600;
              newDailyActivity[dayOfWeek] = Number((newDailyActivity[dayOfWeek] + addedHours).toFixed(2));
              
              return {
                ...prev,
                sessionsThisWeek: prev.sessionsThisWeek + 1,
                activities: prev.activities + 1,
                dailyActivity: newDailyActivity
              };
            });
            
            // Add points based on session length
            const minutesCompleted = Math.floor(totalTime / 60);
            const pointsEarned = Math.min(150, (minutesCompleted * 2) + 15);
            setPoints(p => p + pointsEarned);
            setSessionCompleteData({ points: pointsEarned });
            triggerStreakUpdate();

            return 0;
          }

          if (elapsed > 0) {
            const totalMins = totalTime / 60;
            
            let triggerWater = false;
            if (totalMins < 45) {
              if (elapsed === Math.floor(totalTime / 2)) triggerWater = true;
            } else {
              if (elapsed % (30 * 60) === 0) triggerWater = true;
            }

            let triggerActive = false;
            if (Math.round(totalMins) < 30) {
              triggerActive = false;
            } else if (Math.round(totalMins) === 30) {
              if (elapsed === 18 * 60) triggerActive = true;
            } else {
              if (elapsed % (45 * 60) === 0) triggerActive = true;
            }

            if (triggerWater) {
              setActiveAlert('water');
            } else if (triggerActive) {
              setActiveAlert('active');
            } else {
              let missedActive = false;
              const prevElapsed = elapsed - 1;
              if (Math.round(totalMins) === 30 && prevElapsed === 18 * 60) missedActive = true;
              if (Math.round(totalMins) > 30 && prevElapsed > 0 && prevElapsed % (45 * 60) === 0) missedActive = true;
              
              if (missedActive) setActiveAlert('active');
            }
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, totalTime, activeAlert]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  useEffect(() => {
    if (activeAlert === 'active') {
      let current = [...availableBreaks];
      if (current.length === 0) {
        current = [0, 1, 2, 3, 4].filter(i => i !== breakActivityIndex);
      }
      const rand = Math.floor(Math.random() * current.length);
      const chosen = current[rand];
      current.splice(rand, 1);
      setBreakActivityIndex(chosen);
      setAvailableBreaks(current);
    }
  }, [activeAlert]);

  const handleOffsetChange = (axis: 'top' | 'left' | 'scale', value: number) => {
    if (!equippedAccessory) return;
    setLocalOffsets(prev => {
      const current = prev[equippedAccessory] || (DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS] ?? { top: 50, left: 50, scale: 1 });
      return {
        ...prev,
        [equippedAccessory]: { ...current, [axis]: value }
      };
    });
  };

  const saveOffsets = () => {
    updateUserData({ accessoryOffsets: localOffsets });
    setIsCalibrating(false);
  };

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
      className="fixed inset-0 w-full h-full bg-[#FFFAF0] dark:bg-[#1A1C14] flex items-center justify-center font-body min-h-screen"
    >
      <div className="relative w-full h-[100dvh] sm:h-[844px] sm:max-w-[390px] mx-auto overflow-hidden sm:rounded-[40px] sm:border-[8px] sm:border-slate-800/10 sm:shadow-2xl bg-[#FFFAF0] dark:bg-[#1A1C14]">
        
        {/* Title Area */}
        <div className="absolute top-[200px] left-0 w-full z-30 flex flex-col items-center">
          <div className="relative inline-block text-center px-4">
            
            {/* Top Right Sparkle */}
            <svg className="absolute -top-3 right-0 w-5 h-5 text-[#FDE278]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L13.2 9.6L24 12L13.2 14.4L12 24L10.8 14.4L0 12L10.8 9.6L12 0Z" fill="currentColor"/>
            </svg>
            
            {/* Bottom Left Sparkle - positioned way to the left */}
            <svg className="absolute top-20 -left-6 w-4 h-4 text-[#FDE278]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0L13.2 9.6L24 12L13.2 14.4L12 24L10.8 14.4L0 12L10.8 9.6L12 0Z" fill="currentColor"/>
            </svg>
            
            <h1 className="text-[54px] font-black leading-none tracking-tight font-title text-[#2B3419] dark:text-[#FFFEF9]">
               PurePause
            </h1>
            <p className="text-[#2B3419]/80 dark:text-[#E2F0BD] text-[15px] font-medium tracking-tight mt-2 text-left ml-1">
               Cuida tu tiempo, cuida tu cuerpo
            </p>
          </div>
        </div>

        {/* Yellow Cloud */}
        <div className="absolute top-[280px] right-[-30px] w-[180px] h-[180px] z-10">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M100 20 C140 20 150 40 170 50 C190 60 190 100 180 120 C170 140 150 170 120 180 C90 190 60 180 40 160 C20 140 10 110 20 80 C30 50 60 40 80 40 C90 30 90 20 100 20 Z" fill="#FDE278" opacity="0.9"/>
            <radialGradient id="yellow-cloud" cx="50%" cy="50%" r="50%">
               <stop offset="0%" stopColor="#FBBC36" />
               <stop offset="100%" stopColor="#FDE278" stopOpacity="0"/>
            </radialGradient>
            <path d="M100 20 C140 20 150 40 170 50 C190 60 190 100 180 120 C170 140 150 170 120 180 C90 190 60 180 40 160 C20 140 10 110 20 80 C30 50 60 40 80 40 C90 30 90 20 100 20 Z" fill="url(#yellow-cloud)" opacity="0.5"/>
          </svg>
        </div>

        {/* Green Cloud */}
        <div className="absolute top-[420px] left-[-30px] w-[180px] h-[180px] z-10">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
            <path d="M110 20 C140 20 160 40 170 70 C180 100 170 130 150 150 C130 170 100 180 70 170 C40 160 20 140 10 110 C0 80 20 50 50 40 C70 30 90 20 110 20 Z" fill="#C9E190" opacity="0.9"/>
            <radialGradient id="green-cloud" cx="50%" cy="50%" r="50%">
               <stop offset="0%" stopColor="#8DB654" />
               <stop offset="100%" stopColor="#C9E190" stopOpacity="0"/>
            </radialGradient>
            <path d="M110 20 C140 20 160 40 170 70 C180 100 170 130 150 150 C130 170 100 180 70 170 C40 160 20 140 10 110 C0 80 20 50 50 40 C70 30 90 20 110 20 Z" fill="url(#green-cloud)" opacity="0.5"/>
          </svg>
        </div>

        {/* Login Button */}
        <div className="absolute top-[390px] left-0 w-full flex justify-center z-30">
           <button 
             onClick={signInWithGoogle}
             className="w-[240px] py-3 bg-[#BADA6A] hover:bg-[#a6c755] text-[#2B3419] font-medium rounded-xl text-[19px] leading-[1.2] shadow-sm flex flex-col items-center justify-center transition-all active:scale-95"
           >
             <span>Iniciar sesión</span>
             <span>con google</span>
           </button>
        </div>

        {/* Mascot */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="absolute bottom-[-20px] right-[-20px] w-[300px] h-[300px] pointer-events-none z-20"
        >
          <img src={isDarkMode ? "./assets2/tizquierdoblan.svg" : "./assets/timyizquierda.svg"} alt="Timy" className="w-full h-full object-contain" />
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
          <h1 className="text-3xl font-black mb-1 font-title text-[#353A26] dark:text-[#FFFEF9]">Hola, {user.name.split(' ')[0]}</h1>
          <p className="text-[#353A26] dark:text-[#FFFEF9] mb-8 font-body text-sm font-medium">Empieza tu día con agua, ¡te dará energía!</p>

          <div className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 shadow-sm border border-[#E2F0BD] dark:border-[#4A5333] mb-6 relative overflow-hidden">
            {/* Decorative cloud shape behind content */}
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-[#FDE278]/20 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-[#BAD66C]/20 rounded-2xl flex items-center justify-center mb-4 border border-[#BAD66C]/30">
                <Clock className="text-[#353A26] dark:text-[#FFFEF9]" size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#353A26] dark:text-[#FFFEF9]">Duración de la tarea</h2>
            </div>

            <div className="flex gap-4 mb-8 relative z-10">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#353A26] dark:text-[#FFFEF9] mb-2 ml-1">Horas</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full text-center text-2xl font-bold bg-[#FFFEF9] dark:bg-[#1A1C14] border border-[#E2F0BD] dark:border-[#4A5333] rounded-2xl py-4 text-[#353A26] dark:text-[#FFFEF9] focus:outline-none focus:ring-2 focus:ring-[#BAD66C]/20 dark:[color-scheme:dark]"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#353A26] dark:text-[#FFFEF9] mb-2 ml-1">Minutos</label>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full text-center text-2xl font-bold bg-[#FFFEF9] dark:bg-[#1A1C14] border border-[#E2F0BD] dark:border-[#4A5333] rounded-2xl py-4 text-[#353A26] dark:text-[#FFFEF9] focus:outline-none focus:ring-2 focus:ring-[#BAD66C]/20 dark:[color-scheme:dark]"
                  min="0"
                  max="59"
                />
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-[#BAD66C] text-[#2C311D] font-bold rounded-2xl py-5 text-lg shadow-lg shadow-[#BAD66C]/10 hover:bg-[#aecd5a] active:scale-95 transition-all"
            >
              Iniciar cronómetro
            </button>
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
                <path d="M 50,10 A 40,40 0 0,1 85,30" fill="none" stroke="#FDE278" strokeWidth="8" strokeLinecap="round" />
                <path d="M 90,50 A 40,40 0 0,1 70,85" fill="none" stroke="#BAD66C" strokeWidth="8" strokeLinecap="round" />
                <path d="M 50,90 A 40,40 0 0,1 15,70" fill="none" stroke="#FBBC36" strokeWidth="8" strokeLinecap="round" />
                <path d="M 10,50 A 40,40 0 0,1 30,15" fill="none" stroke="#353A26" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FDE278] rounded-full flex items-center justify-center shadow-sm">
              <Droplets size={14} className="text-[#FBBC36]" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#BAD66C] rounded-full flex items-center justify-center shadow-sm">
              <PersonStanding size={14} className="text-white dark:text-[#2C311D]" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FBBC36] rounded-full flex items-center justify-center shadow-sm">
              <Footprints size={14} className="text-white dark:text-[#2C311D]" />
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#353A26] dark:bg-[#BAD66C] rounded-full flex items-center justify-center shadow-sm">
              <Activity size={14} className="text-white dark:text-[#2C311D]" />
            </div>

            <div className="flex flex-col items-center z-10 px-4">
              <span className={`${timeRemaining >= 3600 ? 'text-5xl md:text-6xl' : 'text-7xl'} font-bold tracking-tighter mb-1 text-[#353A26] dark:text-[#FFFEF9] font-title transition-all duration-300`}>
                {formatTime(timeRemaining)}
              </span>
              <p className="text-[#353A26] dark:text-[#FFFEF9] font-medium text-sm">tiempo restante</p>
            </div>
          </div>

          <button
            onClick={handleStop}
            className="w-full max-w-xs bg-[#353A26] dark:bg-[#BAD66C] text-white dark:text-[#2C311D] font-bold rounded-2xl py-5 shadow-lg active:scale-95 transition-transform"
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
      className="w-full font-body overflow-x-hidden"
    >
      <h1 className="text-4xl font-bold mb-2 font-title text-[#353A26] dark:text-[#FFFEF9]">Estadísticas</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Tu progreso de la semana</p>

      {/* Health Score */}
      <div className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 shadow-sm border border-[#E2F0BD] dark:border-[#4A5333] mb-8 text-center relative overflow-hidden">
        <label className="text-xs font-bold text-[#353A26] dark:text-[#FFFEF9] uppercase tracking-widest mb-4 block">Tu Health Score Semanal</label>
        <div className="relative z-10">
          <div className="text-7xl font-bold mb-2 text-[#353A26] dark:text-[#FFFEF9] font-title">{healthScore}</div>
          <div className="w-full bg-[#353A26] dark:bg-[#BAD66C]/5 rounded-full h-3 mb-6 relative overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${(healthScore / 10) * 100}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="absolute inset-y-0 left-0 bg-[#BAD66C] rounded-full"
             />
          </div>
          <p className="text-[#353A26] dark:text-[#FFFEF9] font-medium text-sm">¡Mantente constante para subir tu score!</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDE278]/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#BAD66C]/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
      </div>

      {/* Activity Summary & Chart */}
      <div className="bg-white dark:bg-[#2C311D] rounded-[40px] p-6 shadow-sm border border-[#E2F0BD] dark:border-[#4A5333] mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#353A26] dark:text-[#FFFEF9]">Resumen de actividad</h3>
            <p className="text-xs text-[#353A26] dark:text-[#FFFEF9] font-medium italic">Análisis automático basado en tus sesiones</p>
          </div>
          <div className="w-10 h-10 bg-[#BAD66C]/20 rounded-xl flex items-center justify-center text-[#BAD66C]">
            <Activity size={20} />
          </div>
        </div>

        <p className="text-sm text-[#353A26] dark:text-[#FFFEF9] mb-8 leading-relaxed">
          Esta semana has mantenido una constancia del <span className="font-bold text-[#BAD66C]">{consistencyPercentage}%</span>. Tus niveles de energía son óptimos durante las mañanas.
        </p>

        <div className="w-full h-64 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#353A26/10" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#FFFEF9' : '#353A26', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#FFFEF9' : '#353A26', fontSize: 10 }}
                unit="h"
              />
              <Tooltip 
                cursor={{ fill: 'rgba(186, 214, 108, 0.1)' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #E2F0BD',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '8px 12px'
                }}
              />
              <Bar 
                dataKey="hours" 
                radius={[6, 6, 6, 6]}
                barSize={12}
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hours > 5 ? '#BAD66C' : '#FDE278'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mascot Session Counter */}
      <div className="bg-[#BAD66C]/10 rounded-[40px] p-8 border border-[#BAD66C]/20 flex flex-row items-center gap-6 relative overflow-hidden mb-8">
        <div className="w-24 h-24 relative z-10 flex-shrink-0 flex justify-center items-center">
          <img src={isDarkMode ? "./assets2/tderechoblanco.svg" : "./assets/timyderecha.svg"} alt="Timy" className="w-full h-full object-contain scale-125" />
        </div>
        <div className="text-left relative z-10 flex-1">
          <p className="text-[#353A26] dark:text-[#FFFEF9] font-bold text-lg mb-1 leading-tight">
            Has completado <span className="text-[#BAD66C] text-2xl font-black">{stats.sessionsThisWeek}</span> sesiones esta semana
          </p>
          <p className="text-[#353A26] dark:text-[#FFFEF9] font-bold uppercase tracking-widest text-xs mt-2">¡Sigue así!</p>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-[#FDE278]/20 rounded-full blur-3xl"></div>
      </div>
    </motion.div>
  );

  const renderWater = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full font-body"
    >
      <h1 className="text-4xl font-bold mb-2 font-title text-[#353A26] dark:text-[#FFFEF9]">Hidratación</h1>
      <p className="text-[#353A26] dark:text-[#FFFEF9] mb-8 font-medium">Seguimiento de consumo de agua</p>

      <div className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 mb-6 flex flex-col items-center border border-[#E2F0BD] dark:border-[#4A5333] relative font-body shadow-sm">
        {/* Larger Dynamic Water Drop SVG and Registration Trigger */}
        <div className="relative w-full flex justify-center items-center mb-4 h-64">
          <div className="relative w-48 h-full">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              {/* Drop Outline/Background */}
              <path 
                d="M50,5 Q15,65 15,90 A35,35 0 0,0 85,90 Q85,65 50,5 Z" 
                fill="#F0F9FF" 
                stroke="#BAE6FD" 
                strokeWidth="1.5" 
              />
              {/* Water Fill Content */}
              <g clipPath="url(#dropClipLarge)">
                {/* Background Wave (Darker) */}
                <motion.path
                  animate={{ 
                    x: [-20, 0, -20],
                    d: [
                      "M-40,0 Q-20,5 0,0 T40,0 T80,0 T120,0 V120 H-40 Z",
                      "M-40,0 Q-20,-5 0,0 T40,0 T80,0 T120,0 V120 H-40 Z",
                      "M-40,0 Q-20,5 0,0 T40,0 T80,0 T120,0 V120 H-40 Z"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  fill="#0369A1"
                  opacity="0.2"
                  style={{ y: 110 - (Math.min(waterToday, 8) / 8 * 100) }}
                />
                {/* Foreground Wave (Lighter/Primary) */}
                <motion.path
                  animate={{ 
                    x: [-10, 10, -10],
                    d: [
                      "M-40,0 Q-20,10 0,0 T40,0 T80,0 T120,0 V120 H-40 Z",
                      "M-40,0 Q-20,-10 0,0 T40,0 T80,0 T120,0 V120 H-40 Z",
                      "M-40,0 Q-20,10 0,0 T40,0 T80,0 T120,0 V120 H-40 Z"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  fill="#38BDF8"
                  style={{ y: 115 - (Math.min(waterToday, 8) / 8 * 100) }}
                />
              </g>
              <defs>
                <clipPath id="dropClipLarge">
                  <path d="M50,5 Q15,65 15,90 A35,35 0 0,0 85,90 Q85,65 50,5 Z" />
                </clipPath>
              </defs>
            </svg>
          </div>

          {/* Registration Circle Button */}
          <button 
            onClick={() => {
              setPendingWater(0);
              setIsWaterModalOpen(true);
            }}
            className="absolute right-[5%] bottom-4 w-14 h-14 bg-[#FFFEF9] dark:bg-[#1A1C14] rounded-full flex items-center justify-center shadow-lg border border-[#E2F0BD] dark:border-[#4A5333] active:scale-90 transition-transform z-10"
          >
            <div className="relative">
              <Droplets className="text-[#38BDF8]" size={24} />
              <div className="absolute -top-1 -right-1 bg-[#BAD66C] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                <Plus size={8} className="text-white dark:text-[#2C311D]" strokeWidth={4} />
              </div>
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isWaterModalOpen && (
          <div className="fixed inset-0 bg-[#353A26] dark:bg-[#BAD66C]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl relative"
            >
              <div className="w-20 h-20 bg-[#38BDF8]/10 rounded-[30px] flex items-center justify-center text-[#38BDF8] mx-auto mb-6">
                <Droplets size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#353A26] dark:text-[#FFFEF9] mb-8 font-title leading-tight">¿Tomaste un vaso de agua?</h2>
              
              <div className="flex items-center justify-center gap-8 mb-4">
                <button 
                  onClick={() => setPendingWater(Math.max(-waterToday, pendingWater - 1))}
                  className="w-16 h-16 bg-[#FFFEF9] dark:bg-[#1A1C14] rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all border border-[#E2F0BD] dark:border-[#4A5333] text-[#FBBC36]"
                >
                  <Minus size={32} strokeWidth={3} />
                </button>
                
                <button 
                  onClick={() => setPendingWater(pendingWater + 1)}
                  className="w-16 h-16 bg-[#BAD66C] rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all text-[#2C311D]"
                >
                  <Plus size={32} strokeWidth={3} />
                </button>
              </div>

              {/* Visual feedback: Tiny drops for pending water */}
              <div className="flex flex-wrap justify-center gap-1.5 mb-8 min-h-[24px]">
                {pendingWater > 0 && Array.from({ length: pendingWater }).map((_, i) => (
                  <motion.div
                    key={`plus-${i}`}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-[#38BDF8]"
                  >
                    <Droplets size={16} fill="currentColor" />
                  </motion.div>
                ))}
                {pendingWater < 0 && Array.from({ length: Math.abs(pendingWater) }).map((_, i) => (
                  <motion.div
                    key={`minus-${i}`}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-[#FBBC36]"
                  >
                    <Droplets size={16} className="opacity-40" />
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    const finalChange = pendingWater;
                    setWaterToday(prev => {
                      const newWater = Math.max(0, prev + finalChange);
                      if (prev < 4 && newWater >= 4) {
                        setPoints(p => p + 50);
                        setWaterPointsMessage({ title: '¡Mitad de Meta!', message: '¡Bebiste la mitad del agua recomendada!', points: 50 });
                      }
                      else if (prev < 8 && newWater >= 8) {
                        setPoints(p => p + 100);
                        setWaterPointsMessage({ title: '¡Felicidades!', message: '¡Completaste tu meta de agua de hoy!', points: 100 });
                      }
                      return newWater;
                    });
                    setStats(prev => ({
                      ...prev,
                      waterWeek: Math.max(0, prev.waterWeek + finalChange),
                      waterMonth: Math.max(0, prev.waterMonth + finalChange)
                    }));
                    triggerStreakUpdate();
                    setIsWaterModalOpen(false);
                  }}
                  className="w-full bg-[#BAD66C] text-[#2C311D] font-bold py-4 rounded-2xl active:scale-95 transition-transform"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => setIsWaterModalOpen(false)}
                  className="w-full bg-[#353A26]/10 dark:bg-[#BAD66C]/10 text-[#353A26] dark:text-[#FFFEF9] font-bold py-4 rounded-2xl active:scale-95 transition-transform"
                >
                  Regresar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Weekly Total Bar */}
        <div className="bg-[#BAD66C]/10 rounded-[32px] p-6 border border-[#BAD66C]/20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-[#2C311D] rounded-2xl flex items-center justify-center text-[#BAD66C] shadow-sm">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#353A26] dark:text-[#FFFEF9]">Esta semana</p>
              <p className="text-xl font-black text-[#353A26] dark:text-[#FFFEF9] lowercase leading-none">{stats.waterWeek} vasos de agua tomados</p>
            </div>
          </div>
        </div>

        {/* Info Bar with Popup */}
        <div className="bg-white dark:bg-[#2C311D] rounded-[32px] p-6 border border-[#E2F0BD] dark:border-[#4A5333] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#353A26] dark:text-[#FFFEF9]">¿Cuánta agua debería beber al día?</p>
            <button 
              onClick={() => setShowWaterInfo(true)}
              className="w-10 h-10 bg-[#FFFEF9] dark:bg-[#1A1C14] rounded-full flex items-center justify-center text-[#353A26] dark:text-[#FFFEF9] hover:text-[#BAD66C] transition-colors border border-[#E2F0BD] dark:border-[#4A5333] shadow-sm"
            >
              <span className="text-xl font-bold font-title">?</span>
            </button>
          </div>

          <AnimatePresence>
            {showWaterInfo && (
              <div className="fixed inset-0 bg-[#353A26] dark:bg-[#BAD66C]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white dark:bg-[#2C311D] rounded-[32px] p-6 w-full max-w-xs relative shadow-2xl"
                >
                  {/* Small Mascot in Corner */}
                  <div className="absolute -top-6 right-2 w-24 h-24 drop-shadow-lg flex justify-center items-center">
                    <img src={isDarkMode ? "./assets2/tfelizblanco.svg" : "./assets/timyfeliz.svg"} alt="Timy Feliz" className="w-full h-full object-contain" />
                  </div>

                  <h3 className="text-lg font-black text-[#353A26] dark:text-[#FFFEF9] mb-2 font-title">Sabías que...</h3>
                  
                  <div className="space-y-2 text-[#353A26] dark:text-[#FFFEF9] text-xs leading-relaxed font-medium">
                    <p>En promedio, una persona debería tomar entre <b>1.5 y 2 litros</b> (6 a 8 vasitos).</p>
                    <p>Si haces ejercicio o hace calor, necesitas más.</p>
                    <div className="bg-[#BAD66C]/10 p-3 rounded-2xl border border-[#BAD66C]/20 text-[#2C311D] dark:text-[#BAD66C]">
                      Fórmula: Tu peso / 7 = vasos al día.<br/>
                      Ej: <b>70 kg</b> = <b>10 vasos</b> de 250ml.
                    </div>
                    <p className="text-[#BAD66C] font-bold text-center text-xs">Tu cuerpo te lo agradece… ¡y yo también!</p>
                  </div>

                  <button 
                    onClick={() => setShowWaterInfo(false)}
                    className="w-full bg-[#353A26] dark:bg-[#BAD66C] text-white dark:text-[#2C311D] font-bold py-3 rounded-xl mt-4 active:scale-95 transition-transform shadow-lg"
                  >
                    Entendido
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Calculate Water Intake Bar */}
        <div className="bg-white dark:bg-[#2C311D] rounded-[32px] p-6 border border-[#E2F0BD] dark:border-[#4A5333] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#353A26] dark:text-[#FFFEF9]">Calcula cuánta agua necesitas al día</p>
            <button 
              onClick={() => setIsCalcModalOpen(true)}
              className="w-10 h-10 bg-[#BAD66C]/10 rounded-full flex items-center justify-center text-[#BAD66C] hover:bg-[#BAD66C]/20 transition-colors border border-[#E2F0BD] dark:border-[#4A5333] shadow-sm"
            >
              <Hand size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Water Calculator Modal */}
      <AnimatePresence>
        {isCalcModalOpen && (
          <div className="fixed inset-0 bg-[#353A26] dark:bg-[#BAD66C]/40 backdrop-blur-sm z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 w-full max-w-sm relative shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => {
                  setIsCalcModalOpen(false);
                  setCalcResult(null);
                  setWeightInput('');
                }}
                className="absolute top-6 right-6 text-[#353A26] dark:text-[#FFFEF9] hover:text-[#353A26] dark:text-[#FFFEF9] transition-colors"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-black text-[#353A26] dark:text-[#FFFEF9] mb-6 font-title pr-8">Calculadora Agua</h3>
              
              {!calcResult ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-center text-xs font-bold uppercase tracking-widest text-[#353A26] dark:text-[#FFFEF9] mb-3">Tu peso actual (kg)</label>
                    <div className="flex flex-col gap-4">
                      <input 
                        type="text"
                        inputMode="decimal"
                        placeholder="Ej: 65"
                        value={weightInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) {
                            setWeightInput(val);
                          }
                        }}
                        className="w-full bg-[#FFFEF9] dark:bg-[#1A1C14] border border-[#E2F0BD] dark:border-[#4A5333] rounded-2xl py-4 px-6 text-2xl font-bold text-[#353A26] dark:text-[#FFFEF9] text-center focus:outline-none focus:ring-2 focus:ring-[#BAD66C]/20"
                      />
                      <button 
                        onClick={() => {
                          const weight = parseFloat(weightInput);
                          if (!isNaN(weight) && weight > 0) {
                            const liters = weight / 30;
                            setCalcResult({
                              liters: Number(liters.toFixed(1)),
                              glasses: Math.round(liters * 4)
                            });
                          }
                        }}
                        disabled={!weightInput || parseFloat(weightInput) <= 0}
                        className="w-full bg-[#BAD66C] text-[#2C311D] py-4 rounded-2xl font-bold active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                      >
                        Calcular
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="bg-[#BAD66C]/10 rounded-[30px] p-8 mb-6 border border-[#BAD66C]/20">
                    <p className="text-[#353A26] dark:text-[#FFFEF9] font-bold text-lg mb-2">Para {weightInput} kg</p>
                    <p className="text-[#353A26] dark:text-[#FFFEF9] font-bold uppercase tracking-widest text-xs mb-4">Necesitas aprox.</p>
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-5xl font-black text-[#353A26] dark:text-[#FFFEF9] font-title">{calcResult.liters} L</span>
                       <span className="text-[#BAD66C] font-bold text-xl">= {calcResult.glasses} vasos</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        setCalcResult(null);
                        setWeightInput('');
                      }}
                      className="w-full bg-[#353A26] dark:bg-[#BAD66C] text-white dark:text-[#2C311D] font-bold py-4 rounded-2xl active:scale-95 transition-transform"
                    >
                      Calcular otro
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderStore = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 w-full pb-32"
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-black text-[#353A26] dark:text-[#FFFEF9] font-title">Timy</h2>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setShowPointsInfo(true)}
              className="w-10 h-10 bg-white dark:bg-[#2C311D] border border-[#E2F0BD] dark:border-[#4A5333] rounded-full flex items-center justify-center text-[#353A26] dark:text-[#FFFEF9] shadow-sm active:scale-95"
            >
              <HelpCircle size={20} />
            </button>
            <div className="flex items-center gap-2 bg-[#FDE278] px-4 py-2 rounded-full border border-orange-200">
              <Coins size={20} className="text-[#2C311D]" />
              <span className="font-bold text-[#2C311D]">{points} pts</span>
            </div>
          </div>
        </div>
        <p className="font-bold text-[#353A26] dark:text-[#FFFEF9]">¡Completa sesiones e hidrátate para ganar más puntos!</p>
      </div>

      <div className="bg-[#FFFEF9] dark:bg-[#1A1C14] rounded-[32px] p-8 border border-[#E2F0BD] dark:border-[#4A5333] shadow-sm mb-6 flex flex-col items-center relative overflow-hidden text-center">
        {/* Mascot representation */}
        <div className="relative w-[80%] aspect-square flex items-center justify-center mb-4 mx-auto">
            <img src={isDarkMode ? "./assets2/treposoblanco.svg" : "./assets/timyreposo.svg"} alt="Timy" className="w-full h-full object-contain drop-shadow-md" />

            {/* Accessories */}
            {equippedAccessory && (
              <div 
                className="absolute z-20"
                style={{
                  top: `${(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.top ?? 50}%`,
                  left: `${(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.left ?? 50}%`,
                  transform: `translate(-50%, -50%) scale(${(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.scale ?? 1})`,
                }}
              >
                {equippedAccessory === 'dragon_hat' && <span className="text-7xl drop-shadow-xl block">🐲</span>}
                {equippedAccessory === 'be_mine_shirt' && (
                  <div className="w-[110px] flex items-center justify-center">
                    <svg viewBox="0 0 100 50" fill="#FFFEF9" className="drop-shadow-md">
                       <path d="M 10 10 Q 50 -10 90 10 L 95 40 Q 50 45 5 40 Z" />
                       <text x="50" y="32" fontSize="16" fill="#4B5563" fontWeight="bold" textAnchor="middle">BE MINE</text>
                    </svg>
                  </div>
                )}
                {equippedAccessory === 'heart_mug' && <span className="text-5xl drop-shadow-xl block">☕</span>}
                {equippedAccessory === 'anubis_mask' && <span className="text-[80px] drop-shadow-xl block">🐺</span>}
                {equippedAccessory === 'striped_shirt' && (
                   <div className="w-[110px] flex items-center justify-center">
                     <svg viewBox="0 0 100 50" fill="#FBBF24" className="drop-shadow-md">
                        <path d="M 10 10 Q 50 -10 90 10 L 95 40 Q 50 45 5 40 Z" />
                        <path d="M 30 5 L 30 45 M 50 0 L 50 50 M 70 5 L 70 45" stroke="#3B82F6" strokeWidth="8" />
                     </svg>
                   </div>
                )}
                {equippedAccessory === 'polka_shirt' && (
                   <div className="w-[110px] flex items-center justify-center">
                     <svg viewBox="0 0 100 50" fill="#EF4444" className="drop-shadow-md">
                        <path d="M 10 10 Q 50 -10 90 10 L 95 40 Q 50 45 5 40 Z" />
                        <circle cx="30" cy="20" r="4" fill="white" />
                        <circle cx="50" cy="15" r="4" fill="white" />
                        <circle cx="70" cy="20" r="4" fill="white" />
                        <circle cx="40" cy="30" r="4" fill="white" />
                        <circle cx="60" cy="30" r="4" fill="white" />
                     </svg>
                   </div>
                )}
                {equippedAccessory === 'shorts' && (
                  <div className="w-[90px] flex items-center justify-center">
                     <svg viewBox="0 0 100 40" fill="#374151" className="drop-shadow-md">
                        <path d="M 0 0 L 100 0 L 90 35 L 55 35 L 50 20 L 45 35 L 10 35 Z" />
                     </svg>
                  </div>
                )}
                {equippedAccessory === 'derby_hat' && <span className="text-[90px] drop-shadow-xl block">🎩</span>}
                {equippedAccessory === 'sunglasses' && <span className="text-7xl drop-shadow-xl block">🕶️</span>}
                {equippedAccessory === 'pharaoh' && <span className="text-[90px] drop-shadow-xl block">🏺</span>}
              </div>
            )}
        </div>
      </div>

      {equippedAccessory && isCalibrating && (
        <div className="bg-[#BAD66C]/10 dark:bg-[#1A1C14] rounded-[24px] p-6 mb-6 border border-[#E2F0BD] dark:border-[#4A5333]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-[#353A26] dark:text-[#FFFEF9]">Calibrar Accesorio</h4>
            <button onClick={() => setIsCalibrating(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#2C311D] flex items-center justify-center shadow-sm">
              <X size={16} className="text-[#353A26] dark:text-[#FFFEF9]" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#353A26] dark:text-[#BAD66C] mb-2 block">X: {(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.left}%</label>
              <input 
                type="range" min="0" max="100" step="1" 
                value={(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.left ?? 50}
                onChange={(e) => handleOffsetChange('left', parseInt(e.target.value))}
                className="w-full accent-[#FBBC36]" 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#353A26] dark:text-[#BAD66C] mb-2 block">Y: {(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.top}%</label>
              <input 
                type="range" min="-50" max="150" step="1" 
                value={(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.top ?? 50}
                onChange={(e) => handleOffsetChange('top', parseInt(e.target.value))}
                className="w-full accent-[#FBBC36]" 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#353A26] dark:text-[#BAD66C] mb-2 block">Escala: {(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.scale}</label>
              <input 
                type="range" min="0.1" max="4" step="0.1" 
                value={(localOffsets[equippedAccessory] || DEFAULT_OFFSETS[equippedAccessory as keyof typeof DEFAULT_OFFSETS])?.scale ?? 1}
                onChange={(e) => handleOffsetChange('scale', parseFloat(e.target.value))}
                className="w-full accent-[#FBBC36]" 
              />
            </div>
          </div>
          
          <button 
            onClick={saveOffsets}
            className="w-full bg-[#FBBC36] font-bold py-3 rounded-xl mt-6 active:scale-95 transition-transform text-[#2C311D]"
          >
            Guardar Posición
          </button>
        </div>
      )}

      {equippedAccessory && !isCalibrating && (
        <button 
          onClick={() => setIsCalibrating(true)}
          className="w-full bg-white dark:bg-[#1A1C14] border border-[#E2F0BD] dark:border-[#4A5333] font-bold py-3 rounded-xl mb-6 active:scale-95 transition-transform text-[#353A26] dark:text-[#FFFEF9] flex items-center justify-center gap-2 shadow-sm"
        >
          <Settings size={18} /> Ajustar Posición
        </button>
      )}

      <h3 className="text-xl font-black flex items-center gap-2 mb-4 text-[#2C311D] dark:text-[#FFFEF9]">
        <Store size={24} className="text-[#BAD66C]" /> Tienda de Accesorios
      </h3>
      
      <div className="grid grid-cols-2 gap-4 pb-20">
        {[
          { id: 'dragon_hat', name: 'Gorro Dragón', price: 500, icon: '🐲', desc: '¡Feroz pero tierno!' },
          { id: 'be_mine_shirt', name: 'Camiseta Amor', price: 300, icon: '👕', desc: '¡Mucho amor!' },
          { id: 'heart_mug', name: 'Taza Corazón', price: 150, icon: '☕', desc: '¡Bebida calientita!' },
          { id: 'anubis_mask', name: 'Máscara Anubis', price: 1000, icon: '🐺', desc: '¡Poder del desierto!' },
          { id: 'striped_shirt', name: 'Camisa Rayas', price: 250, icon: '👔', desc: '¡Relajado!' },
          { id: 'polka_shirt', name: 'Camisa Puntos', price: 250, icon: '👚', desc: '¡Divertida!' },
          { id: 'shorts', name: 'Pantalones Cortos', price: 200, icon: '👖', desc: '¡Para el calor!' },
          { id: 'derby_hat', name: 'Sombrero Elegante', price: 400, icon: '🎩', desc: '¡A la moda!' },
          { id: 'sunglasses', name: 'Gafas de Sol', price: 150, icon: '🕶️', desc: '¡Estilazo!' },
          { id: 'pharaoh', name: 'Tocado Faraón', price: 1200, icon: '🏺', desc: '¡Realeza antigua!' },
        ].map(acc => {
          const isPurchased = purchasedAccessories.includes(acc.id);
          const isEquipped = equippedAccessory === acc.id;
          return (
            <div key={acc.id} className="bg-white dark:bg-[#2C311D] rounded-3xl p-5 border border-[#E2F0BD] dark:border-[#4A5333] flex flex-col items-center text-center shadow-sm relative">
              <span className="text-5xl mb-3 mt-2 block">{acc.icon}</span>
              <h4 className="font-bold text-[#353A26] dark:text-[#FFFEF9]">{acc.name}</h4>
              <p className="text-xs text-gray-500 dark:text-[#BAD66C] mb-2 font-medium">{acc.desc}</p>
              {!isPurchased && <p className="text-sm font-black text-[#FBBC36] mt-auto">{acc.price} pts</p>}
              
              {isPurchased ? (
                <button
                  onClick={() => setEquippedAccessory(isEquipped ? '' : acc.id)}
                  className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    isEquipped ? 'bg-[#353A26] dark:bg-[#BAD66C] text-white dark:text-[#2C311D] shadow-md' : 'bg-[#BAD66C]/20 text-[#353A26] dark:text-[#FFFEF9] hover:bg-[#BAD66C]/40'
                  }`}
                >
                  {isEquipped ? 'Quitar' : 'Equipar'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (points >= acc.price) {
                      setConfirmPurchase({ id: acc.id, name: acc.name, price: acc.price });
                    } else {
                      alert('¡No tienes suficientes puntos! Completa más sesiones.');
                    }
                  }}
                  className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm ${
                    points >= acc.price 
                      ? 'bg-[#BAD66C] text-[#2C311D] active:scale-95 hover:brightness-105' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  Comprar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderAccount = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full font-body"
    >
      <h1 className="text-4xl font-bold mb-2 font-title text-[#353A26] dark:text-[#FFFEF9]">Mi Perfil</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Información de tu cuenta</p>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 shadow-sm border border-[#E2F0BD] dark:border-[#4A5333] relative overflow-hidden">
          <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="relative">
              <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-[28px] object-cover ring-4 ring-[#BAD66C]/20" aria-hidden="true" />
              <div className="absolute -bottom-1 -right-1 bg-[#BAD66C] text-[#2C311D] p-1.5 rounded-lg border-2 border-white">
                < Award size={14} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#353A26] dark:text-[#FFFEF9] font-title">{user.name}</h2>
              <p className="text-sm text-[#353A26] dark:text-[#FFFEF9] font-medium font-body">{getRank(stats.activities)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">
             <div className="p-4 bg-[#FFFEF9] dark:bg-[#1A1C14] rounded-2xl border border-[#E2F0BD] dark:border-[#4A5333]">
                <p className="text-xs font-bold text-[#353A26] dark:text-[#FFFEF9] uppercase tracking-tight mb-1">Racha</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#353A26] dark:text-[#FFFEF9]">{streak} días</span>
                </div>
             </div>
          </div>
          <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-[#BAD66C]/10 rounded-full blur-2xl"></div>
        </div>

        {/* Menu Options */}
        <div className="bg-white dark:bg-[#2C311D] rounded-[40px] p-4 shadow-sm border border-[#E2F0BD] dark:border-[#4A5333] divide-y divide-slate-50">
           <button 
              onClick={() => {
                setTempName(user.name);
                setTempIsDarkMode(isDarkMode);
                setIsSettingsOpen(true);
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-[#BAD66C]/5 rounded-2xl transition-colors"
           >
              <div className="flex items-center gap-3">
                 <Settings size={20} className="text-[#353A26] dark:text-[#FFFEF9]" />
                 <span className="font-bold text-[#353A26] dark:text-[#FFFEF9]">Configuración</span>
              </div>
              <ChevronLeft size={18} className="rotate-180 text-[#353A26] dark:text-[#FFFEF9]" />
           </button>

           {isInstallable && (
              <button 
                 onClick={handleInstallClick}
                 className="w-full p-4 flex items-center justify-between hover:bg-[#BAD66C]/5 rounded-2xl transition-colors mt-2"
              >
                 <div className="flex items-center gap-3">
                    <Download size={20} className="text-[#353A26] dark:text-[#FFFEF9]" />
                    <span className="font-bold text-[#353A26] dark:text-[#FFFEF9]">Instalar Aplicación</span>
                 </div>
                 <ChevronLeft size={18} className="rotate-180 text-[#353A26] dark:text-[#FFFEF9]" />
              </button>
           )}
           <button 
              onClick={() => {
                signOut();
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

  const renderOnboarding = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 w-full h-full bg-[#FFFEF9] dark:bg-[#1A1C14] flex flex-col justify-between p-6 font-body z-[100]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-2 overflow-y-auto pt-10"
        >
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="text-3xl font-black text-[#353A26] dark:text-[#FFFEF9] font-title leading-tight text-left">
              ¡Hola! <br/>Soy Timy
            </h2>
            <img src={isDarkMode ? "./assets2/tsaludoblanco.svg" : "./assets/timysaludo.svg"} alt="Timy" className="w-[140px] h-[140px] shrink-0 object-contain drop-shadow-md" />
          </div>
          
          <div className="text-left">
            <div className="space-y-4 text-slate-600 dark:text-slate-300 font-medium text-[15px] leading-relaxed">
              <p>Estoy aquí para ayudarte a organizar tu tiempo y cuidar tu bienestar 💙</p>
              <p>Usa el cronómetro para enfocarte en tus sesiones de estudio o trabajo, mientras te recuerdo hacer pausas activas y mantenerte hidratado.</p>
              <p>Completa tus sesiones y gana puntos para personalizarme 🎉</p>
            </div>
            <p className="font-bold text-left mt-8 text-[#353A26] dark:text-[#FFFEF9] text-xl">¿Empezamos?</p>
          </div>
        </motion.div>

        <div className="pb-6 pt-4 w-full flex justify-center shrink-0">
          <button 
            onClick={() => setAppStatus('dashboard')}
            className="w-full max-w-[280px] bg-[#BAD66C] text-[#2C311D] font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg text-lg"
          >
            Comenzar
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#1A1C14]' : 'bg-[#FFFEF9]'} flex items-center justify-center`}>
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#BAD66C] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} ${appStatus === 'dashboard' ? (isDarkMode ? 'bg-[#1A1C14]' : 'bg-[#FFFEF9]') : (isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]')} transition-colors duration-500 font-body`}>
      <AnimatePresence mode="wait">
        {appStatus === 'welcome' ? (
          <motion.div key="landing">
             {renderWelcome()}
          </motion.div>
        ) : appStatus === 'onboarding' ? (
          <motion.div key="onboarding">
             {renderOnboarding()}
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center pb-32 pt-6 px-6"
          >
            {/* Top Bar */}
            <div className="w-full max-w-md flex justify-between items-center mb-8 relative z-20">
              {currentTab === 'home' ? (
                <div className="w-10 h-10"></div>
              ) : (
                <button 
                  onClick={() => setCurrentTab('home')}
                  className="w-10 h-10 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-white dark:bg-[#2C311D] shadow-sm text-slate-800 dark:text-slate-200"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className="flex gap-1.5 p-1.5 bg-white dark:bg-[#2C311D] backdrop-blur rounded-full shadow-inner border">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'home' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'stats' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'store' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'water' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTab === 'account' ? 'bg-[#8DB654] scale-125' : 'bg-slate-300'}`}></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md flex-1 flex flex-col items-center z-10 relative">
              {currentTab === 'home' && renderHome()}
              {currentTab === 'stats' && renderStats()}
              {currentTab === 'store' && renderStore()}
              {currentTab === 'water' && renderWater()}
              {currentTab === 'account' && renderAccount()}
            </div>

            {/* Bottom Navigation */}
            {(!isActive && timeRemaining === 0 && !showWaterInfo && !isWaterModalOpen && !isCalcModalOpen && !confirmPurchase && !isSettingsOpen && activeAlert === 'none' && !showPointsInfo && !sessionCompleteData) && (
              <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-50">
                <div className="bg-[#2C311D] rounded-[32px] h-20 flex items-center justify-around px-4 relative shadow-2xl">
                  <button 
                    onClick={() => setCurrentTab('home')}
                    className={`transition-all duration-300 ${currentTab === 'home' ? 'text-[#BAD66C] scale-110' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <Home size={24} />
                  </button>
                  <button 
                    onClick={() => setCurrentTab('stats')}
                    className={`transition-all duration-300 ${currentTab === 'stats' ? 'text-[#BAD66C] scale-110' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <Calendar size={24} />
                  </button>
                  
                  <button 
                    onClick={() => setCurrentTab('store')}
                    className={`transition-all duration-300 ${currentTab === 'store' ? 'text-[#BAD66C] scale-110' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <Cat size={24} />
                  </button>

                  <button 
                    onClick={() => setCurrentTab('water')}
                    className={`transition-all duration-300 ${currentTab === 'water' ? 'text-[#BAD66C] scale-110' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <Droplets size={24} />
                  </button>
                  <button 
                    onClick={() => setCurrentTab('account')}
                    className={`transition-all duration-300 ${currentTab === 'account' ? 'text-[#BAD66C] scale-110' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <User size={24} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {sessionCompleteData && (
          <div className="fixed inset-0 bg-[#353A26]/80 dark:bg-[#BAD66C]/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl relative border-4 border-[#FDE278]"
            >
              <div className="mx-auto w-32 h-32 mb-6 drop-shadow-xl relative">
                {/* Festive Mascot SVG */}
                <svg viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M 150 50 Q 170 30 190 50 Q 210 40 220 60 Q 250 50 250 80 Q 280 80 270 110 Q 300 120 280 150 Q 310 170 280 190 Q 300 220 270 230 Q 280 260 250 260 Q 250 290 220 270 Q 200 300 180 280 Q 150 310 130 280 Q 110 300 90 270 Q 60 290 60 260 Q 30 260 40 230 Q 10 220 30 190 Q 0 170 30 150 Q 10 120 40 110 Q 30 80 60 80 Q 60 50 90 60 Q 100 30 120 50 Q 130 30 150 50 Z" fill="#FDE278" />
                  <circle cx="160" cy="180" r="22" fill="white" />
                  <circle cx="160" cy="180" r="14" fill="#2C311D" />
                  <circle cx="230" cy="180" r="22" fill="white" />
                  <circle cx="230" cy="180" r="14" fill="#2C311D" />
                  <path d="M 180 230 Q 195 250 210 230" stroke="#2C311D" strokeWidth="6" strokeLinecap="round" />
                  {/* Party Hat */}
                  <path d="M 160 80 L 220 80 L 190 20 Z" fill="#F76C6C" />
                  <circle cx="190" cy="20" r="10" fill="#FFE26A" />
                </svg>
              </div>

              <h2 className="text-3xl font-black text-[#353A26] dark:text-[#FFFEF9] mb-4 font-title leading-tight">¡Misión<br/>Cumplida!</h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-6">Timy está muy orgulloso de tu concentración.</p>
              
              <div className="bg-[#BAD66C]/20 border border-[#BAD66C]/30 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3">
                <Coins size={28} className="text-[#8DB654]" />
                <span className="text-2xl font-black text-[#8DB654]">+{sessionCompleteData.points} pts</span>
              </div>

              <button 
                onClick={() => setSessionCompleteData(null)}
                className="w-full bg-[#BAD66C] text-[#2C311D] font-bold py-4 rounded-2xl active:scale-95 transition-transform"
              >
                ¡Genial!
              </button>
            </motion.div>
          </div>
        )}

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
              className="bg-white dark:bg-[#2C311D] rounded-[48px] p-10 max-w-sm w-full text-center shadow-2xl border border-white/20"
            >
              {activeAlert === 'soft' && (
                <>
                  <div className="mx-auto w-24 h-24 bg-[#E2F0BD] rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                    <Accessibility size={48} className="text-[#8DB654]" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Pausa Suave</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                    Estira los brazos y rota los hombros durante 30 segundos. ¡Relaja la tensión!
                  </p>
                  <button
                    onClick={() => setActiveAlert('none')}
                    className="w-full bg-[#1A1A1A] text-white dark:text-[#2C311D] font-bold rounded-full py-5 text-lg shadow-lg active:scale-95 transition-transform"
                  >
                    Continuar
                  </button>
                </>
              )}
              {activeAlert === 'active' && (() => {
                const CurrentBreak = BREAK_ACTIVITIES[breakActivityIndex];
                const BreakIcon = CurrentBreak.icon;
                return (
                  <>
                    <div className="mx-auto w-24 h-24 bg-[#F48FB1] rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                      <BreakIcon size={48} className="text-white dark:text-[#2C311D]" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{CurrentBreak.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                      {CurrentBreak.desc}
                    </p>
                    <button
                      onClick={() => {
                        setActiveAlert('none');
                        setStats(prev => ({ ...prev, activeBreaks: prev.activeBreaks + 1 }));
                        setPoints(p => p + 30);
                        alert('¡Muy bien! Pausa completada. (+30 pts)');
                      }}
                      className="w-full bg-[#1A1A1A] text-white dark:text-[#2C311D] font-bold rounded-full py-5 text-lg shadow-lg active:scale-95 transition-transform"
                    >
                      Hecho
                    </button>
                  </>
                );
              })()}
              {activeAlert === 'water' && (
                <>
                  <div className="mx-auto w-24 h-24 bg-[#E1F5FE] rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                    <Droplets size={48} className="text-[#039BE5]" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-[#039BE5]">¡Hidrátate!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                    Es momento de tomar unos sorbos de agua. Mantenerte hidratado mejora tu concentración y salud.
                  </p>
                  <button
                    onClick={() => setActiveAlert('none')}
                    className="w-full bg-[#039BE5] text-white dark:text-[#2C311D] font-bold rounded-full py-5 text-lg shadow-lg active:scale-95 transition-transform"
                  >
                    Entendido
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setup confirm purchase modal & settings modal */}
      <AnimatePresence>
        {confirmPurchase && (
          <div className="fixed inset-0 bg-[#353A26] dark:bg-[#BAD66C]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6 text-slate-800 dark:text-slate-200">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl relative"
            >
              <h2 className="text-2xl font-black text-[#353A26] dark:text-[#FFFEF9] mb-4 font-title leading-tight">Confirmar Compra</h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-8">¿Quieres comprar {confirmPurchase.name} por {confirmPurchase.price} pts?</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setPoints(p => p - confirmPurchase.price);
                    setPurchasedAccessories([...purchasedAccessories, confirmPurchase.id]);
                    setConfirmPurchase(null);
                    alert('¡Accesorio comprado con éxito!');
                  }}
                  className="w-full bg-[#BAD66C] text-[#2C311D] font-bold py-4 rounded-2xl active:scale-95 transition-transform"
                >
                  Comprar
                </button>
                <button 
                  onClick={() => setConfirmPurchase(null)}
                  className="w-full bg-[#353A26]/10 dark:bg-[#BAD66C]/10 text-[#353A26] dark:text-[#FFFEF9] font-bold py-4 rounded-2xl active:scale-95 transition-transform"
                >
                  Regresar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isSettingsOpen && (
          <div className="fixed inset-0 bg-[#353A26] dark:bg-[#BAD66C]/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6 text-slate-800 dark:text-slate-200">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFFEF9] dark:bg-[#1A1C14] rounded-[40px] p-8 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#353A26] dark:text-[#FFFEF9] font-title">Configuración</h2>
                <button 
                  onClick={() => {
                    setTempName(user.name);
                    setIsSettingsOpen(false);
                  }}
                  className="w-10 h-10 bg-white dark:bg-[#2C311D] border border-[#E2F0BD] dark:border-[#4A5333] rounded-full flex items-center justify-center text-[#353A26] dark:text-[#FFFEF9] shadow-sm active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6 space-y-2">
                <label className="text-sm font-bold text-[#353A26] dark:text-[#FFFEF9] uppercase tracking-widest pl-2">Tu Nombre</label>
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-white dark:bg-[#2C311D] text-[#353A26] dark:text-[#FFFEF9] font-bold p-4 rounded-2xl border border-[#E2F0BD] dark:border-[#4A5333] focus:outline-none focus:ring-2 focus:ring-[#BAD66C]"
                  placeholder="Ej. George"
                />
              </div>

              <div className="mb-8 p-4 bg-white dark:bg-[#2C311D] rounded-2xl border border-[#E2F0BD] dark:border-[#4A5333] flex items-center justify-between">
                 <span className="font-bold text-[#353A26] dark:text-[#FFFEF9]">Modo Oscuro</span>
                 <button 
                  onClick={() => setTempIsDarkMode(!tempIsDarkMode)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${tempIsDarkMode ? 'bg-[#BAD66C]' : 'bg-slate-200'}`}
                 >
                    <motion.div 
                      layout
                      className="w-6 h-6 bg-white dark:bg-[#2C311D] rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                      style={{ marginLeft: tempIsDarkMode ? '24px' : '0px' }}
                    />
                 </button>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if(tempName.trim()) {
                      setUser(prev => ({ ...prev, name: tempName.trim() }));
                      if (authUser) {
                        updateUserData({ name: tempName.trim() });
                      }
                    }
                    setIsDarkMode(tempIsDarkMode);
                    setIsSettingsOpen(false);
                  }}
                  className="w-full bg-[#353A26] dark:bg-[#BAD66C] text-white dark:text-[#2C311D] font-bold py-4 rounded-2xl active:scale-95 transition-transform"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showPointsInfo && (
          <div className="fixed inset-0 bg-[#353A26] dark:bg-[#BAD66C]/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6 text-slate-800 dark:text-slate-200">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFFEF9] dark:bg-[#1A1C14] rounded-[40px] p-8 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#353A26] dark:text-[#FFFEF9] font-title">Puntos Timy</h2>
                <button 
                  onClick={() => setShowPointsInfo(false)}
                  className="w-10 h-10 bg-white dark:bg-[#2C311D] border border-[#E2F0BD] dark:border-[#4A5333] rounded-full flex items-center justify-center text-[#353A26] dark:text-[#FFFEF9] shadow-sm active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 text-[#353A26] dark:text-[#FFFEF9] font-medium leading-relaxed">
                <p>
                  Obtienes puntos usando la app todos los días. Al ganar puntos, puedes comprar increíbles accesorios y ropas para Timy.
                </p>
                <ul className="space-y-3 bg-[#BAD66C]/10 border border-[#BAD66C]/20 p-4 rounded-2xl">
                  <li className="flex items-center gap-3">
                    <div className="bg-[#BAD66C] w-8 h-8 rounded-full flex items-center justify-center text-[#2C311D]">
                      <Droplets size={16} />
                    </div>
                    <span>Beber un vaso: <b className="text-[#8DB654]">+5 pts</b></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-[#BAD66C] w-8 h-8 rounded-full flex items-center justify-center text-[#2C311D]">
                      <Clock size={16} />
                    </div>
                    <span>Sesión completa: <b className="text-[#8DB654]">+20 pts</b></span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setShowPointsInfo(false)}
                className="w-full mt-8 bg-[#353A26] dark:bg-[#BAD66C] text-white dark:text-[#2C311D] font-bold py-4 rounded-2xl active:scale-95 transition-transform"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {waterPointsMessage && (
          <div className="fixed inset-0 bg-[#353A26]/80 dark:bg-[#BAD66C]/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6 text-slate-800 dark:text-slate-200">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#2C311D] rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl relative border-4 border-[#039BE5]"
            >
              <div className="mx-auto w-24 h-24 mb-6 drop-shadow-xl relative flex justify-center items-center">
                 <div className="absolute inset-0 bg-[#039BE5]/20 blur-xl rounded-full"></div>
                 <div className="relative w-full h-full bg-[#039BE5]/10 rounded-full flex items-center justify-center border-4 border-[#039BE5]">
                    <Droplets className="text-[#039BE5] w-12 h-12" />
                 </div>
              </div>
              
              <div className="mb-8">
                <p className="text-xl font-bold text-[#353A26] dark:text-[#FFFEF9] mb-2">{waterPointsMessage.title}</p>
                <h2 className="text-3xl font-black mb-4 text-[#039BE5]">+{waterPointsMessage.points} Puntos</h2>
                <p className="text-[#353A26] dark:text-[#FFFEF9] font-medium leading-relaxed bg-[#039BE5]/10 p-4 rounded-2xl inline-block">
                  {waterPointsMessage.message}
                </p>
              </div>

              <button 
                onClick={() => setWaterPointsMessage(null)}
                className="w-full bg-[#039BE5] hover:bg-[#0288D1] text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-[#039BE5]/20 transition-all active:scale-95"
              >
                ¡Genial!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
