import { Routes } from '@angular/router';
import { PublicJob } from './careers/public-job';
import { Dashboard } from './dashboard/dashboard';
import { JobDetail } from './jobs/job-detail/job-detail';
import { SectionPage } from './sections/section-page';
import { SECTIONS } from './sections/sections';

// Uma rota por aba de cada seção do menu (abas com tela própria ficam de fora)
const sectionRoutes: Routes = SECTIONS.flatMap((section) => [
  { path: section.slug, redirectTo: `${section.slug}/${section.tabs.find((t) => !t.route)!.slug}`, pathMatch: 'full' as const },
  ...section.tabs
    .filter((tab) => !tab.route)
    .map((tab) => ({
      path: `${section.slug}/${tab.slug}`,
      component: SectionPage,
      title: `${tab.label} · ${section.label}`,
      data: { section: section.slug, tab: tab.slug },
    })),
]);

export const routes: Routes = [
  { path: '', component: Dashboard },
  ...sectionRoutes,
  { path: 'vagas/:id', component: JobDetail, title: 'Detalhes da vaga' },
  // Página pública da vaga (sem sidebar; ver app.html)
  { path: 'carreiras/vagas/:id', component: PublicJob, title: 'Vaga · Trabalhe conosco' },
];
