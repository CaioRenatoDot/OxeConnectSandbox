// Seções do menu lateral e as abas de cada uma.
// Rotas geradas: /<seção>/<aba> (ver app.routes.ts)
export interface SectionTab {
  slug: string;
  label: string;
  icon: string;
  description: string;
  // Rota própria quando a aba já tem uma tela pronta
  route?: string;
}

export interface Section {
  slug: string;
  label: string;
  icon: string;
  tabs: SectionTab[];
}

export const SECTIONS: Section[] = [
  {
    slug: 'vagas',
    label: 'Vagas',
    icon: 'work',
    tabs: [
      { slug: 'todas', label: 'Todas as vagas', icon: 'list', description: 'Acompanhe as vagas abertas e o andamento dos processos.', route: '/' },
      { slug: 'nova', label: 'Nova vaga', icon: 'add_circle', description: 'Cadastre uma nova vaga com stack, senioridade e faixa salarial.' },
      { slug: 'requisicoes', label: 'Requisições de vaga', icon: 'assignment', description: 'Pedidos de abertura de vaga feitos pelos gestores.' },
      { slug: 'banco', label: 'Banco de vagas', icon: 'inventory_2', description: 'Modelos de vagas para reaproveitar em novas aberturas.' },
    ],
  },
  {
    slug: 'candidatos',
    label: 'Candidatos',
    icon: 'person_search',
    tabs: [
      { slug: 'talentos', label: 'Banco de talentos', icon: 'groups', description: 'Todos os candidatos que já passaram pelos processos.' },
      { slug: 'triagem', label: 'Triagem de currículos', icon: 'filter_alt', description: 'Currículos aguardando análise da IA ou do recrutador.' },
      { slug: 'testes', label: 'Testes técnicos', icon: 'code', description: 'Testes enviados, pendentes e corrigidos.' },
      { slug: 'favoritos', label: 'Favoritos', icon: 'star', description: 'Candidatos marcados para acompanhar de perto.' },
    ],
  },
  {
    slug: 'processo',
    label: 'Processo seletivo',
    icon: 'view_kanban',
    tabs: [
      { slug: 'pipeline', label: 'Pipeline', icon: 'view_kanban', description: 'Visão em quadro dos candidatos por etapa.' },
      { slug: 'entrevistas', label: 'Entrevistas', icon: 'event', description: 'Agenda de entrevistas marcadas e realizadas.' },
      { slug: 'feedbacks', label: 'Feedbacks', icon: 'rate_review', description: 'Avaliações dos entrevistadores sobre cada candidato.' },
      { slug: 'propostas', label: 'Propostas', icon: 'request_quote', description: 'Propostas enviadas e respostas dos candidatos.' },
      { slug: 'contratacoes', label: 'Contratações', icon: 'how_to_reg', description: 'Candidatos contratados e status do onboarding.' },
    ],
  },
  {
    slug: 'relatorios',
    label: 'Relatórios',
    icon: 'bar_chart',
    tabs: [
      { slug: 'funil', label: 'Funil de recrutamento', icon: 'filter_list', description: 'Conversão de candidatos entre as etapas do processo.' },
      { slug: 'tempo', label: 'Tempo de contratação', icon: 'schedule', description: 'Quanto tempo cada vaga leva da abertura à contratação.' },
      { slug: 'origem', label: 'Origem dos candidatos', icon: 'travel_explore', description: 'De onde vêm os candidatos: LinkedIn, indicação, site...' },
    ],
  },
  {
    slug: 'configuracoes',
    label: 'Configurações',
    icon: 'settings',
    tabs: [
      { slug: 'recrutadores', label: 'Recrutadores', icon: 'badge', description: 'Equipe de recrutamento e permissões de acesso.' },
      { slug: 'etapas', label: 'Etapas do processo', icon: 'linear_scale', description: 'Personalize as etapas do funil de seleção.' },
      { slug: 'skills', label: 'Tecnologias e skills', icon: 'psychology', description: 'Catálogo de tecnologias avaliadas pela IA.' },
      { slug: 'integracoes', label: 'Integrações', icon: 'extension', description: 'Conecte LinkedIn, Gupy, Slack e outras ferramentas.' },
    ],
  },
];

export function tabLink(section: Section, tab: SectionTab): string {
  return tab.route ?? `/${section.slug}/${tab.slug}`;
}
