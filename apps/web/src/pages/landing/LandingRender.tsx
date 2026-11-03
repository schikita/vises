import { homePath } from '@/entities/session'
import { Btn, Logo } from '@/shared/ui'
import { LANDING_COPY } from './constants'
import { LandingFooter } from './LandingFooter'
import type { LandingRenderProps } from './types'

export const LandingRender = ({
  session,
  loginForm,
}: LandingRenderProps): React.ReactElement => (
  <div className="flex min-h-screen flex-col bg-background">
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
      <Logo />
      {session ? (
        <Btn to={homePath(session.role)} variant="ghost">
          {LANDING_COPY.goToCabinet}
        </Btn>
      ) : null}
    </header>

    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5 pb-16 pt-10 text-center sm:pt-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {LANDING_COPY.eyebrow}
      </p>
      <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
        {LANDING_COPY.headline}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
        {LANDING_COPY.subtitle}
      </p>

      <div className="mt-10 w-full max-w-md text-left">{loginForm}</div>
    </section>

    <LandingFooter />
  </div>
)
