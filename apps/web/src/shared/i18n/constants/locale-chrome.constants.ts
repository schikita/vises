/** Shared chrome + language-control + error copy shape for `en` / `ru` catalogs. */
export const LOCALE_CHROME_EN = {
  chrome: {
    listPager: {
      pageOf: 'Page {{page}} of {{pageCount}}',
      shownRange: ' · showing {{start}}–{{end}}',
      previous: 'Previous',
      next: 'Next',
    },
    theme: {
      ariaLabel: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    dialog: {
      closeAriaLabel: 'Close',
    },
    avatar: {
      emptyInitials: '—',
    },
    language: {
      ariaLabel: 'Language',
      en: 'EN',
      ru: 'RU',
    },
    shell: {
      openMenu: 'Open navigation',
      closeMenu: 'Close navigation',
      navAriaLabel: 'Main navigation',
      userMenuAriaLabel: 'User menu',
      logout: 'Log out',
      badge: {
        admin: 'Admin',
        superadmin: 'Superadmin',
        agent: 'Agent',
      },
      nav: {
        home: 'Home',
        analytics: 'Analytics',
        users: 'Users',
        agents: 'Agents',
        clients: 'Clients',
        applications: 'Applications',
        settings: 'Settings',
        balance: 'Balance',
      },
      placeholder: {
        title: 'Coming soon',
        clientsText: 'Client list will appear here.',
        agentsText: 'Agent balances will appear here.',
        balanceText: 'Your balance and ledger will appear here.',
        agentHomeTitle: 'Agent workspace',
        agentHomeText: 'Manage your clients, applications, and balance from the navigation.',
      },
    },
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    entityGone: {
      client: 'This client no longer exists.',
      application: 'This application no longer exists.',
      agent: 'This agent no longer exists.',
    },
    rolesApplications: {
      insufficient_balance: 'Insufficient balance',
      forbidden_role: 'You do not have permission for this action',
      superadmin_exists: 'A superadmin already exists',
      illegal_transition: 'This status change is not allowed',
      passport_not_unlocked: 'Passport is not unlocked for editing',
      invalid_amount: 'Invalid amount',
      reason_required: 'A reason is required',
      not_agent: 'User is not an agent',
      client_not_found: 'Client not found',
      application_not_found: 'Application not found',
    },
  },
} as const

export const LOCALE_CHROME_RU = {
  chrome: {
    listPager: {
      pageOf: 'Страница {{page}} из {{pageCount}}',
      shownRange: ' · показано {{start}}–{{end}}',
      previous: 'Назад',
      next: 'Вперёд',
    },
    theme: {
      ariaLabel: 'Тема',
      light: 'Светлая',
      dark: 'Тёмная',
      system: 'Системная',
    },
    dialog: {
      closeAriaLabel: 'Закрыть',
    },
    avatar: {
      emptyInitials: '—',
    },
    language: {
      ariaLabel: 'Язык',
      en: 'EN',
      ru: 'RU',
    },
    shell: {
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
      navAriaLabel: 'Основная навигация',
      userMenuAriaLabel: 'Меню пользователя',
      logout: 'Выйти',
      badge: {
        admin: 'Админ',
        superadmin: 'Superadmin',
        agent: 'Агент',
      },
      nav: {
        home: 'Главная',
        analytics: 'Аналитика',
        users: 'Пользователи',
        agents: 'Агенты',
        clients: 'Клиенты',
        applications: 'Заявки',
        settings: 'Настройки',
        balance: 'Баланс',
      },
      placeholder: {
        title: 'Скоро',
        clientsText: 'Список клиентов появится здесь.',
        agentsText: 'Балансы агентов появятся здесь.',
        balanceText: 'Ваш баланс и история операций появятся здесь.',
        agentHomeTitle: 'Кабинет агента',
        agentHomeText: 'Управляйте клиентами, заявками и балансом через меню.',
      },
    },
  },
  errors: {
    generic: 'Что-то пошло не так. Попробуйте ещё раз.',
    entityGone: {
      client: 'Этот клиент больше не существует.',
      application: 'Эта заявка больше не существует.',
      agent: 'Этот агент больше не существует.',
    },
    rolesApplications: {
      insufficient_balance: 'Недостаточно средств на балансе',
      forbidden_role: 'Недостаточно прав для этого действия',
      superadmin_exists: 'Суперадминистратор уже существует',
      illegal_transition: 'Такое изменение статуса недопустимо',
      passport_not_unlocked: 'Паспорт не разблокирован для редактирования',
      invalid_amount: 'Некорректная сумма',
      reason_required: 'Укажите причину',
      not_agent: 'Пользователь не является агентом',
      client_not_found: 'Клиент не найден',
      application_not_found: 'Заявка не найдена',
    },
  },
} as const
