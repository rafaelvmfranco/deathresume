import { t } from "@lingui/macro";
import { Separator } from "@reactive-resume/ui";

import { LocaleSwitch } from "@/client/components/locale-switch";
import { Logo } from "@/client/components/logo";
import { ThemeSwitch } from "@/client/components/theme-switch";

export const Footer = () => (
  <footer className="bg-background">
    <Separator />

    <div className="container grid py-12 sm:grid-cols-3 lg:grid-cols-4">
      <div className="flex flex-col gap-y-2">
        <Logo size={96} className="-ml-2" />

        <h2 className="text-xl font-medium">{t`Death Resume`}</h2>

        <p className="prose prose-sm prose-zinc leading-relaxed opacity-60 dark:prose-invert">
          {t`A free and open-source resume builder that simplifies the process of creating, updating, and sharing your resume.`}
        </p>

      </div>

      <div className="relative col-start-4">
        <div className="absolute bottom-0 right-0 lg:space-x-2">
          <LocaleSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </div>
  </footer>
);
