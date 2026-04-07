import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client, getClientStatus, FREQUENCY_OPTIONS } from '../../models/client.model';

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class]="'card--' + status.light">
      <div class="card-left">
        <div class="traffic-light" [class]="'light--' + status.light">
          <span class="dot"></span>
        </div>
      </div>

      <div class="card-body">
        <div class="card-header">
          <h3 class="name">{{ client.name }}</h3>
          <span class="frequency">↻ {{ getFrequencyLabel(client.frequency_days) }}</span>
        </div>

        <div class="status-row">
          <span class="status-label" [class]="'label--' + status.light">
            {{ status.label }}
          </span>
          @if (status.nextDueAt) {
            <span class="next-due">
              Próximo: {{ formatDate(status.nextDueAt) }}
            </span>
          }
        </div>

        @if (client.last_sent_at) {
          <div class="last-sent">
            Último envío: {{ formatDate(new Date(client.last_sent_at)) }}
          </div>
        } @else {
          <div class="last-sent never">Sin envíos registrados</div>
        }

        @if (client.notes) {
          <div class="notes">{{ client.notes }}</div>
        }
      </div>

      <div class="card-actions">
        <button class="btn-sent" (click)="onMarkSent.emit(client.id!)" title="Marcar presupuesto como enviado">
          ✓ Enviado
        </button>
        <button class="btn-delete" (click)="onDelete.emit(client.id!)" title="Eliminar cliente">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card {
      display: flex;
      align-items: stretch;
      background: #141414;
      border: 1px solid #222;
      border-radius: 12px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
      margin-bottom: 0.75rem;
    }
    .card:hover {
      box-shadow: 0 0 0 1px #333;
    }
    .card--green { border-left: 3px solid #22c55e; }
    .card--yellow { border-left: 3px solid #f59e0b; }
    .card--red { border-left: 3px solid #ef4444; }
    .card--none { border-left: 3px solid #475569; }

    .card-left {
      display: flex;
      align-items: center;
      padding: 0 1rem;
      background: #0f0f0f;
    }

    .traffic-light {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .light--green  { background: #22c55e; box-shadow: 0 0 8px #22c55e88; }
    .light--yellow { background: #f59e0b; box-shadow: 0 0 8px #f59e0b88; }
    .light--red    { background: #ef4444; box-shadow: 0 0 8px #ef444488; animation: pulse 1.5s infinite; }
    .light--none   { background: #475569; }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 6px #ef444466; }
      50%       { box-shadow: 0 0 14px #ef4444cc; }
    }

    .card-body {
      flex: 1;
      padding: 1rem 1.2rem;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 0.4rem;
    }
    .name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #f1f5f9;
    }
    .frequency {
      font-size: 0.75rem;
      color: #64748b;
      background: #1e1e1e;
      padding: 0.15rem 0.5rem;
      border-radius: 20px;
    }

    .status-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.3rem;
    }
    .status-label {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .label--green  { color: #22c55e; }
    .label--yellow { color: #f59e0b; }
    .label--red    { color: #ef4444; }
    .label--none   { color: #64748b; }

    .next-due {
      font-size: 0.78rem;
      color: #475569;
    }
    .last-sent {
      font-size: 0.78rem;
      color: #475569;
      margin-top: 0.2rem;
    }
    .last-sent.never {
      color: #374151;
      font-style: italic;
    }
    .notes {
      margin-top: 0.4rem;
      font-size: 0.8rem;
      color: #4b5563;
      font-style: italic;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 0.8rem;
      justify-content: center;
    }
    .btn-sent {
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 7px;
      padding: 0.4rem 0.9rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .btn-sent:hover { background: #15803d; }
    .btn-delete {
      background: none;
      border: 1px solid #2a2a2a;
      color: #475569;
      border-radius: 7px;
      padding: 0.3rem 0.7rem;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-delete:hover {
      background: #1f1f1f;
      color: #ef4444;
      border-color: #ef4444;
    }
  `],
})
export class ClientCardComponent {
  @Input() client!: Client;
  @Output() onMarkSent = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  get status() {
    return getClientStatus(this.client);
  }

  getFrequencyLabel(days: number): string {
    return FREQUENCY_OPTIONS.find(f => f.days === days)?.label ?? `${days} días`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-VE', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  protected readonly new = (d: string) => new Date(d);
  protected readonly Date = Date;
}
