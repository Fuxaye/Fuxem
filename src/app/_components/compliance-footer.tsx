import { openCookiePreferences } from '@/app/_components/cookie-consent'
import LegalLinks from '@/app/_components/legal-links'

export default function ComplianceFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 pt-6 text-xs leading-6 text-stone-400">
      <p>Adults only. You must be over 18. Public viewing is available here; member actions require an account.</p>
      <p className="mt-3">
        Support{' '}
        <a className="underline underline-offset-2 hover:text-stone-100" href="mailto:support@fuxem.xyz">
          support@fuxem.xyz
        </a>
        <span className="mx-2 text-stone-600">·</span>
        Privacy{' '}
        <a className="underline underline-offset-2 hover:text-stone-100" href="mailto:privacy@fuxem.xyz">
          privacy@fuxem.xyz
        </a>
        <span className="mx-2 text-stone-600">·</span>
        Copyright{' '}
        <a className="underline underline-offset-2 hover:text-stone-100" href="mailto:dmca@fuxem.xyz">
          dmca@fuxem.xyz
        </a>
        <span className="mx-2 text-stone-600">·</span>
        Compliance{' '}
        <a className="underline underline-offset-2 hover:text-stone-100" href="mailto:compliance@fuxem.xyz">
          compliance@fuxem.xyz
        </a>
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LegalLinks className="font-mono text-[10px] uppercase tracking-[0.12em]" />
        <button
          type="button"
          onClick={openCookiePreferences}
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone-400 transition hover:text-stone-100"
        >
          Cookie preferences
        </button>
      </div>
    </footer>
  )
}
