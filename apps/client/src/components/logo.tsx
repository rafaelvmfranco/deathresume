import { useTheme } from "@reactive-resume/hooks";
import { cn } from "@reactive-resume/utils";

type Props = {
  size?: number;
  setLight?: boolean;
  className?: string;
};

export const Logo = ({ size = 32, setLight = false, className }: Props) => {
  const { isDarkMode } = useTheme();

  let srcForMode = isDarkMode ? "src/assets/logos/logo-text-light.png" : "src/assets/logos/logo-text-bright.png" 

  if (setLight) srcForMode = "src/assets/logos/logo-text-light.png"
  
  return (
    <img
      src={srcForMode}
      style={{ width: '170px', height: 'auto', maxWidth: 'none' }}
      alt="Death Resume"
      className={cn("rounded-sm", className)}
    />
  );
};
