import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ActivatedRouteSnapshot, ViewTransitionInfo, provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

// Datas e moedas no formato brasileiro (R$ 9.500,00)
registerLocaleData(localePt);

// Abrir o detalhe da vaga desliza para a direita; voltar desliza no sentido contrário.
// A direção vai em <html data-slide> e os estilos ficam em styles.scss
function slideDirection({ transition, from, to }: ViewTransitionInfo): void {
  const isDetail = (route: ActivatedRouteSnapshot) => route.firstChild?.routeConfig?.path === 'vagas/:id';
  const section = (route: ActivatedRouteSnapshot) => route.firstChild?.data['section'];
  // Troca de aba dentro da mesma seção: sem animação de página, só o sublinhado desliza
  const sameSection = !!section(to) && section(to) === section(from);
  const direction = sameSection ? 'tab' : isDetail(to) && !isDetail(from) ? 'forward' : isDetail(from) && !isDetail(to) ? 'back' : null;
  if (!direction) return;

  const root = document.documentElement;
  root.dataset['slide'] = direction;
  transition.finished.finally(() => delete root.dataset['slide']);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: parâmetros da rota (ex.: :id) viram input() do componente
    // withViewTransitions: animação entre páginas (estilos em styles.scss)
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withViewTransitions({ skipInitialTransition: true, onViewTransitionCreated: slideDirection }),
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ]
};
