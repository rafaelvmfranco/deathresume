import { Separator } from "@reactive-resume/ui";

import { LocaleSwitch } from "@/client/components/locale-switch";
import { ThemeSwitch } from "@/client/components/theme-switch";

export const Footer = () => (
  <footer className="bg-background">
    <Separator />
    <div className="my-24 flex justify-center items-center">
      <div>
        <LocaleSwitch />
        <ThemeSwitch />
      </div>
    </div>
  </footer>
);
