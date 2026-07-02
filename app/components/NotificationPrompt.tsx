"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, X } from "lucide-react";

const DISMISS_KEY = "cl_notif_prompt_dismissed";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationPrompt() {
  const { status } = useSession();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    // Si ya se aceptó o se rechazó antes (a nivel navegador), no insistimos.
    if (Notification.permission !== "default") return;

    const timer = setTimeout(() => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          const sub = await reg.pushManager.getSubscription();
          if (!sub) setShow(true);
        })
        .catch(() => {});
    }, 1200);

    return () => clearTimeout(timer);
  }, [status]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  async function handleActivate() {
    setLoading(true);
    try {
      // Primera llamada async del handler: necesario para que Safari
      // siga considerando esto un gesto directo del usuario.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        dismiss();
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
        dismiss();
        return;
      }

      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      dismiss();
    } catch (err) {
      console.error("Error al activar notificaciones:", err);
      dismiss();
    } finally {
      setLoading(false);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-96 z-50">
      <div className="bg-ink-soft border border-parchment-dim/25 rounded-sm shadow-xl p-4 flex items-start gap-3">
        <Bell size={18} className="text-crema shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-cream">¿Activar notificaciones?</p>
          <p className="font-mono text-[11px] text-parchment-dim mt-1">
            Te avisamos cuando alguien cargue una review nueva.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleActivate}
              disabled={loading}
              className="px-3 py-1.5 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream font-body text-xs rounded-sm transition-colors"
            >
              {loading ? "Activando..." : "Sí, activar"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="px-3 py-1.5 border border-parchment-dim/25 hover:border-crema text-parchment font-body text-xs rounded-sm transition-colors"
            >
              Ahora no
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
