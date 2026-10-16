import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Sidebar } from './sidebar/sidebar';

@Component({
  imports: [RouterOutlet, Sidebar],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);

  // Páginas públicas (site de carreiras) ficam fora do layout administrativo
  protected readonly isPublic = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/carreiras')),
    ),
    { initialValue: location.pathname.startsWith('/carreiras') },
  );
}
