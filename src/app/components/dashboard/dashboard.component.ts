import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientCardComponent } from '../client-card/client-card.component';
import { ClientFormComponent } from '../client-form/client-form.component';
import { SupabaseService } from '../../services/supabase.service';
import { Client, CreateClientDTO, getClientStatus } from '../../models/client.model';

const CRON_SECRET = 'mi-agenda-secret-2024';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ClientCardComponent, ClientFormComponent],
  template: `
    <div class="dashboard">

      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat stat--red">
          <span class="stat-num">{{ countByLight('red') }}</span>
          <span class="stat-label">Vencidos</span>
        </div>
        <div class="stat stat--yellow">
          <span class="stat-num">{{ countByLight('yellow') }}</span>
          <span class="stat-label">Próximos</span>
        </div>
        <div class="stat stat--green">
          <span class="stat-num">{{ countByLight('green') }}</span>
          <span class="stat-label">Al día</span>
        </div>
        <div class="stat stat--none">
          <span class="stat-num">{{ countByLight('none') }}</span>
          <span class="stat-label">Sin envíos</span>
        </div>
      </div>

      <!-- Actions bar -->
      <div class="actions-bar">
        <app-client-form (clientCreated)="addClient($event)" />
        <div class="right-actions">
          <button class="btn-secondary" (click)="loadClients()" [disabled]="loading">
            ↻ Refrescar
          </button>
          <button class="btn-alert" (click)="runAlerts()" [disabled]="alertRunning">
            {{ alertRunning ? 'Enviando...' : '🔔 Enviar alertas' }}
          </button>
        </div>
      </div>

      @if (alertMessage) {
        <div class="feedback" [class.success]="alertSuccess" [class.error]="!alertSuccess">
          {{ alertMessage }}
        </div>
      }

      @if (error) {
        <div class="feedback error">{{ error }}</div>
      }

      <!-- Client list -->
      @if (loading) {
        <div class="loading">Cargando clientes...</div>
      } @else if (clients.length === 0) {
        <div class="empty">
          <p>No hay clientes aún.</p>
          <p>Agregá uno con el botón de arriba.</p>
        </div>
      } @else {
        <!-- Ordenados: vencidos primero, luego por días restantes -->
        @for (client of sortedClients; track client.id) {
          <app-client-card
            [client]="client"
            (onMarkSent)="markSent($event)"
            (onDelete)="deleteClient($event)"
          />
        }
      }
    </div>
  `,
  styles: [`
    .dashboard { padding-bottom: 3rem; }

    .stats-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .stat {
      flex: 1;
      background: #111;
      border: 1px solid #1f1f1f;
      border-radius: 10px;
      padding: 0.9rem 1rem;
      text-align: center;
    }
    .stat-num {
      display: block;
      font-size: 1.8rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.2rem;
    }
    .stat-label {
      font-size: 0.72rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat--red .stat-num    { color: #ef4444; }
    .stat--yellow .stat-num { color: #f59e0b; }
    .stat--green .stat-num  { color: #22c55e; }
    .stat--none .stat-num   { color: #475569; }

    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.2rem;
      flex-wrap: wrap;
    }
    .right-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .btn-secondary {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      color: #94a3b8;
      border-radius: 8px;
      padding: 0.55rem 1rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-secondary:hover:not(:disabled) {
      background: #222;
      color: #e2e8f0;
    }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-alert {
      background: #16a34a;
      border: none;
      color: white;
      border-radius: 8px;
      padding: 0.55rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-alert:hover:not(:disabled) { background: #15803d; }
    .btn-alert:disabled { opacity: 0.5; cursor: not-allowed; }

    .feedback {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .feedback.success { background: #052e16; color: #4ade80; border: 1px solid #166534; }
    .feedback.error   { background: #1c0a0a; color: #f87171; border: 1px solid #7f1d1d; }

    .loading, .empty {
      text-align: center;
      padding: 4rem 2rem;
      color: #374151;
    }
    .empty p { margin-bottom: 0.5rem; font-size: 1rem; }
    .empty p:first-child { font-size: 1.2rem; color: #4b5563; }
  `],
})
export class DashboardComponent implements OnInit {
  clients: Client[] = [];
  loading = true;
  error = '';
  alertRunning = false;
  alertMessage = '';
  alertSuccess = false;

  constructor(private supa: SupabaseService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  async loadClients(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.clients = await this.supa.getClients();
    } catch (e: any) {
      this.error = 'Error cargando clientes: ' + e.message;
    } finally {
      this.loading = false;
    }
  }

  get sortedClients(): Client[] {
    return [...this.clients].sort((a, b) => {
      const sa = getClientStatus(a);
      const sb = getClientStatus(b);
      const order = { red: 0, yellow: 1, none: 2, green: 3 };
      if (order[sa.light] !== order[sb.light]) return order[sa.light] - order[sb.light];
      const da = sa.daysUntilDue ?? 999;
      const db = sb.daysUntilDue ?? 999;
      return da - db;
    });
  }

  countByLight(light: string): number {
    return this.clients.filter(c => getClientStatus(c).light === light).length;
  }

  async addClient(dto: CreateClientDTO): Promise<void> {
    try {
      await this.supa.createClient(dto);
      await this.loadClients();
    } catch (e: any) {
      this.error = 'Error agregando cliente: ' + e.message;
    }
  }

  async markSent(id: string): Promise<void> {
    try {
      const updated = await this.supa.markAsSent(id);
      this.clients = this.clients.map(c => c.id === id ? updated : c);
    } catch (e: any) {
      this.error = 'Error marcando envío: ' + e.message;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      await this.supa.deleteClient(id);
      this.clients = this.clients.filter(c => c.id !== id);
    } catch (e: any) {
      this.error = 'Error eliminando cliente: ' + e.message;
    }
  }

  async runAlerts(): Promise<void> {
    this.alertRunning = true;
    this.alertMessage = '';
    try {
      const res = await fetch('/api/check-alerts', {
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      });
      const data = await res.json();
      if (res.ok) {
        this.alertSuccess = true;
        this.alertMessage = data.alertsSent > 0
          ? `✅ ${data.alertsSent} alerta(s) enviada(s) por WhatsApp`
          : `✅ Sin alertas pendientes (${data.checked} cliente(s) revisados)`;
        await this.loadClients();
      } else {
        this.alertSuccess = false;
        this.alertMessage = `Error: ${data.error}`;
      }
    } catch (e: any) {
      this.alertSuccess = false;
      this.alertMessage = 'No se pudo conectar con el servidor de alertas';
    } finally {
      this.alertRunning = false;
      setTimeout(() => (this.alertMessage = ''), 6000);
    }
  }
}
