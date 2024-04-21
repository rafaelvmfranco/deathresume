import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";
import { PlanDto } from "@reactive-resume/dto";
import {
  transformPlan,
  useGetPlans,
  ifStartCheckout,
  isSubscribedToFreePlan,
} from "@/client/services/plans";
import { useGetSubscription } from "@/client/services/subscription";
import { useUpdateSubscription } from "@/client/services/subscription/update";
import { useCreateSubscription } from "@/client/services/subscription/create";
import { toast } from "@/client/hooks/use-toast";

export const PlansPage = () => {
  const navigate = useNavigate();
  const { plans, error } = useGetPlans();
  const { subscription } = useGetSubscription();
  const { loading, createSubscription } = useCreateSubscription();
  const { updateLoading, updateSubscription } = useUpdateSubscription();
  
  const [billingPeriodCode, setBillingPeriodCode] = useState<number>(0);
  const currentPeriod = !billingPeriodCode ? "month" : "year";

  const currentPlans =
    plans && subscription && !error
      ? plans.map((plan: PlanDto) => transformPlan(plan, currentPeriod))
      : [];

  const handleSubscription = async (plan: any) => {
    if (subscription) {
      const isStart = ifStartCheckout(plan);
      if (!isStart) return;

      if (isSubscribedToFreePlan(subscription)) {
        const url = await createSubscription({
          stripePriceId: plan.stripePriceId
        });
        if (url) window.location.href = url;
        return;
      }

      const response = await updateSubscription({
        stripePriceId: plan.stripePriceId,
        subscriptionId: subscription.payment?.subscriptionId || "",
      });
      if (response) {
        setTimeout(() => {
          navigate("/dashboard/resumes");
        }, 2000);

        toast({
          variant: "success",
          title: `Subscription updated.`,
          description: `You are now subscribed to ${plan.name} per ${currentPeriod} plan.  `,
        });
      }
    }
  };
  
  return (
    <>
      <Helmet>
        <title>
          {t`Plans`} - {t`Death Resume`}
        </title>
      </Helmet>

      {updateLoading && (
        <div role="status" className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <svg
            aria-hidden="true"
            className="w-24 h-24 text-gray-200 animate-spin dark:text-gray-600 fill-violet"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      )}

      <div className="min-h-screen w-screen py-12 px-24 bg-violet text-white dark:bg-black">
        <div className="">
          <Link to="/dashboard">
            <button className="text-xl text-white">{"\u003C"} &nbsp; Back</button>
          </Link>
        </div>

        <div className="mt-8 flex justify-center">
          <div>
            <div className="flex gap-4">
              <div>
                <label htmlFor="slider" className="block text-sm font-bold mb-2">
                  Billed montly
                </label>
              </div>
              <input
                type="range"
                id="slider"
                name="slider"
                min="0"
                max="1"
                step="1"
                value={billingPeriodCode}
                className="w-12 p-1 appearance-none bg-reddish rounded-full outline-none slider-track:accent-white slider-track:h-5"
                onChange={(event) => setBillingPeriodCode(+event.target.value)}
              />
              <div>
                <label htmlFor="slider" className="block text-sm font-semibold mb-2">
                  Billed annualy
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {currentPlans.length > 0 &&
            currentPlans.map((plan) => (
              <div
                key={plan.name + currentPeriod}
                className={
                  plan.isHighlighted
                    ? "bg-mediumViolet border-mediumViolet dark:bg-darkGray border-darkGray border-opacity-0 rounded py-4 px-6"
                    : "py-4 px-6"
                }
              >
                <div className="h-6 inline bg-violet dark:bg-black order-darkGray border-opacity-0 px-1 text-xs rounded">
                  {plan.label}
                </div>
                <h3 className="text-2xl font-bold leading-relaxed tracking-tight">{t`${plan.title}`}</h3>
                <p className="text-4xl">{plan.price}</p>
                <p>
                  <button
                    disabled={loading || updateLoading}
                    onClick={() => handleSubscription(plan)}
                    className="bg-reddish rounded-md px-4 py-2 text-white text-lg"
                  >
                    {plan.buttonText}
                  </button>
                </p>

                <p> {plan.includes}</p>
                <p className="flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-check-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                  </svg>
                  {plan.resumes}
                </p>
                <p className="flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-check-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                  </svg>
                  {plan.downloads}
                </p>
                <p className="flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-check-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                  </svg>
                  {plan.views}
                </p>
                <p className="flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-check-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                  </svg>
                  {plan.sharing}
                </p>
                <p className="flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-check-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                  </svg>
                  {plan.alWords}
                </p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};
