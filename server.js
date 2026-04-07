require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CALLMEBOT_PHONE  = process.env.CALLMEBOT_PHONE;
const CALLMEBOT_APIKEY = process.env.CALLMEBOT_APIKEY;
const CRON_SECRET      = process.env.CRON_SECRET;

// ── WhatsApp ──────────────────────────────────────────────────────────────────
async function sendWhatsApp(message) {
  const phone = CALLMEBOT_PHONE.startsWith('+') ? CALLMEBOT_PHONE : `+${CALLMEBOT_PHONE}`;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_APIKEY}`;
  const res = await fetch(url);
  const body = await res.text();
  console.log(`📱 CallMeBot response [${res.status}]:`, body);
  if (!res.ok) throw new Error(`CallMeBot: ${body}`);
}

// ── Lógica de alertas ─────────────────────────────────────────────────────────
async function checkAlerts() {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('alert_sent', false);

  if (error) throw error;

  const now = new Date();
  let sent = 0;

  for (const client of clients) {
    let msg = null;

    // Cliente sin ningún envío registrado → alertar
    if (!client.last_sent_at) {
      msg = `⚪ Sin envíos: Nunca enviaste presupuesto a *${client.name}*\nFrecuencia configurada: cada ${client.frequency_days} días`;
    } else {
      const lastSent   = new Date(client.last_sent_at);
      const nextDue    = new Date(lastSent.getTime() + client.frequency_days * 24 * 60 * 60 * 1000);
      const msUntilDue = nextDue.getTime() - now.getTime();
      const daysUntilDue = msUntilDue / (1000 * 60 * 60 * 24);

      const nextDueStr = nextDue.toLocaleDateString('es-VE', {
        weekday: 'long', day: 'numeric', month: 'long',
        timeZone: 'America/Caracas',
      });

      // Alertar si vence en las próximas 24h o ya venció
      if (daysUntilDue < 0) {
        const overdue = Math.abs(Math.ceil(daysUntilDue));
        msg = `🔴 VENCIDO: Enviá el presupuesto a *${client.name}*\nVenció hace ${overdue} día${overdue !== 1 ? 's' : ''} (${nextDueStr})\nFrecuencia: cada ${client.frequency_days} días`;
      } else if (daysUntilDue <= 1) {
        msg = `🟡 Recordatorio: Enviá el presupuesto a *${client.name}*\nVence hoy/mañana: ${nextDueStr}\nFrecuencia: cada ${client.frequency_days} días`;
      }
    }

    if (msg) {
      try {
        await sendWhatsApp(msg);
        await supabase.from('clients').update({ alert_sent: true }).eq('id', client.id);
        sent++;
        console.log(`✅ Alerta enviada: "${client.name}"`);
      } catch (e) {
        console.error(`❌ Error alertando "${client.name}":`, e.message);
      }
    } else {
      console.log(`⏭ Sin alerta para "${client.name}" (aún no vence)`);
    }
  }

  return { checked: clients.length, alertsSent: sent };
}

// ── Endpoint ──────────────────────────────────────────────────────────────────
app.get('/api/check-alerts', async (req, res) => {
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await checkAlerts();
    res.json({ ...result, timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Cron: lunes a viernes 10am Venezuela ─────────────────────────────────────
cron.schedule('0 10 * * 1-5', async () => {
  const hora = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' });
  console.log(`🕙 Cron ejecutando: ${hora}`);
  try {
    const r = await checkAlerts();
    console.log(`📊 ${r.alertsSent} alertas enviadas de ${r.checked} revisadas`);
  } catch (e) {
    console.error('Error en cron:', e.message);
  }
}, { timezone: 'America/Caracas' });

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔔 Cron: lunes a viernes 10:00 AM (Venezuela)`);
  console.log(`📡 Endpoint: GET http://localhost:${PORT}/api/check-alerts`);
  console.log(`🌐 Frontend: http://localhost:4200\n`);
});
