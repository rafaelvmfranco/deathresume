import { Link } from "react-router-dom";

export const UpgradePopup = ({ reason }: { reason: string }) => {
  return (
    <div className="fixed inset-0 h-screen w-screen flex items-center justify-center z-[70] bg-gray-600 bg-opacity-25">
      <div className="w-full m-4 lg:w-1/3 p-12 rounded bg-white dark:text-black">
        <p className="text-2xl font-bold">Upgrade your plan</p>
        <p>{reason}</p>
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
