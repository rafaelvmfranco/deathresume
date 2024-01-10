import { t } from "@lingui/macro";
import { cn } from "@reactive-resume/utils";
import { useMemo } from "react";
import { Link, matchRoutes, Outlet, useLocation } from "react-router-dom";

import { LocaleSwitch } from "@/client/components/locale-switch";
import { Logo } from "@/client/components/logo";
import { ThemeSwitch } from "@/client/components/theme-switch";
import { useAuthProviders } from "@/client/services/auth/providers";

import { SocialAuth } from "./_components/social-auth";

const authRoutes = [{ path: "/auth/login" }, { path: "/auth/register" }];

const textAndRoutes = [
  {
    text: "Don't you have an account?",
    sourseRoute: "/auth/login",
    buttonText: "Create one now",
    route: "/auth/register",
  },
  {
    text: "Already have an account?",
    sourseRoute: "/auth/register",
    buttonText: "Sign in now",
    route: "/auth/login",
  },
  {
    text: "",
    sourseRoute: "/auth/forgot-password",
    buttonText: "Back",
    route: "/auth/login",
  },
];

export const AuthLayout = () => {
  const location = useLocation();
  const { providers } = useAuthProviders();
  const isAuthRoute = useMemo(() => matchRoutes(authRoutes, location) !== null, [location]);

  if (!providers) return null;

  // Condition (providers.length === 1) hides the divider if providers[] includes only "email"
  const hideDivider = !providers.includes("email") || providers.length === 1;

  const textAndRoute = textAndRoutes.find((item) => item.sourseRoute === location.pathname);

  return (
    <div className="flex h-screen w-screen">
      <div className="fixed top-0 left-0 w-full py-3 flex items-center justify-between z-10">
        <div className="px-8 lg:px-28">
          <Link to="/">
            <Logo setLight={true} size={48} />
          </Link>
        </div>
        <div className="flex gap-8 px-20 text-white">
          <div className="my-auto">{textAndRoute.text}</div>

          <Link to={textAndRoute.route}>
            <button className="text-reddish font-bold uppercase text-white border border-white rounded py-2 px-4">
              {textAndRoute.buttonText}
            </button>
          </Link>
        </div>
      </div>

      <div class="fixed w-full h-1/2 bg-violet"></div>

      <div className="w-full my-auto flex flex-col justify-center gap-y-8 p-4 sm:mx-auto sm:basis-[420px] 
      sm:px-0 lg:basis-[480px] z-20 rounded-xl bg-white border border-black dark:text-black"
      >
        <Outlet />

        {isAuthRoute && (
          <>
            <div className={cn("flex items-center gap-x-4", hideDivider && "hidden")}>
              <hr className="flex-1" />
              <span className="text-xs font-medium">
                {t({
                  message: "or continue with",
                  context:
                    "The user can either login with email/password, or continue with Google.",
                })}
              </span>
              <hr className="flex-1" />
            </div>

            <SocialAuth />
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full h-24 flex justify-center items-center">
        <LocaleSwitch />
        <ThemeSwitch />
      </div>
    </div>
  );
};
