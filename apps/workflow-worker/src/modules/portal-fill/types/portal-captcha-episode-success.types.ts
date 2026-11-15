/**
 * Dual success wait for login captcha episodes (REQ-008 / DEC-004).
 * Register path keeps `#btnVerified`-only via `acceptLoginAuthSuccess=false`.
 * Login-auth path also accepts forced Change Password (`password_change`).
 * Booking path (`acceptBookingSurfaceDismiss`) succeeds when captcha surface
 * is gone — materials document `#btnVerify` only, not `#btnVerified`
 * (REQ-013 / VT-TASK-008).
 */

export type PortalCaptchaEpisodeSuccessVia =
  | 'btnVerified'
  | 'login_auth'
  | 'password_change'
  | 'booking_surface_dismiss';

export type WaitForPortalCaptchaEpisodeSuccessResult = {
  ok: boolean;
  via?: PortalCaptchaEpisodeSuccessVia;
};
