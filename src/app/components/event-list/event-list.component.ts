import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaEvent } from '@models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-list">
      @if (events.length === 0) {
        <div class="empty-state">
          <p>No hay eventos. ¡Agregá uno!</p>
        </div>
      }

      @for (event of events; track event.id) {
        <div class="event-card" [class.past]="isPast(event)" [class.soon]="isSoon(event)">
          <div class="event-info">
            <div class="event-header">
              <h3>{{ event.title }}</h3>
              @if (isSoon(event)) {
                <span class="badge soon">Pronto</span>
              }
              @if (event.alert_sent) {
                <span class="badge sent">Alerta enviada</span>
              }
            </div>
            @if (event.description) {
              <p class="description">{{ event.description }}</p>
            }
            <div class="event-meta">
              <span>📅 {{ formatDate(event.event_date) }}</span>
              <span>🔔 {{ event.alert_before_minutes }} min antes</span>
            </div>
          </div>
          <button class="delete-btn" (click)="onDelete.emit(event.id!)" title="Eliminar">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .event-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #94a3b8;
      font-size: 1.1rem;
    }
    .event-card {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: white;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 1rem 1.2rem;
      transition: box-shadow 0.2s;
    }
    .event-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .event-card.past {
      opacity: 0.5;
      border-left-color: #94a3b8;
    }
    .event-card.soon {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .event-info { flex: 1; }
    .event-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .event-header h3 {
      margin: 0;
      font-size: 1.05rem;
      color: #1e293b;
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
      font-weight: 600;
    }
    .badge.soon {
      background: #fef3c7;
      color: #92400e;
    }
    .badge.sent {
      background: #dcfce7;
      color: #166534;
    }
    .description {
      margin: 0.3rem 0;
      color: #64748b;
      font-size: 0.9rem;
    }
    .event-meta {
      display: flex;
      gap: 1rem;
      margin-top: 0.4rem;
      font-size: 0.85rem;
      color: #64748b;
    }
    .delete-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .delete-btn:hover {
      background: #fee2e2;
      color: #dc2626;
    }
  `],
})
export class EventListComponent {
  @Input() events: AgendaEvent[] = [];
  @Output() onDelete = new EventEmitter<string>();

  isPast(event: AgendaEvent): boolean {
    return new Date(event.event_date) < new Date();
  }

  isSoon(event: AgendaEvent): boolean {
    const diff = new Date(event.event_date).getTime() - Date.now();
    return diff > 0 && diff < 24 * 60 * 60 * 1000; // próximas 24h
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
