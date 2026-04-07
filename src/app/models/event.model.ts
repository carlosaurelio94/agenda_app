export interface AgendaEvent {
  id?: string;
  title: string;
  description?: string;
  event_date: string; // ISO datetime
  alert_before_minutes: number; // minutos antes del evento para alertar
  alert_sent: boolean;
  created_at?: string;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  event_date: string;
  alert_before_minutes: number;
}
