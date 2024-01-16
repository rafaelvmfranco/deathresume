import { t } from "@lingui/macro";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@reactive-resume/ui";
import { Link } from "react-router-dom";

import { useDialog } from "@/client/stores/dialog";

type UpgradeDialogProps = {
  isFreePlan: boolean;
};

export const UpgradeDialog = ({ isFreePlan } : UpgradeDialogProps) => {
  const { isOpen, mode, open, close } = useDialog("upgrade");

  console.log(isOpen, close)
  return (
    <Dialog open={isOpen} onOpenChange={close} className="bg-gray-400">
      <DialogContent className="!max-w-md">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>blabla - t</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Link to={ isFreePlan ? "/plans" : "/stripe-route"}>
          <Button>{t`Close`}</Button></Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
