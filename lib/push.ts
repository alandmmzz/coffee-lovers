import webpush from 'web-push';
import sql from './db';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:coffee-lovers@example.com';

let configured = false;
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  configured = true;
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

/**
 * Manda una notificación push a todos los usuarios suscriptos, excepto
 * a quien disparó la acción (por ejemplo, el que acaba de cargar la review).
 * Si una suscripción ya no es válida (410/404), se borra de la base.
 */
export async function sendPushToAllExcept(excludeEmail: string | null, payload: PushPayload) {
  if (!configured) {
    console.warn('VAPID keys no configuradas: no se van a enviar notificaciones push.');
    return;
  }

  let subscriptions: { id: string; endpoint: string; p256dh: string; auth: string }[] = [];
  try {
    subscriptions = (await sql`
      select id, endpoint, p256dh, auth from push_subscriptions
      where user_email is distinct from ${excludeEmail}
    `) as unknown as typeof subscriptions;
  } catch (err) {
    console.error('Error al leer suscripciones push:', err);
    return;
  }

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await sql`delete from push_subscriptions where id = ${sub.id}`;
        } else {
          console.error('Error al enviar push a', sub.endpoint, err);
        }
      }
    })
  );
}
