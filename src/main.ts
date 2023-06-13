import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  styles: [
    `
    nav {
      display: flex;
      column-gap: 1rem;
      margin: 1rem 0;
    }
    a {
      padding: 0.5rem;
    }
    .active {
      background-color: black;
      color: white
    }
  `,
  ],
  template: `
    <nav>
      <a [routerLink]="['/', 'todos-old']" [routerLinkActive]="'active'" [queryParamsHandling]="'preserve'">Old</a>
      <a [routerLink]="['/', 'todos-new']" [routerLinkActive]="'active'" [queryParamsHandling]="'preserve'">New</a>
    </nav>
    <router-outlet />
  `,
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App, {
  providers: [
    provideRouter([
      {
        path: 'todos-old',
        loadComponent: () => import('./todos-old.component'),
      },
      {
        path: 'todos-new',
        loadComponent: () => import('./todos-new.component'),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'todos-old',
      },
    ]),
  ],
});
