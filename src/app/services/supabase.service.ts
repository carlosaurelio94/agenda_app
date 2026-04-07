import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Client, CreateClientDTO } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getClients(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async createClient(dto: CreateClientDTO): Promise<Client> {
    const { data, error } = await this.supabase
      .from('clients')
      .insert({ ...dto, last_sent_at: null, alert_sent: false })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async markAsSent(id: string): Promise<Client> {
    const { data, error } = await this.supabase
      .from('clients')
      .update({ last_sent_at: new Date().toISOString(), alert_sent: false })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('clients')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async updateClient(id: string, dto: Partial<CreateClientDTO>): Promise<Client> {
    const { data, error } = await this.supabase
      .from('clients')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
