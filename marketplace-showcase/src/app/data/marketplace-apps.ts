export type AppItem = {
  id: string;
  title: string;
  desc: string;
  category: string;
  level: { label: string; tone?: string };
  badge?: string;
  imageUrl: string;
  features: string[];
  price: number;
  priceTone?: string;

  longDesc?: string;
  rating?: number;
  reviewsCount?: number;
  audiences?: string[];
  perks?: string[];
  plans?: {
    name: string;
    subtitle?: string;
    recommended?: boolean;
    priceLabel: string;
    bullets: string[];
    ctaLabel: string;
  }[];
  benefits?: {
    title: string;
    desc: string;
    tone: 'pink' | 'yellow' | 'green';
    icon: 'shield' | 'bolt' | 'trend';
  }[];
  ctaTitle?: string;
  ctaSubtitle?: string;
};

export const MARKETPLACE_APPS: AppItem[] = [
  {
    id: 'crm-vendas',
    title: 'CRM Vendas Worknex',
    desc: 'Gestão completa de vendas e relacionamento com clientes',
    category: 'Comercial & Atendimento',
    level: { label: 'Profissional', tone: 'pink' },
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80',
    features: [
      'Gestão de leads e pipeline',
      'Automação de follow-up',
      'Integração WhatsApp',
      'Relatórios de vendas',
      'Gestão de propostas',
      'Histórico de interações',
    ],
    price: 197,
    priceTone: 'pink',
    longDesc:
      'Sistema completo de CRM para gerenciar leads, oportunidades, pipeline de vendas e relacionamento com clientes. Inclui automação de follow-up, relatórios personalizados e integração com WhatsApp.',
    rating: 4.9,
    reviewsCount: 127,
    audiences: ['PME', 'Enterprise'],
    perks: ['Cancelamento gratuito', 'Garantia de 7 dias', 'Suporte prioritário'],

    plans: [
      {
        name: 'Start',
        subtitle: 'Para pequenos negócios',
        priceLabel: 'R$ 297/mês',
        bullets: [
          'Acesso a 1 aplicação',
          'Até 10 usuários',
          'Suporte padrão',
          'Atualizações automáticas',
          'Pagamento: Cartão, PIX ou Boleto',
        ],
        ctaLabel: 'Escolher Start',
      },
      {
        name: 'Growth',
        subtitle: 'Para empresas em expansão',
        recommended: true,
        priceLabel: 'R$ 197/mês',
        bullets: [
          'Acesso a múltiplas aplicações',
          'Usuários ilimitados',
          'Integrações avançadas',
          'Suporte prioritário',
          'Pagamento recorrente mensal',
        ],
        ctaLabel: 'Escolher Growth',
      },
      {
        name: 'Enterprise',
        subtitle: 'Para grandes empresas',
        priceLabel: 'Sob consulta',
        bullets: [
          'Aplicações dedicadas por área',
          'Customizações específicas',
          'SLA e governança',
          'Opção white label',
          'Contrato personalizado',
        ],
        ctaLabel: 'Escolher Enterprise',
      },
    ],

    benefits: [
      {
        title: '100% Seguro',
        desc: 'Dados protegidos com criptografia de ponta a ponta',
        tone: 'pink',
        icon: 'shield',
      },
      {
        title: 'Rápido e Fácil',
        desc: 'Comece a usar em minutos sem complicação',
        tone: 'yellow',
        icon: 'bolt',
      },
      {
        title: 'Escalável',
        desc: 'Cresce junto com o seu negócio',
        tone: 'green',
        icon: 'trend',
      },
    ],
    ctaTitle: 'Pronto para transformar seu negócio?',
    ctaSubtitle: 'Comece agora mesmo a usar CRM Vendas Worknex e veja os resultados',
  },

  {
    id: 'gestao-financeira-pro',
    title: 'Gestão Financeira Pro',
    desc: 'Controle total de fluxo de caixa e finanças',
    category: 'Financeiro & Administrativo',
    level: { label: 'Avançado', tone: 'yellow' },
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=80',
    features: ['Fluxo de caixa em tempo real', 'Contas a pagar e receber', 'Conciliação bancária automática'],
    price: 297,
    priceTone: 'cream',
    longDesc:
      'Controle completo de caixa, contas, conciliação e relatórios financeiros. Organize o administrativo com visibilidade total.',
    rating: 4.8,
    reviewsCount: 94,
    audiences: ['PME', 'Enterprise'],
    perks: ['Cancelamento gratuito', 'Garantia de 7 dias', 'Suporte prioritário'],

    plans: [
      {
        name: 'Start',
        subtitle: 'Para pequenos negócios',
        priceLabel: 'R$ 297/mês',
        bullets: ['Acesso a 1 aplicação', 'Até 10 usuários', 'Suporte padrão', 'Atualizações automáticas'],
        ctaLabel: 'Escolher Start',
      },
      {
        name: 'Growth',
        subtitle: 'Para empresas em expansão',
        recommended: true,
        priceLabel: 'R$ 397/mês',
        bullets: ['Acesso a múltiplas aplicações', 'Usuários ilimitados', 'Conciliação e relatórios', 'Suporte prioritário'],
        ctaLabel: 'Escolher Growth',
      },
      {
        name: 'Enterprise',
        subtitle: 'Para grandes empresas',
        priceLabel: 'Sob consulta',
        bullets: ['Governança', 'Auditoria', 'Integrações', 'Contrato personalizado'],
        ctaLabel: 'Escolher Enterprise',
      },
    ],

    benefits: [
      { title: '100% Seguro', desc: 'Dados financeiros protegidos', tone: 'pink', icon: 'shield' },
      { title: 'Rápido e Fácil', desc: 'Configuração simples', tone: 'yellow', icon: 'bolt' },
      { title: 'Escalável', desc: 'Acompanha o crescimento', tone: 'green', icon: 'trend' },
    ],
    ctaTitle: 'Pronto para ter controle total?',
    ctaSubtitle: 'Organize suas finanças e ganhe previsibilidade',
  },

  {
    id: 'rh-ponto-digital',
    title: 'RH & Ponto Digital',
    desc: 'Gestão de colaboradores e controle de ponto',
    category: 'RH & Pessoas',
    level: { label: 'Profissional', tone: 'green' },
    badge: 'Co-criado',
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=80',
    features: ['Controle de ponto digital', 'Gestão de férias e ausências', 'Folha de pagamento'],
    price: 147,
    priceTone: 'mint',
    longDesc:
      'Controle de ponto, férias, ausências e rotinas do time. Reduza burocracia e melhore a organização do RH.',
    rating: 4.7,
    reviewsCount: 61,
    audiences: ['PME'],
    perks: ['Cancelamento gratuito', 'Garantia de 7 dias', 'Suporte prioritário'],

    plans: [
      {
        name: 'Start',
        subtitle: 'Para pequenos negócios',
        priceLabel: 'R$ 147/mês',
        bullets: ['Controle de ponto', 'Até 10 usuários', 'Suporte padrão', 'Relatórios básicos'],
        ctaLabel: 'Escolher Start',
      },
      {
        name: 'Growth',
        subtitle: 'Para empresas em expansão',
        recommended: true,
        priceLabel: 'R$ 247/mês',
        bullets: ['Usuários ilimitados', 'Workflows', 'Permissões', 'Suporte prioritário'],
        ctaLabel: 'Escolher Growth',
      },
      {
        name: 'Enterprise',
        subtitle: 'Para grandes empresas',
        priceLabel: 'Sob consulta',
        bullets: ['White label', 'SLA', 'Integrações', 'Contrato personalizado'],
        ctaLabel: 'Escolher Enterprise',
      },
    ],

    benefits: [
      { title: '100% Seguro', desc: 'Dados do time protegidos', tone: 'pink', icon: 'shield' },
      { title: 'Rápido e Fácil', desc: 'Implantação simples', tone: 'yellow', icon: 'bolt' },
      { title: 'Escalável', desc: 'Acompanha seu time', tone: 'green', icon: 'trend' },
    ],
    ctaTitle: 'Pronto para organizar seu RH?',
    ctaSubtitle: 'Centralize rotinas e ganhe eficiência',
  },
];