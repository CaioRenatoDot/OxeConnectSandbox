import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './home/home';
import { JobDetail } from './jobs/job-detail/job-detail';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'vagas/:id', component: JobDetail, title: 'Detalhes da vaga' },
  { path: 'loja', component: Home },
];
