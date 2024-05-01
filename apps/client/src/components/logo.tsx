import { useTheme } from "@reactive-resume/hooks";
import { cn } from "@reactive-resume/utils";

type Props = {
  size?: number;
  setLight?: boolean;
  className?: string;
};

export const Logo = ({ size = 32, setLight = false, className }: Props) => {
  const { isDarkMode } = useTheme();

  let srcForMode = isDarkMode ? "deathresume/client/logo/logo-text-light.png" : "deathresume/client/logo/logo-text-bright.png" 

  if (setLight) srcForMode = "deathresume/client/logo/logo-text-light.png"
  
  return (
    <img
      src={srcForMode}
      style={{ width: '170px', height: 'auto', maxWidth: 'none' }}
      alt="Death Resume"
      className={cn("rounded-sm", className)}
    />
  );
};
