import { useTheme } from "@reactive-resume/hooks";
import { cn } from "@reactive-resume/utils";

type Props = {
  size?: number;
  className?: string;
};

export const Logo = ({ size = 32, className }: Props) => {
  const { isDarkMode } = useTheme();


  const srcForMode = isDarkMode ? "src/assets/logos/logo-text-light.png" : "src/assets/logos/logo-text-bright.png" 

  return (
    <img
      src={srcForMode}
      style={{ width: '170px', height: 'auto', maxWidth: 'none' }}
      alt="Death Resume"
      className={cn("rounded-sm", className)}
    />
  );
};
