/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { AdMob, InterstitialAdPluginEvents, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { 
  Landmark, 
  Coins, 
  ShieldCheck, 
  Share2, 
  ExternalLink, 
  AlertTriangle,
  Loader2,
  TrendingUp,
  HardHat,
  Package,
  Briefcase,
  Trash2,
  Monitor,
  Zap,
  Car,
  Shield,
  Stethoscope,
  BookOpen,
  Hammer,
  HelpCircle,
  Vault,
  QrCode,
  X
} from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  organ: string;
  amount: number;
  date: string;
  link: string;
  category: string;
}

const getCategoryIcon = (title: string) => {
  const t = title.toUpperCase();
  if (t.includes('OBRA') || t.includes('CONSTRUCCION') || t.includes('REFORMA')) return <HardHat className="w-5 h-5" />;
  if (t.includes('SUMINISTRO') || t.includes('ADQUISICION') || t.includes('COMPRA')) return <Package className="w-5 h-5" />;
  if (t.includes('SERVICIO') || t.includes('ASISTENCIA')) return <Briefcase className="w-5 h-5" />;
  if (t.includes('LIMPIEZA') || t.includes('RESIDUOS') || t.includes('JARDINERIA')) return <Trash2 className="w-5 h-5" />;
  if (t.includes('INFORMATIC') || t.includes('SOFTWARE') || t.includes('SISTEMAS') || t.includes('NUBE') || t.includes('CLOUD')) return <Monitor className="w-5 h-5" />;
  if (t.includes('ENERGIA') || t.includes('ELECTRIC') || t.includes('GAS') || t.includes('COMBUSTIBLE')) return <Zap className="w-5 h-5" />;
  if (t.includes('VEHICULO') || t.includes('TRANSPORTE') || t.includes('AUTOBUS') || t.includes('COCHE')) return <Car className="w-5 h-5" />;
  if (t.includes('SEGURIDAD') || t.includes('VIGILANCIA') || t.includes('PROTECCION')) return <Shield className="w-5 h-5" />;
  if (t.includes('SANITARIO') || t.includes('SALUD') || t.includes('MEDIC') || t.includes('HOSPITAL')) return <Stethoscope className="w-5 h-5" />;
  if (t.includes('EDUCACION') || t.includes('FORMACION') || t.includes('LIBRO') || t.includes('CULTURA')) return <BookOpen className="w-5 h-5" />;
  if (t.includes('MANTENIMIENTO') || t.includes('REPARACION')) return <Hammer className="w-5 h-5" />;
  return <HelpCircle className="w-5 h-5" />;
};


const ADMOB_BANNER_ID = 'ca-app-pub-8007382165996756/6300410618';
const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-8007382165996756/7265173776';
 

export default function App() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [auditedCount, setAuditedCount] = useState(0);
  const [isFlickering, setIsFlickering] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [adReady, setAdReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');

    // Check if app is already installed/standalone
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Handle PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initialize AdMob if on native platform
    if (Capacitor.isNativePlatform()) {
      AdMob.initialize({
        initializeForTesting: false,
      });

      // Preload Interstitial Ad
      const prepareInterstitial = async (retries = 3) => {
        try {
          await AdMob.prepareInterstitial({
            adId: ADMOB_INTERSTITIAL_ID,
            isTesting: false,
          });
          setAdReady(true);
          console.log('AdMob Interstitial preparado');
        } catch (e) {
          console.error('AdMob prepare error:', e);
          if (retries > 0) {
            console.log(`Reintentando preparar anuncio (${retries} intentos restantes)...`);
            setTimeout(() => prepareInterstitial(retries - 1), 5000);
          }
        }
      };

      prepareInterstitial();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showInterstitialAd = async () => {
    if (Capacitor.isNativePlatform() && adReady) {
      try {
        await AdMob.showInterstitial();
        setAdReady(false);
        // Prepare next ad
        await AdMob.prepareInterstitial({
          adId: ADMOB_INTERSTITIAL_ID,
          isTesting: false,
        });
        setAdReady(true);
      } catch (e) {
        console.error('AdMob show error:', e);
      }
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      AdMob.showBanner({
        adId: ADMOB_BANNER_ID,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const playMoneySound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play blocked"));
    }
  };

  const enterVault = () => {
    setShowSplash(false);
    playMoneySound();
  };

  const fetchContracts = useCallback(async () => {
    // Show ad in background if ready, but don't block
    showInterstitialAd();
    
    setLoading(true);
    playMoneySound();
    try {
      // Usamos el servidor de la web como PROXY para el APK.
      // Esto es 100% fiable porque el servidor (Cloud Run) tiene certificados actualizados
      // y el móvil confía plenamente en la URL de Google Cloud.
      const isNative = Capacitor.isNativePlatform();
      const cloudRunUrl = 'https://ais-dev-c3hixjwlqy57cmwarbpte5-160410561041.europe-west3.run.app';
      
      // En nativo llamamos a la API de nuestra propia web que ya funciona
      const apiUrl = isNative 
        ? `${cloudRunUrl}/api/contracts`
        : '/api/contracts';
      
      console.log('Iniciando auditoría en:', apiUrl, isNative ? '(Nativo vía Cloud Proxy)' : '(Web)');
      
      let xmlText = '';

      if (isNative) {
        const response = await CapacitorHttp.get({
          url: apiUrl,
          connectTimeout: 20000,
          readTimeout: 20000
        });
        
        if (response.status !== 200) {
          throw new Error(`Error del servidor: ${response.status}. Inténtalo de nuevo en unos segundos.`);
        }
        xmlText = response.data;
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        const response = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }
        xmlText = await response.text();
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const entries = Array.from(xmlDoc.getElementsByTagName('entry'));
      const newContracts: Contract[] = [];
      let currentTotal = 0;

      entries.slice(0, 30).forEach((entry) => {
        const titleText = entry.getElementsByTagName('title')[0]?.textContent || '';
        const [title, organRaw] = titleText.split(';');
        const organ = organRaw?.trim() || 'Adm. Pública';
        
        const amountEl = Array.from(entry.getElementsByTagName('*')).find(el => el.localName === 'TotalAmount');
        const amount = amountEl ? parseFloat(amountEl.textContent || '0') : 0;
        
        const date = entry.getElementsByTagName('updated')[0]?.textContent || new Date().toISOString();
        const link = entry.getElementsByTagName('link')[0]?.getAttribute('href') || '#';
        const id = entry.getElementsByTagName('id')[0]?.textContent || Math.random().toString();

        newContracts.push({
          id,
          title: title.toUpperCase(),
          organ,
          amount,
          date,
          link,
          category: title
        });
        currentTotal += amount;
      });

      setContracts(newContracts);
      setTotalAmount(currentTotal);
      setAuditedCount(prev => prev + newContracts.length);

      if (currentTotal > 1000000) {
        setIsFlickering(true);
        setTimeout(() => setIsFlickering(false), 3000);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`SISTEMA: Fallo de conexión.\nDetalle: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const shareEvidence = (contract: Contract) => {
    const text = `⚠️ CONTRATO DETECTADO:\n${contract.title}\nImporte: ${formatCurrency(contract.amount)}\nFuente: ${contract.link}`;
    if (navigator.share) {
      navigator.share({
        title: 'Evidencia Osintrz',
        text: text,
        url: contract.link,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Evidencia copiada al portapapeles');
    }
  };

  const appUrl = window.location.href;

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-8"
        >
          <div className="relative">
            <Vault className="w-32 h-32 text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)]" />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <div className="w-1 h-12 bg-yellow-600/30 rounded-full"></div>
            </motion.div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-yellow-400 tracking-tighter">EL RASTREADOR</h1>
            <p className="text-zinc-500 font-bold text-xs tracking-[0.4em] uppercase">Sistema de Auditoría OSINTRZ</p>
          </div>

          <button
            onClick={enterVault}
            className="bg-yellow-400 text-black font-black px-12 py-4 rounded-full text-xl hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/20"
          >
            ENTRAR EN LA BÓVEDA
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-yellow-400 selection:text-black">
      <div className="watermark">CREADO POR OSINTRZ</div>

      <main className="max-w-2xl mx-auto px-6 py-10 relative z-10">
        {/* Header Section */}
        <header className="flex flex-col items-center mb-10 space-y-4">
          <div className="flex items-center space-x-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Landmark className="w-10 h-10 text-yellow-400 opacity-50" />
            </motion.div>
            
            <motion.div
              animate={{ 
                scale: loading ? [1, 1.2, 1] : 1,
                rotate: loading ? [0, 10, -10, 0] : 0
              }}
              transition={{ repeat: loading ? Infinity : 0, duration: 0.6 }}
            >
              <div className="relative group cursor-pointer" onClick={() => setShowQR(true)}>
                <Vault className="w-20 h-20 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ repeat: loading ? Infinity : 0, duration: 2, ease: "linear" }}
                >
                  <div className="w-1 h-8 bg-yellow-600/50 rounded-full"></div>
                </motion.div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] font-black px-1 rounded shadow-lg">GOLD</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            >
              <Landmark className="w-10 h-10 text-yellow-400 opacity-50" />
            </motion.div>
          </div>

          <motion.h1 
            className={`text-4xl font-black tracking-tighter text-center transition-colors duration-300 ${
              isFlickering ? 'text-purple-500' : 'text-yellow-400'
            }`}
            animate={isFlickering ? { opacity: [1, 0, 1, 0, 1] } : {}}
            transition={{ duration: 0.5, repeat: isFlickering ? Infinity : 0 }}
          >
            EL RASTREADOR
          </motion.h1>
          <p className="text-[10px] font-bold text-zinc-600 tracking-[0.3em] uppercase">Bóveda de Transparencia Pública</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${Capacitor.isNativePlatform() ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}></div>
            <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
              {Capacitor.isNativePlatform() ? 'Auditoría Nativa Activa' : 'Auditoría Web Activa'}
            </span>
          </div>
        </header>

        {/* Total Summary Card */}
        <section className="mb-8">
          <div className="bg-[#0A0A0A] border-2 border-yellow-400 rounded-2xl p-8 shadow-[0_0_20px_rgba(255,255,0,0.1)] flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30"></div>
            <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] mb-2 uppercase">
              Capital Público Bajo Lupa
            </span>
            <motion.div 
              key={totalAmount}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black text-red-600 tabular-nums"
            >
              {formatCurrency(totalAmount)}
            </motion.div>
            <div className="mt-4 flex items-center space-x-2 text-[9px] font-bold text-zinc-600 uppercase">
              <ShieldCheck className="w-3 h-3" />
              <span>Auditado en tiempo real</span>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={fetchContracts}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black py-5 rounded-full text-lg transition-all active:scale-95 flex items-center justify-center space-x-3 mb-6 shadow-lg shadow-yellow-400/20"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-6 h-6" />
              <span>AUDITANDO BÓVEDA...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-6 h-6" />
              <span>ABRIR CAJA FUERTE ESTATAL</span>
            </>
          )}
        </button>

        {/* Counter Badge */}
        <AnimatePresence>
          {auditedCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] border border-yellow-400/30 rounded-lg py-2 px-4 mb-8 flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">
                {auditedCount} CONTRATOS ANALIZADOS POR OSINTRZ
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contracts List */}
        <div className="space-y-4">
          {contracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-[#0D0D0D] border-2 rounded-xl p-5 group transition-all hover:bg-[#151515] relative overflow-hidden ${
                contract.amount >= 100000 ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : 'border-yellow-400/50'
              }`}
            >
              <div className="flex flex-col space-y-3">
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 p-2 rounded-lg ${contract.amount >= 100000 ? 'bg-red-600/10 text-red-600' : 'bg-yellow-400/10 text-yellow-400'}`}>
                        {getCategoryIcon(contract.title)}
                      </div>
                      <h3 className="text-xs font-bold text-white leading-tight pr-4">
                        CONTRATO: {contract.title}
                      </h3>
                    </div>
                    {contract.amount >= 100000 && (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                  </div>
                  <div className="pl-11">
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {contract.organ}
                    </p>
                    <p className={`text-[10px] font-bold ${contract.amount >= 100000 ? 'text-red-600' : 'text-yellow-400'}`}>
                      PUBLICADO: {new Date(contract.date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 pl-11">
                  <div className="flex space-x-2">
                    <a 
                      href={contract.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors bg-zinc-900/50"
                      title="Ver fuente oficial"
                    >
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Ver Web</span>
                    </a>
                    <button 
                      onClick={() => shareEvidence(contract)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        contract.amount >= 100000 
                          ? 'border-red-600/30 hover:bg-red-600/10 bg-red-600/5' 
                          : 'border-yellow-400/30 hover:bg-yellow-400/10 bg-yellow-400/5'
                      }`}
                      title="Compartir evidencia"
                    >
                      <Share2 className={`w-4 h-4 ${contract.amount >= 100000 ? 'text-red-600' : 'text-yellow-400'}`} />
                      <span className={`text-[10px] font-bold uppercase ${contract.amount >= 100000 ? 'text-red-600' : 'text-yellow-400'}`}>Compartir</span>
                    </button>
                  </div>
                  
                  <div className={`text-xl font-black tabular-nums ${contract.amount >= 100000 ? 'text-red-600' : 'text-yellow-400'}`}>
                    {formatCurrency(contract.amount)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Share Button (Floating) */}
        <button
          onClick={() => setShowQR(true)}
          className="fixed bottom-6 right-6 bg-yellow-400 text-black p-4 rounded-full shadow-2xl active:scale-95 transition-transform z-50"
        >
          <QrCode className="w-6 h-6" />
        </button>

        {/* QR Modal */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6"
              onClick={() => setShowQR(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#0A0A0A] border-2 border-yellow-400 p-8 rounded-3xl flex flex-col items-center space-y-6 max-w-xs w-full relative"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowQR(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-black text-yellow-400">COMPARTE LA BÓVEDA</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Escanea para auditar en cualquier móvil</p>
                </div>
                <div className="bg-white p-4 rounded-2xl">
                  <QRCodeSVG value={appUrl} size={200} />
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appUrl);
                    alert('Enlace copiado');
                  }}
                  className="w-full py-3 border border-yellow-400/30 text-yellow-400 text-xs font-bold rounded-xl"
                >
                  COPIAR ENLACE DIRECTO
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
