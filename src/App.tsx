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

// --- CONFIGURACIÓN DE CREDENCIALES (LIMPIO) ---
const ADMOB_BANNER_ID = 'TU_ADMOB_BANNER_ID_AQUI';
const ADMOB_INTERSTITIAL_ID = 'TU_ADMOB_INTERSTITIAL_ID_AQUI';
const CLOUD_RUN_PROXY_URL = 'TU_URL_DE_CLOUD_RUN_AQUI';
// ----------------------------------------------

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

    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (Capacitor.isNativePlatform()) {
      AdMob.initialize({ initializeForTesting: false });

      const prepareInterstitial = async (retries = 3) => {
        try {
          await AdMob.prepareInterstitial({
            adId: ADMOB_INTERSTITIAL_ID,
            isTesting: false,
          });
          setAdReady(true);
        } catch (e) {
          if (retries > 0) {
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
        await AdMob.prepareInterstitial({
          adId: ADMOB_INTERSTITIAL_ID,
          isTesting: false,
        });
        setAdReady(true);
      } catch (e) {
        console.error('AdMob error');
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

  const playMoneySound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const enterVault = () => {
    setShowSplash(false);
    playMoneySound();
  };

  const fetchContracts = useCallback(async () => {
    showInterstitialAd();
    setLoading(true);
    playMoneySound();
    
    try {
      const isNative = Capacitor.isNativePlatform();
      const apiUrl = isNative ? `${CLOUD_RUN_PROXY_URL}/api/contracts` : '/api/contracts';
      
      let xmlText = '';

      if (isNative) {
        const response = await CapacitorHttp.get({
          url: apiUrl,
          connectTimeout: 20000,
          readTimeout: 20000
        });
        if (response.status !== 200) throw new Error(`Status: ${response.status}`);
        xmlText = response.data;
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        const response = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
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
          id, title: title.toUpperCase(), organ, amount, date, link, category: title
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
      alert(`SISTEMA: Error de conexión con la bóveda.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const shareEvidence = (contract: Contract) => {
    const text = `⚠️ CONTRATO DETECTADO:\n${contract.title}\nImporte: ${formatCurrency(contract.amount)}\nFuente: ${contract.link}`;
    if (navigator.share) {
      navigator.share({ title: 'Evidencia Rastreador', text: text, url: contract.link });
    } else {
      navigator.clipboard.writeText(text);
      alert('Copiado al portapapeles');
    }
  };

  const appUrl = window.location.href;

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
          <Vault className="w-32 h-32 text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)]" />
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-yellow-400 tracking-tighter">EL RASTREADOR</h1>
            <p className="text-zinc-500 font-bold text-xs tracking-[0.4em] uppercase">Auditoría de Licitaciones Públicas</p>
          </div>
          <button onClick={enterVault} className="bg-yellow-400 text-black font-black px-12 py-4 rounded-full text-xl hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/20">
            ENTRAR EN LA BÓVEDA
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-black text-white selection:bg-yellow-400 selection:text-black">
      <main className="max-w-2xl mx-auto px-6 py-10 relative z-10">
        <header className="flex flex-col items-center mb-10 space-y-4">
          <Vault className="w-20 h-20 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <h1 className={`text-4xl font-black tracking-tighter transition-colors ${isFlickering ? 'text-purple-500' : 'text-yellow-400'}`}>EL RASTREADOR</h1>
          <span className="text-[10px] font-bold text-zinc-600 tracking-[0.3em] uppercase">Bóveda de Transparencia Pública</span>
        </header>

        <section className="mb-8">
          <div className="bg-[#0A0A0A] border-2 border-yellow-400 rounded-2xl p-8 shadow-[0_0_20px_rgba(255,255,0,0.1)] flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] mb-2 uppercase">Capital Público Analizado</span>
            <motion.div key={totalAmount} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-5xl font-black text-red-600 tabular-nums">
              {formatCurrency(totalAmount)}
            </motion.div>
          </div>
        </section>

        <button onClick={fetchContracts} disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black py-5 rounded-full text-lg transition-all flex items-center justify-center space-x-3 mb-6">
          {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          <span>{loading ? 'AUDITANDO...' : 'ABRIR CAJA FUERTE ESTATAL'}</span>
        </button>

        <div className="space-y-4">
          {contracts.map((contract, index) => (
            <motion.div key={contract.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
              className={`bg-[#0D0D0D] border-2 rounded-xl p-5 ${contract.amount >= 100000 ? 'border-red-600' : 'border-yellow-400/50'}`}>
              <div className="flex flex-col space-y-3">
                <h3 className="text-xs font-bold text-white uppercase">CONTRATO: {contract.title}</h3>
                <p className="text-[10px] text-zinc-500">{contract.organ}</p>
                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                   <button onClick={() => shareEvidence(contract)} className="text-yellow-400 text-[10px] font-bold uppercase flex items-center gap-1">
                     <Share2 className="w-3 h-3" /> Compartir
                   </button>
                   <span className="text-xl font-black text-yellow-400">{formatCurrency(contract.amount)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button onClick={() => setShowQR(true)} className="fixed bottom-6 right-6 bg-yellow-400 text-black p-4 rounded-full shadow-2xl z-50">
          <QrCode className="w-6 h-6" />
        </button>

        <AnimatePresence>
          {showQR && (
            <motion.div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
              <div className="bg-[#0A0A0A] border-2 border-yellow-400 p-8 rounded-3xl flex flex-col items-center space-y-4" onClick={e => e.stopPropagation()}>
                <QRCodeSVG value={appUrl} size={200} />
                <button onClick={() => setShowQR(false)} className="text-yellow-400 font-bold">CERRAR</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
