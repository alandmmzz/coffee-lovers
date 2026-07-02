"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "cl_install_prompt_dismissed";

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !("MSStream" in window);
}

function isMobile() {
  return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (isInStandaloneMode()) return; // ya está instalada, no insistimos
    if (!isMobile()) return; // pedido: solo en mobile

    if (isIos()) {
      // iOS no tiene API para instalar programáticamente: mostramos instrucciones
      const timer = setTimeout(() => {
        setPlatform("ios");
        setShow(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Android/Chrome expone un evento nativo que podemos disparar nosotros
    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setShow(true);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  async function handleInstallClick() {
    if (platform === "android" && deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    }
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:left-4 sm:w-96 z-50">
      <div className="bg-ink-soft border border-parchment-dim/25 rounded-sm shadow-xl p-4 flex items-start gap-3">
        <Download size={18} className="text-crema shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-cream">Instalá la app</p>
          {platform === "ios" ? (
            <p className="font-mono text-[11px] text-parchment-dim mt-1 leading-relaxed">
              Tocá el ícono de <strong className="text-parchment">Compartir</strong> (el
              cuadrado con la flecha) y elegí{" "}
              <strong className="text-parchment">"Agregar a inicio"</strong>.
            </p>
          ) : (
            <p className="font-mono text-[11px] text-parchment-dim mt-1">
              Agregala a tu pantalla de inicio para abrirla como una app.
            </p>
          )}
          <div className="flex gap-2 mt-3">
            {platform === "android" && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-cascara hover:bg-cascara-light text-cream font-body text-xs rounded-sm transition-colors"
              >
                Instalar
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="px-3 py-1.5 border border-parchment-dim/25 hover:border-crema text-parchment font-body text-xs rounded-sm transition-colors"
            >
              {platform === "ios" ? "Entendido" : "Ahora no"}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="text-parchment-dim hover:text-cream transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
