import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header>
        <div class="header-inner">
          <span class="logo">💼</span>
          <h1>Control de Presupuestoss</h1>
        </div>
      </header>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
    }
    header {
      padding: 1.5rem 0 1rem;
      border-bottom: 1px solid #1f1f1f;
      margin-bottom: 2rem;
    }
    .header-inner {
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }
    .logo {
      font-size: 1.6rem;
    }
    h1 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: -0.3px;
    }
  `],
})
export class AppComponent {}
