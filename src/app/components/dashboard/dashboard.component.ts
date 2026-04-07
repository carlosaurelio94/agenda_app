import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventFormComponent } from '../event-form/event-form.component';
import { EventListComponent } from '../event-list/event-list.component';
import { SupabaseService } from '../../services/supabase.service';
import { AgendaEvent, CreateEventDTO } from '../../models/event.model';

const CRON_SECRET = 'mi-agenda-secret-2024';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EventFormComponent, EventListComponent],
  template: `
    <app-event-form (eventCreated)="addEvent($event)" />

    <div class="section-header">
      <h2>Próximos eventos</h2>
      <div class="actions">
        <button class="refresh-btn" (click)="loadEvents()" [disabled]="loading">
          ↻ Refrescar
        </button>
        <button
          class="alert-btn"
          (click)="runAlerts()"
          [disabled]="alertRunning"
          [title]="'Verificar y enviar alertas ahora'"
        >
          {{ alertRunning ? 'Enviando...' : '🔔 Enviar alertas' }}
        </button>
      </div>
    </div>

    @if (alertMessage) {
      <div class="alert-feedback" [class.success]="alertSuccess" [class.error]="!alertSuccess">
        {{ alertMessage }}
      </div>
    }

    @if (loading) {
      <p class="loading">Cargando...</p>
    } @else {
      <app-event-list [events]="events" (onDelete)="deleteEvent($event)" />
    }

    @if (error) {
      <div class="error">{{ error }}</div>
    }
  `,
  styles: [`
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .section-header h2 {
      margin: 0;
      color: #334155;
      font-size: 1.2rem;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
    }
    .refresh-btn {
      background: none;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.3rem 0.8rem;
      color: #64748b;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .refresh-btn:hover:not(:disabled) {
      background: #f1f5f9;
    }
    .alert-btn {
      background: #22c55e;
      border: none;
      border-radius: 6px;
      padding: 0.3rem 0.9rem;
      color: white;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: background 0.2s;
    }
    .alert-btn:hover:not(:disabled) {
      background: #16a34a;
    }
    .alert-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .alert-feedback {
      margin-bottom: 1rem;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .alert-feedback.success {
      background: #dcfce7;
      color: #166534;
    }
    .alert-feedback.error {
      background: #fef2f2;
      color: #dc2626;
    }
    .loading {
      text-align: center;
      color: #94a3b8;
    }
    .error {
      margin-top: 1rem;
      padding: 0.8rem;
      background: #fef2f2;
      color: #dc2626;
      border-radius: 8px;
      font-size: 0.9rem;
    }
  `],
})
export class DashboardComponent implements OnInit {
  events: AgendaEvent[] = [];
  loading = true;
  error = '';
  alertRunning = false;
  alertMessage = '';
  alertSuccess = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.events = await this.supabaseService.getEvents();
    } catch (e: any) {
      this.error = 'Error cargando eventos: ' + e.message;
    } finally {
      this.loading = false;
    }
  }

  async addEvent(dto: CreateEventDTO): Promise<void> {
    try {
      await this.supabaseService.createEvent(dto);
      await this.loadEvents();
    } catch (e: any) {
      this.error = 'Error creando evento: ' + e.message;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await this.supabaseService.deleteEvent(id);
      this.events = this.events.filter((e) => e.id !== id);
    } catch (e: any) {
      this.error = 'Error eliminando evento: ' + e.message;
    }
  }

  async runAlerts(): Promise<void> {
    this.alertRunning = true;
    this.alertMessage = '';
    try {
      const res = await fetch('/api/check-alerts', {
        method: 'GET',
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      });
      const data = await res.json();
      if (res.ok) {
        this.alertSuccess = true;
        this.alertMessage = data.alertsSent > 0
          ? `✅ ${data.alertsSent} alerta(s) enviada(s) por WhatsApp`
          : `✅ Sin alertas pendientes (${data.checked} evento(s) revisados)`;
        await this.loadEvents(); // refrescar para ver alert_sent actualizado
      } else {
        this.alertSuccess = false;
        this.alertMessage = `Error: ${data.error}`;
      }
    } catch (e: any) {
      this.alertSuccess = false;
      this.alertMessage = 'Error conectando con el servidor';
    } finally {
      this.alertRunning = false;
      setTimeout(() => (this.alertMessage = ''), 5000);
    }
  }
}
