import { Wordmark } from "@/components/brand/Wordmark";
import { Link } from "@/lib/i18n/routing";
import { Github } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="container-wide grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Wordmark size={26} />
          <p className="mt-3 max-w-md text-sm text-fg-muted leading-relaxed">
            {t("made_with")} · {t("data_attribution")}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">탐색</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/races">
                대회
              </Link>
            </li>
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/calendar">
                캘린더
              </Link>
            </li>
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/map">
                지도
              </Link>
            </li>
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/countries">
                국가별
              </Link>
            </li>
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/trail">
                트레일
              </Link>
            </li>
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/insights">
                인사이트
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">정보</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/about">
                소개
              </Link>
            </li>
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/legal/privacy">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link className="text-fg-muted hover:text-fg" href="/legal/terms">
                {t("terms")}
              </Link>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
                href="https://github.com/gomdolkim/RunningApi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-3.5" />
                {t("github")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-wide border-t border-border py-6">
        <p className="text-xs text-fg-subtle tabular">
          © {new Date().getFullYear()} RaceVerse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
