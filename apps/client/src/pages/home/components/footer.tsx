import { t } from "@lingui/macro";
import { Separator } from "@reactive-resume/ui";

import { LocaleSwitch } from "@/client/components/locale-switch";
import { Logo } from "@/client/components/logo";

import { ThemeSwitch } from "@/client/components/theme-switch";

export const Footer = () => (
  <footer className="bg-violet px-12 py-8">
    <div className="flex justify-between items-center">
      <Logo size={96} setLight={true} className="-ml-2" />
      <div>
        <LocaleSwitch setLight={true}/>
        <ThemeSwitch setLight={true}/>
      </div>
    </div>
</footer>
);
