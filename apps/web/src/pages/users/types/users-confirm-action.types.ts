export type UsersConfirmAction =
  | { kind: 'reissue'; userId: string; userName: string }
  | { kind: 'toggleActive'; userId: string; userName: string; active: boolean }
  | { kind: 'remove'; userId: string; userName: string }
