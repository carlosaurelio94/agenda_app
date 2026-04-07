import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_KEY']!
);

const CALLMEBOT_PHONE = process.env['CALLMEBOT_PHONE']!; // tu número con código de país, ej: 5491112345678
const CALLMEBOT_APIKEY = process.env['CALLMEBOT_APIKEY']!; // la API key que te da CallMeBot

interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  alert_before_minutes: number;
  alert_sent: boolean;
}

async function sendWhatsApp(event: AgendaEvent): Promise<void> {
  const eventDate = new Date(event.event_date).toLocaleString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `🔔 *Recordatorio: ${event.title}*\n\n📅 ${eventDate}\n📝 ${event.description || 'Sin descripción'}\n⏰ Alerta configurada ${event.alert_before_minutes} min antes`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_APIKEY}`;

  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`CallMeBot error: ${error}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env['CRON_SECRET']}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('alert_sent', false)
      .gte('event_date', now.toISOString());

    if (error) throw error;

    const eventsToAlert = (events as AgendaEvent[]).filter((event) => {
      const eventTime = new Date(event.event_date).getTime();
      const alertTime = eventTime - event.alert_before_minutes * 60 * 1000;
      return now.getTime() >= alertTime;
    });

    let sent = 0;
    for (const event of eventsToAlert) {
      try {
        await sendWhatsApp(event);
        await supabase
          .from('events')
          .update({ alert_sent: true })
          .eq('id', event.id);
        sent++;
      } catch (e) {
        console.error(`Error enviando alerta para "${event.title}":`, e);
      }
    }

    return res.status(200).json({
      checked: events?.length ?? 0,
      alertsSent: sent,
      timestamp: now.toISOString(),
    });
  } catch (e: any) {
    console.error('Error en check-alerts:', e);
    return res.status(500).json({ error: e.message });
  }
}
