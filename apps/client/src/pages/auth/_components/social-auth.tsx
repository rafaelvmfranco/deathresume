import { t } from "@lingui/macro";
import { GithubLogo, GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui";

import { useAuthProviders } from "@/client/services/auth/providers";

export const SocialAuth = () => {
  const { providers } = useAuthProviders();

  if (!providers || providers.length === 0) return null;

  return (
    <div className="w-full flex align-center justify-center dark:text-white">
      {providers.includes("google") && (
        <Button
          asChild
          size="lg"
          className="w-80 !bg-[#4285F4] !text-white hover:!bg-[#4285F4]/80 rounded no-underline font-bold"
        >
          <a href="/api/auth/google">
            <GoogleLogo className="mr-3 h-4 w-4" />
            {t`Google`}
          </a>
        </Button>
      )}
    </div>
  );
};
