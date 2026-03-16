import React, { useState, useEffect } from 'react';
import { Activity, Play, Square, Accessibility, Footprints, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [duration, setDuration] = useState<string>('120');
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [activeAlert, setActiveAlert] = useState<'none' | 'soft' | 'active'>('none');

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
            } else if (elapsed % 3600 === 0) {
              setActiveAlert('active');
            } else if (elapsed % 1200 === 0) {
              setActiveAlert('soft');
            }
            return 0;
          }

          // Trigger alerts
          if (elapsed > 0) {
            if (elapsed % 3600 === 0) {
              setActiveAlert('active');
            } else if (elapsed % 1200 === 0) {
              setActiveAlert('soft');
            }
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, totalTime, activeAlert]);

  const handleStart = () => {
    const mins = parseInt(duration, 10);
    if (isNaN(mins) || mins <= 0) return;
    
    const secs = mins * 60;
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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center py-12 px-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-10"
      >
        <div className="bg-emerald-500 p-2.5 rounded-xl shadow-sm text-white">
          <Activity size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">BreakBalance</h1>
          <p className="text-sm text-slate-500 font-medium">Bienestar y Productividad</p>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        layout
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 w-full max-w-md relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isActive && timeRemaining === 0 ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <Clock size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">Nueva Sesión</h2>
              <p className="text-slate-500 text-center mb-8 text-sm leading-relaxed">
                Organiza tu tiempo y evita el sedentarismo. Te recordaremos cuándo hacer pausas.
              </p>

              <div className="w-full mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                  Duración de la tarea (minutos)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-center text-4xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all"
                  placeholder="120"
                  min="1"
                />
              </div>

              <button
                onClick={handleStart}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/30"
              >
                <Play size={20} fill="currentColor" />
                Iniciar Tarea
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-8">Sesión en curso</h2>
              
              <div className="relative flex items-center justify-center mb-10">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-emerald-500 transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-slate-800 tracking-tight font-mono">
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-sm text-slate-400 font-medium mt-1">restantes</span>
                </div>
              </div>

              <button
                onClick={handleStop}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors"
              >
                <Square size={20} fill="currentColor" />
                Detener
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Break Modal */}
      <AnimatePresence>
        {activeAlert !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              {activeAlert === 'soft' ? (
                <>
                  <div className="mx-auto w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
                    <Accessibility size={48} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">Pausa Suave</h2>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Estira los brazos y rota los hombros durante 30 segundos. ¡Relaja la tensión!
                  </p>
                  <button
                    onClick={() => setActiveAlert('none')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl py-4 transition-colors shadow-lg shadow-amber-500/30"
                  >
                    Continuar
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6">
                    <Footprints size={48} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">Pausa Activa</h2>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Levántate, camina un poco o estira las piernas por 2 minutos. ¡Activa tu circulación!
                  </p>
                  <button
                    onClick={() => setActiveAlert('none')}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-2xl py-4 transition-colors shadow-lg shadow-rose-500/30"
                  >
                    Hecho
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
