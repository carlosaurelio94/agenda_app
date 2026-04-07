import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@env/environment';
import { AgendaEvent, CreateEventDTO } from '@models/event.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getEvents(): Promise<AgendaEvent[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getUpcomingEvents(): Promise<AgendaEvent[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .gte('event_date', now)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async createEvent(event: CreateEventDTO): Promise<AgendaEvent> {
    const { data, error } = await this.supabase
      .from('events')
      .insert({ ...event, alert_sent: false })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(id: string, event: Partial<AgendaEvent>): Promise<AgendaEvent> {
    const { data, error } = await this.supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
