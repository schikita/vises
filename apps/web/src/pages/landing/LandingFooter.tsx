import { Link } from 'react-router-dom'
import { LANDING_COPY } from './constants'

export const LandingFooter = (): React.ReactElement => (
  <footer className="border-t border-border">
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-text-secondary sm:flex-row">
      <p>{LANDING_COPY.footerCopyright}</p>
      <nav className="flex items-center gap-4" aria-label="Footer">
        <Link className="hover:text-text-primary" to="/register">
          {LANDING_COPY.footerRegisterLabel}
        </Link>
      </nav>
    </div>
  </footer>
)
