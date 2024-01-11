import { Link } from "react-router-dom";
import { t } from "@lingui/macro";
import { ScrollArea, Separator } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

type Plan = "free" | "plus" | "premium" | "enterprise";

type Usage = {
  name: string;
  currentNumber: number;
  limitNumber: number | null;
};

type PlanUsage = {
  plan: Plan;
  usage: Usage;
};

const fakeObject: PlanUsage = {
  plan: "free",
  usage: [
    { name: "resumes", currentNumber: 3, limitNumber: 20 },
    { name: "downloads", currentNumber: 230, limitNumber: 400 },
    { name: "views", currentNumber: 12000, limitNumber: 600000 },
    { name: "alWords", currentNumber: 15000, limitNumber: 16000 },
  ],
};

const isPlanFree = (data) => {
  return data.plan === "free" ? true : false;
};

function getPlanTitle(data) {
  const str = data.plan;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const getUsageData = (usage) => {
  let style = "";
  let title = "";

  switch (usage.name || "") {
    case "resumes":
      style = "w-full progress-unfilled:bg-slate-300 progress-unfilled:rounded-lg progress-filled:rounded-lg progress-filled:bg-green-600";
      title = "Resumes";
      break;
    case "downloads":
      style = "w-full progress-unfilled:bg-slate-300 progress-filled:border-transparent progress-unfilled:rounded-lg progress-filled:rounded-lg progress-filled:bg-red-600";
      title = "Downloads";
      break;
    case "views":
      style = "w-full progress-unfilled:bg-slate-300 progress-unfilled:rounded-lg progress-filled:rounded-lg progress-filled:bg-amber-600";
      title = "Views";
      break;
    case "alWords":
      style = "w-full progress-unfilled:bg-slate-300 progress-unfilled:rounded-lg progress-filled:rounded-lg progress-filled:bg-blue-600";
      title = "Al words";
      break;
    default:
      style = "w-full progress-unfilled:bg-slate-300 rounded-lg progress-filled:rounded-lg progress-filled:bg-violet-600";
      title = "";
  }

  return {
    progressBarStyling: style,
    currentNumber: usage.currentNumber,
    limitNumber: usage.limitNumber ? usage.limitNumber : "Unlimited",
    name: usage.name,
    startNumber: usage.limitNumber ? usage.currentNumber : 0,
    endNumber: usage.limitNumber ? usage.limitNumber : 100,
    title,
  };
};

export const UsagePage = () => {
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

        {fakeObject.usage
          .map((usageItem) => getUsageData(usageItem))
          .map((usageItem) => (
            <div key={usageItem.name}>
              <h3 className="text-2xl font-bold leading-relaxed tracking-tight">
                {t`${usageItem.title}`}
              </h3>
              <progress
                id="file"
                value={usageItem.startNumber}
                max={usageItem.endNumber}
                className={usageItem.progressBarStyling}
              ></progress>
              <p className="leading-relaxed opacity-75">
                {usageItem.currentNumber}/{usageItem.limitNumber}
              </p>
            </div>
          ))}
        <div className="flex justify-between align-center">
          <div className="flex justify-center items-center text-lg font-bold">
            <span>{getPlanTitle(fakeObject)}</span>
          </div>

          <Link to={isPlanFree ? "/billing" : "/stripe-route"}>
            <button className="bg-reddish rounded-md px-4 py-2 text-white text-lg">
              {isPlanFree(fakeObject) ? `${t`Upgrade`}` : "Manage subcription"}
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};
