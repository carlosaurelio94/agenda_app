import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateEventDTO } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="event-form">
      <div class="form-group">
        <label for="title">Título *</label>
        <input
          id="title"
          [(ngModel)]="event.title"
          name="title"
          required
          placeholder="Ej: Reunión con cliente"
        />
      </div>

      <div class="form-group">
        <label for="description">Descripción</label>
        <textarea
          id="description"
          [(ngModel)]="event.description"
          name="description"
          rows="2"
          placeholder="Detalles del evento..."
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="event_date">Fecha y hora *</label>
          <input
            id="event_date"
            type="datetime-local"
            [(ngModel)]="event.event_date"
            name="event_date"
            required
          />
        </div>

        <div class="form-group">
          <label for="alert_before">Alertar antes (min)</label>
          <select
            id="alert_before"
            [(ngModel)]="event.alert_before_minutes"
            name="alert_before_minutes"
          >
            <option [value]="5">5 minutos</option>
            <option [value]="15">15 minutos</option>
            <option [value]="30">30 minutos</option>
            <option [value]="60">1 hora</option>
            <option [value]="1440">1 día</option>
          </select>
        </div>
      </div>

      <button type="submit" [disabled]="!isValid()">+ Agregar evento</button>
    </form>
  `,
  styles: [`
    .event-form {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.3rem;
      color: #475569;
      font-size: 0.9rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .form-row .form-group {
      flex: 1;
    }
    input, textarea, select {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    button {
      width: 100%;
      padding: 0.7rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover:not(:disabled) {
      background: #2563eb;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
})
export class EventFormComponent {
  @Output() eventCreated = new EventEmitter<CreateEventDTO>();

  event: CreateEventDTO = {
    title: '',
    description: '',
    event_date: '',
    alert_before_minutes: 30,
  };

  isValid(): boolean {
    return !!this.event.title.trim() && !!this.event.event_date;
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    this.eventCreated.emit({
      ...this.event,
      event_date: new Date(this.event.event_date).toISOString(),
    });

    this.event = {
      title: '',
      description: '',
      event_date: '',
      alert_before_minutes: 30,
    };
  }
}
