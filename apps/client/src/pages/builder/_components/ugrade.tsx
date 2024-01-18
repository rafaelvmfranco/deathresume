import { t } from "@lingui/macro";
import { Link } from "react-router-dom";

export const UpgradePopup = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-gray-600 bg-opacity-25">
      <div className="w-1/3 p-12 rounded bg-white">
        <p className="text-2xl font-bold">Upgrade your plan</p>
        <p>Upgrade reason.</p>
        <div className="mt-12">
          <Link to={"/plans"}>
            <button className="w-full bg-reddish rounded-md px-4 py-2 text-white text-lg">
              Upgrade now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
