import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header>
        <h1>📅 Mi Agenda</h1>
      </header>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    header {
      text-align: center;
      padding: 1.5rem 0;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 2rem;
    }
    header h1 {
      margin: 0;
      color: #1e293b;
      font-size: 1.8rem;
    }
  `],
})
export class AppComponent {}
