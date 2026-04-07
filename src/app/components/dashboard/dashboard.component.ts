import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventFormComponent } from '../event-form/event-form.component';
import { EventListComponent } from '../event-list/event-list.component';
import { SupabaseService } from '@services/supabase.service';
import { AgendaEvent, CreateEventDTO } from '@models/event.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EventFormComponent, EventListComponent],
  template: `
    <app-event-form (eventCreated)="addEvent($event)" />

    <div class="section-header">
      <h2>Próximos eventos</h2>
      <button class="refresh-btn" (click)="loadEvents()">↻ Refrescar</button>
    </div>

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
    .refresh-btn {
      background: none;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.3rem 0.8rem;
      color: #64748b;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .refresh-btn:hover {
      background: #f1f5f9;
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
}
