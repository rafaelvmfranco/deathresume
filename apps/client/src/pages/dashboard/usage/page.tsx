import { Link } from "react-router-dom";
import { t } from "@lingui/macro";
import { ScrollArea, Separator } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

import { useGetUsage } from "@/client/services/usage";
import { useGetSubcription } from "@/client/services/subcription";
import {
  Period,
  PlanDto,
  SubcriptionWithPlan,
  UsageDto,
  UsageUpdateFields,
  PeriodName,
} from "@reactive-resume/dto";

type BarData = {
  style: string;
  currentNumber: number;
  limitNumber: string | number | null;
  name: UsageUpdateFields;
  startNumber: number;
  endNumber: number | null;
  title: string;
};

const isPlanFree = (data: PlanDto | undefined) => {
  if (!data) return true;
  return data.name === "free" ? true : false;
};

function getPlanTitle(data: PlanDto | undefined) {
  if (!data) return "Your plan";
  const str = data.name;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const getUsageBars = (subscription: SubcriptionWithPlan | null, usage: UsageDto): BarData[] => {
  let bars: {
    name: UsageUpdateFields;
    title: string;
    style: string;
  }[] = [
    {
      name: "resumes",
      title: "Resumes",
      style:
        "w-full progress-unfilled:bg-slate-300 progress-unfilled:rounded-lg progress-filled:rounded-lg progress-filled:bg-green-600",
    },
    {
      name: "views",
      title: "Views",
      style:
        "w-full progress-unfilled:bg-slate-300 progress-unfilled:rounded-lg progress-filled:rounded-lg progress-filled:bg-amber-600",
    },
    {
      name: "downloads",
      title: "Downloads",
      style:
        "w-full progress-unfilled:bg-slate-300 progress-filled:border-transparent progress-unfilled:rounded-lg progress-filled:rounded-lg progress-filled:bg-red-600",
    },
    {
      name: "alWords",
      title: "Al words",
      style:
        "w-full progress-unfilled:bg-slate-300 rounded-lg progress-filled:rounded-lg progress-filled:bg-violet-600",
    },
  ];

  const period: PeriodName | undefined = subscription?.period?.name || "year";

  const updatedBars: BarData[] = bars.map((bar: { name: UsageUpdateFields; title: string; style: string }) => {
    return {
      ...bar,
      currentNumber: usage[bar.name],
      limitNumber: subscription?.plan[period].max[bar.name]
        ? subscription?.plan[period].max[bar.name]
        : "Unlimited",
      startNumber: !subscription?.plan[period].max[bar.name] ? 0 : usage[bar.name],
      endNumber: subscription?.plan[period].max[bar.name]    
        ? subscription?.plan[period].max[bar.name]
        : 100,
    };
  });

  return updatedBars;
};

export const UsagePage = () => {
  const { usage } = useGetUsage();
  const { subscription } = useGetSubcription();

  return (
    <>
      <Helmet>
        <title>
          {t`Usage`} - {t`Death Resume`}
        </title>
      </Helmet>

      <div className="max-w-2xl space-y-4">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold tracking-tight"
        >
          {t`Usage`}
        </motion.h1>

        {subscription &&
          usage &&
          getUsageBars(subscription, usage).map((bar: BarData) => (
            <div key={bar.name}>
              <h3 className="text-2xl font-bold leading-relaxed tracking-tight">
                {t`${bar.title}`}
              </h3>
              <progress
                id="file"
                value={bar.startNumber}
                max={bar.endNumber || 100}
                className={bar.style}
              ></progress>
              <p className="leading-relaxed opacity-75">
                {bar.currentNumber}/{bar.limitNumber}
              </p>
            </div>
          ))}
        <div className="flex justify-between align-center">
          <div className="flex justify-center items-center text-lg font-bold">
            <span>{getPlanTitle(subscription?.plan)}</span>
          </div>

          <Link to={isPlanFree(subscription?.plan) ? "/plans" : "/stripe-route"}>
            <button className="bg-reddish rounded-md px-4 py-2 text-white text-lg">
              {isPlanFree(subscription?.plan) ? `${t`Upgrade`}` : "Manage subcription"}
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};
