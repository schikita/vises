/**
 * Dual success wait for login captcha episodes (REQ-008 / DEC-004).
 * Register path keeps `#btnVerified`-only via `acceptLoginAuthSuccess=false`.
 * Login-auth path also accepts forced Change Password (`password_change`).
 */

export type PortalCaptchaEpisodeSuccessVia =
  | 'btnVerified'
  | 'login_auth'
  | 'password_change';

export type WaitForPortalCaptchaEpisodeSuccessResult = {
  ok: boolean;
  via?: PortalCaptchaEpisodeSuccessVia;
};
