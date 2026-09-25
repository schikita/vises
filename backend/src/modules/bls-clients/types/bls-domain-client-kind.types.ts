/**
 * Domain client kind selected by the workflow task executor dispatcher (DEC-008).
 * Maps step/task keys onto register / login / password-change / status / booking.
 */
export type BlsDomainClientKind =
  | 'register'
  | 'login'
  | 'password_change'
  | 'status'
  | 'booking';
