import { useTheme } from "@reactive-resume/hooks";
import { cn } from "@reactive-resume/utils";

type Props = {
  size?: number;
  className?: string;
};

export const Icon = ({ size = 32, className }: Props) => {
  const { isDarkMode } = useTheme();
  
  const srcForMode = isDarkMode ? "/deathresume/client/logo/logo-light.png" : "/deathresume/client/logo/logo-bright.png" 

  return (
    <img
      src={srcForMode}
      style={{ width: '80px', height: 'auto', maxWidth: 'none' }}
      alt="Death Resume"
      className={cn("rounded-sm", className)}
    />
  );
};
