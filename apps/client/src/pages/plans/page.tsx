import { useState } from "react";
import { Link } from "react-router-dom";
import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";

type PlanName = "free" | "plus" | "premium" | "enterprise";

type Period = "month" | "year";

type PlanMaxAmount = "price" | "resumesMax" | "downloadsMax" | "viewsMax" | "alWordsMax";

type Condition = {
  [key in PlanMaxAmount]: number | null;
};

type Plan = {
  name: PlanName;
  conditions: Record<Period, Condition>;
};

const fakePlans: Plan[] = [
  {
    name: "free",
    conditions: {
      year: {
        price: 0,
        resumesMax: 1,
        downloadsMax: 3,
        viewsMax: 15,
        alWordsMax: 50,
      },
      month: {
        price: 0,
        resumesMax: 1,
        downloadsMax: 3,
        viewsMax: 15,
        alWordsMax: 50,
      },
    },
  },
  {
    name: "plus",
    conditions: {
      year: {
        price: 17.99,
        resumesMax: 3,
        downloadsMax: 12,
        viewsMax: 1000,
        alWordsMax: 1000,
      },
      month: {
        price: 2,
        resumesMax: 3,
        downloadsMax: 12,
        viewsMax: 1000,
        alWordsMax: 1000,
      },
    },
  },
  {
    name: "premium",
    conditions: {
      year: {
        price: 19.99,
        resumesMax: 10,
        downloadsMax: null,
        viewsMax: null,
        alWordsMax: 15000,
      },
      month: {
        price: 3,
        resumesMax: 10,
        downloadsMax: null,
        viewsMax: null,
        alWordsMax: 15000,
      },
    },
  },
  {
    name: "enterprise",
    conditions: {
      year: {
        price: 179.99,
        resumesMax: null,
        downloadsMax: null,
        viewsMax: null,
        alWordsMax: 150000,
      },
      month: {
        price: 15,
        resumesMax: null,
        downloadsMax: null,
        viewsMax: null,
        alWordsMax: 150000,
      },
    },
  },
];

type UserSubscription = {
  planName: PlanName;
  period: Period;
};

const fakeUserSubscription: UserSubscription = {
  planName: "free",
  period: "month",
};

const defineViewText = (plan: PlanName, viewMax: number | null) => {
  if (!viewMax) return "Unlimited resume views";
  if (plan === "free") return `${viewMax} views for free`;
  return `${viewMax} resume views/month`;
};

const transformPlan = (userSubcription: UserSubscription, plan: Plan, currentPeriod: Period) => {
  const { planName } = userSubcription;
  const planByPeriod = plan.conditions[currentPeriod];

  return {
    label: plan.name === "premium" ? "Most popular" : "",
    isHighlighted: plan.name === "premium",
    name: plan.name.replace(/\b\w/g, (match) => match.toUpperCase()),
    price: `$${planByPeriod.price}`,
    buttonText: "Subcribe",
    includes: "This includes",
    resumes: !planByPeriod.resumesMax
      ? `Untimited`
      : `${planByPeriod.resumesMax} ${planByPeriod.resumesMax > 1 ? "resumes" : "resume"}`,
    downloads: !planByPeriod.downloadsMax
      ? `Untimited`
      : `${planByPeriod.downloadsMax} ${planByPeriod.downloadsMax > 1 ? "resumes" : "resume"}`,
    views: defineViewText(planName, planByPeriod.resumesMax),
    sharing: "Resume sharing link",
    alWords: `${planByPeriod.alWordsMax} Al words`,
  };
};

export const PlansPage = () => {
  const [billingPeriodCode, setBillingPeriodCode] = useState<number>(0);

  const currentPeriod = !billingPeriodCode ? "month" : "year";
  const currentPlans = fakePlans.map((plan: Plan) =>
    transformPlan(fakeUserSubscription, plan, currentPeriod),
  );

  return (
    <>
      <Helmet>
        <title>
          {t`Plans`} - {t`Death Resume`}
        </title>
      </Helmet>

      <div className="fixed top-0 h-screen w-screen py-12 px-24 bg-black text-white">
        <div>
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

        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {currentPlans.map((plan) => (
            <div
              key={plan.name + currentPeriod}
              className={
                plan.isHighlighted
                  ? "bg-darkGray border-darkGray border-opacity-0 rounded py-4 px-6"
                  : "py-4 px-6"
              }
            >
              <div className="h-6 inline bg-black order-darkGray border-opacity-0 px-1 text-xs rounded">
                {plan.label}
              </div>
              <h3 className="text-2xl font-bold leading-relaxed tracking-tight">{t`${plan.name}`}</h3>
              <p className="text-4xl">{plan.price}</p>
              <p>
                <button className="bg-reddish rounded-md px-4 py-2 text-white text-lg">
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
