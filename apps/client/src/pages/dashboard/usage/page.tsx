import { useState } from "react";
import { t } from "@lingui/macro";
import { ScrollArea, Separator } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

const fakeObject = {
  plan: "free",
  usage: [
    { name: "resumes", currentNumber: 3, limitNumber: 20 },
    { name: "downloads", currentNumber: 230, limitNumber: null },
    { name: "viewes", currentNumber: 12000, limitNumber: null },
    { name: "alWords", currentNumber: 15000, limitNumber: null },
  ],
};

const fakePlans = [];

const isPlanFree = (data) => {
  return data.plan === "free" ? true : false;
};

function getPlanTitle(data) {
  const str = data.plan;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const getUsageData = (usage) => {
  let color = "";
  let title = "";

  switch (usage.name || "") {
    case "resumes":
      color = "green";
      title = "Resumes";
      break;
    case "downloads":
      color = "yellow";
      title = "Downloads";
      break;
    case "views":
      color = "amber";
      title = "Views";
      break;
    case "alWords":
      color = "blue";
      title = "Al words";
      break;
    default:
      color = "violet";
  }

  return {
    progressBarStyling: `w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-${color} [&::-moz-progress-bar]:bg-${color}`,
    currentNumber: usage.currentNumber,
    limitNumber: usage.limitNumber ? usage.limitNumber : "Unlimited",
    name: usage.name,
    startNumber: usage.limitNumber ? usage.currentNumber : 0,
    endNumber: usage.limitNumber ? usage.limitNumber : 100,
    title,
  };
};

export const UsagePage = () => {
  const [showPopup, setShowPopup] = useState<boolean>(false);

  return (
    <>
      {showPopup && <div>show pop up</div>}
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
            <div>
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
          {/* add link to paying, add translations */}
          <div className="flex justify-center items-center text-lg font-bold">
            <span>{getPlanTitle(fakeObject)}</span>
          </div>
          {isPlanFree ? (
            <button
              className="bg-reddish rounded-md px-4 py-2 text-white text-lg"
              onClick={() => setShowPopup(true)}
            >{t`Upgrade`}</button>
          ) : (
            <button
              className="bg-reddish rounded-md px-4 py-2 text-white text-lg"
              onClick={() => setShowPopup(true)}
            >
              Manage subcription
            </button>
          )}
        </div>
      </div>
    </>
  );
};
