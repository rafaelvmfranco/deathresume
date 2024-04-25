import { CloudSun, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "@reactive-resume/hooks";
import { Button } from "@reactive-resume/ui";
import { motion, Variants } from "framer-motion";
import { useMemo } from "react";

type Props = {
  size?: number;
  setLight?: boolean;

};

export const ThemeSwitch = ({ size = 20, setLight = false }: Props) => {
  const { theme, toggleTheme } = useTheme();

  const variants: Variants = useMemo(() => {
    return {
      light: { x: 0 },
      system: { x: size * -1 },
      dark: { x: size * -2 },
    };
  }, [size]);

  const colorStyle: {
    variant: "ghost" | null,
    buttonClass: string;
  
  } = {
    variant: setLight ? null : "ghost",
    buttonClass: setLight ? "bg-violet hover:bg-violet" : ""
  }

  return (
    <Button size="icon" variant={colorStyle.variant} onClick={toggleTheme} className={colorStyle.buttonClass}>
      <div className="cursor-pointer overflow-hidden" style={{ width: size, height: size }} >
        <motion.div animate={theme} variants={variants} className="flex" >
          <Sun size={size} className="shrink-0" />
          <CloudSun size={size} className="shrink-0"/>
          <Moon size={size} color="white" className="shrink-0"/>
        </motion.div>
      </div>
    </Button>
  );
};
