export type LogoProps = {
  light?: boolean
  /**
   * Navigation target. Omit for public `/`. Pass role home when authenticated.
   * Pass `null` for a non-navigating mark (never links to login).
   */
  to?: string | null
}
