import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateClientDTO, FREQUENCY_OPTIONS } from '../../models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-wrapper" [class.open]="open">
      <button class="toggle-btn" (click)="open = !open">
        {{ open ? '✕ Cerrar' : '+ Agregar cliente' }}
      </button>

      @if (open) {
        <form class="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="field">
              <label>Nombre del cliente *</label>
              <input
                [(ngModel)]="dto.name"
                name="name"
                required
                placeholder="Ej: Empresa ABC"
                autofocus
              />
            </div>
            <div class="field field--sm">
              <label>Frecuencia *</label>
              <select [(ngModel)]="dto.frequency_days" name="frequency_days">
                @for (opt of frequencyOptions; track opt.days) {
                  <option [value]="opt.days">{{ opt.label }}</option>
                }
              </select>
            </div>
          </div>

          <div class="field">
            <label>Notas (opcional)</label>
            <input
              [(ngModel)]="dto.notes"
              name="notes"
              placeholder="Ej: Contacto: Juan, producto X"
            />
          </div>

          <button type="submit" class="submit-btn" [disabled]="!dto.name.trim()">
            Agregar cliente
          </button>
        </form>
      }
    </div>
  `,
  styles: [`
    .form-wrapper {
      margin-bottom: 2rem;
    }
    .toggle-btn {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      color: #94a3b8;
      border-radius: 8px;
      padding: 0.55rem 1.1rem;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.15s;
      margin-bottom: 0;
    }
    .toggle-btn:hover {
      background: #222;
      color: #e2e8f0;
      border-color: #3f3f3f;
    }
    .form-wrapper.open .toggle-btn {
      margin-bottom: 1rem;
      color: #64748b;
    }
    .form {
      background: #111;
      border: 1px solid #1f1f1f;
      border-radius: 12px;
      padding: 1.2rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.8rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-bottom: 0.8rem;
    }
    .field--sm { flex: 0 0 160px; }
    label {
      font-size: 0.78rem;
      color: #64748b;
      margin-bottom: 0.3rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input, select {
      background: #0f0f0f;
      border: 1px solid #2a2a2a;
      border-radius: 7px;
      color: #e2e8f0;
      padding: 0.55rem 0.8rem;
      font-size: 0.95rem;
      width: 100%;
      transition: border-color 0.15s;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #3b82f6;
    }
    input::placeholder { color: #374151; }
    select option { background: #1a1a1a; }
    .submit-btn {
      width: 100%;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.65rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      margin-top: 0.3rem;
    }
    .submit-btn:hover:not(:disabled) { background: #2563eb; }
    .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class ClientFormComponent {
  @Output() clientCreated = new EventEmitter<CreateClientDTO>();

  open = false;
  frequencyOptions = FREQUENCY_OPTIONS;

  dto: CreateClientDTO = {
    name: '',
    frequency_days: 14,
    notes: '',
  };

  onSubmit(): void {
    if (!this.dto.name.trim()) return;
    this.clientCreated.emit({ ...this.dto });
    this.dto = { name: '', frequency_days: 14, notes: '' };
    this.open = false;
  }
}
