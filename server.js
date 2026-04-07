require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CALLMEBOT_PHONE = process.env.CALLMEBOT_PHONE;
const CALLMEBOT_APIKEY = process.env.CALLMEBOT_APIKEY;
const CRON_SECRET = process.env.CRON_SECRET;

// ── Función para enviar WhatsApp ──────────────────────────────────────────────
async function sendWhatsApp(event) {
  const eventDate = new Date(event.event_date).toLocaleString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Caracas',
  });

  const message = `🔔 *Recordatorio: ${event.title}*\n\n📅 ${eventDate}\n📝 ${event.description || 'Sin descripción'}\n⏰ Alerta configurada ${event.alert_before_minutes} min antes`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_APIKEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CallMeBot error: ${await res.text()}`);
}

// ── Lógica de chequeo de alertas ──────────────────────────────────────────────
async function checkAlerts() {
  const now = new Date();
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('alert_sent', false)
    .gte('event_date', now.toISOString());

  if (error) throw error;

  const toAlert = events.filter((event) => {
    const alertTime = new Date(event.event_date).getTime() - event.alert_before_minutes * 60 * 1000;
    return now.getTime() >= alertTime;
  });

  let sent = 0;
  for (const event of toAlert) {
    try {
      await sendWhatsApp(event);
      await supabase.from('events').update({ alert_sent: true }).eq('id', event.id);
      sent++;
      console.log(`✅ Alerta enviada: "${event.title}"`);
    } catch (e) {
      console.error(`❌ Error enviando alerta para "${event.title}":`, e.message);
    }
  }

  return { checked: events.length, alertsSent: sent, timestamp: now.toISOString() };
}

// ── Endpoint manual ───────────────────────────────────────────────────────────
app.get('/api/check-alerts', async (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await checkAlerts();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Cron: lunes a viernes a las 10:00 AM hora Venezuela (UTC-4) ───────────────
// En local corre según el timezone de tu máquina.
// Si tu máquina está en UTC-4 (Venezuela), usa: '0 10 * * 1-5'
// Si tu máquina está en UTC, usa: '0 14 * * 1-5'
cron.schedule('0 10 * * 1-5', async () => {
  console.log(`🕙 Cron ejecutando a las ${new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' })} (hora Venezuela)`);
  try {
    const result = await checkAlerts();
    console.log(`📊 Resultado: ${result.alertsSent} alertas enviadas de ${result.checked} revisadas`);
  } catch (e) {
    console.error('Error en cron:', e.message);
  }
}, {
  timezone: 'America/Caracas'
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de alertas corriendo en http://localhost:${PORT}`);
  console.log(`🔔 Cron configurado: lunes a viernes 10:00 AM hora Venezuela`);
  console.log(`📡 Endpoint manual: GET http://localhost:${PORT}/api/check-alerts`);
});
