import { useLingui } from "@lingui/react";
import { Translate } from "@phosphor-icons/react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@reactive-resume/ui";
import { useState } from "react";

import { changeLanguage } from "../providers/locale";
import { LocaleCombobox } from "./locale-combobox";

type LocaleSwitchProps ={
  setLight?: boolean;
}
export const LocaleSwitch = ({setLight = false}) => {
  const { i18n } = useLingui();
  const [open, setOpen] = useState(false);

  const colorStyle: {
    variant: "ghost" | null;
    buttonClass: string;
    textClass: string;
  
  } = {
    variant: setLight ? null : "ghost",
    buttonClass: setLight ? "bg-violet hover:bg-violet" : "",
    textClass: setLight ? "text-white" : ""
  }

  return (
    <Popover open={open} onOpenChange={setOpen} >
      <PopoverTrigger asChild>
        <Button size="icon" variant={colorStyle.variant} className={colorStyle.buttonClass} >
          <Translate size={20} className={colorStyle.textClass}/>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <LocaleCombobox
          value={i18n.locale}
          onValueChange={async (locale) => {
            await changeLanguage(locale);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
