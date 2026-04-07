export interface Client {
  id?: string;
  name: string;
  frequency_days: number;
  last_sent_at: string | null;
  alert_sent: boolean;
  notes?: string;
  created_at?: string;
}

export interface CreateClientDTO {
  name: string;
  frequency_days: number;
  notes?: string;
}

export type TrafficLight = 'green' | 'yellow' | 'red' | 'none';

export interface ClientStatus {
  light: TrafficLight;
  label: string;
  daysUntilDue: number | null;
  nextDueAt: Date | null;
}

export const FREQUENCY_OPTIONS = [
  { label: 'Diario', days: 1 },
  { label: 'Semanal', days: 7 },
  { label: 'Quincenal', days: 14 },
  { label: '3 semanas', days: 21 },
  { label: 'Mensual', days: 30 },
  { label: '45 días', days: 45 },
  { label: '2 meses', days: 60 },
  { label: 'Trimestral', days: 90 },
  { label: 'Personalizado', days: -1 },
];

export function getClientStatus(client: Client): ClientStatus {
  if (!client.last_sent_at) {
    return { light: 'none', label: 'Sin envíos', daysUntilDue: null, nextDueAt: null };
  }

  const lastSent = new Date(client.last_sent_at);
  const nextDue = new Date(lastSent.getTime() + client.frequency_days * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msUntilDue = nextDue.getTime() - now.getTime();
  const daysUntilDue = Math.ceil(msUntilDue / (1000 * 60 * 60 * 24));
  const pctRemaining = msUntilDue / (client.frequency_days * 24 * 60 * 60 * 1000);

  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);
    return {
      light: 'red',
      label: `Vencido hace ${overdueDays} día${overdueDays !== 1 ? 's' : ''}`,
      daysUntilDue,
      nextDueAt: nextDue,
    };
  }

  if (pctRemaining > 0.5) {
    return {
      light: 'green',
      label: `Faltan ${daysUntilDue} día${daysUntilDue !== 1 ? 's' : ''}`,
      daysUntilDue,
      nextDueAt: nextDue,
    };
  }

  if (pctRemaining > 0.2) {
    return {
      light: 'yellow',
      label: `Faltan ${daysUntilDue} día${daysUntilDue !== 1 ? 's' : ''}`,
      daysUntilDue,
      nextDueAt: nextDue,
    };
  }

  return {
    light: 'red',
    label: daysUntilDue === 0 ? '¡Hoy vence!' : `Faltan ${daysUntilDue} día${daysUntilDue !== 1 ? 's' : ''}`,
    daysUntilDue,
    nextDueAt: nextDue,
  };
}
