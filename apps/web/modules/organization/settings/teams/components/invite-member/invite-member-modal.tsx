"use client";

import { cn } from "@/lib/cn";
import { Modal } from "@/modules/ui/components/modal";
import { TabToggle } from "@/modules/ui/components/tab-toggle";
import { H4, Muted } from "@/modules/ui/components/typography";
import { useTranslate } from "@tolgee/react";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { TOrganizationRole } from "@formbricks/types/memberships";
import { BulkInviteTab } from "./bulk-invite-tab";
import { IndividualInviteTab } from "./individual-invite-tab";

interface InviteMemberModalProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSubmit: (data: { name: string; email: string; role: TOrganizationRole }[]) => void;
  teams: unknown[];
  canDoRoleManagement: boolean;
  isFormbricksCloud: boolean;
  environmentId: string;
  membershipRole?: TOrganizationRole;
}

export const InviteMemberModal = ({
  open,
  setOpen,
  onSubmit,
  teams,
  canDoRoleManagement,
  isFormbricksCloud,
  environmentId,
  membershipRole,
}: InviteMemberModalProps) => {
  const [type, setType] = useState<"individual" | "bulk">("individual");

  const { t } = useTranslate();

  const tabs = {
    individual: (
      <IndividualInviteTab
        setOpen={setOpen}
        environmentId={environmentId}
        onSubmit={onSubmit}
        canDoRoleManagement={canDoRoleManagement}
        isFormbricksCloud={isFormbricksCloud}
        teams={teams}
        membershipRole={membershipRole}
      />
    ),
    bulk: (
      <BulkInviteTab
        setOpen={setOpen}
        onSubmit={onSubmit}
        canDoRoleManagement={canDoRoleManagement}
        isFormbricksCloud={isFormbricksCloud}
      />
    ),
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      noPadding
      closeOnOutsideClick={false}
      className="overflow-visible"
      size="md"
      hideCloseButton>
      <div className="sticky top-0 flex h-full flex-col rounded-lg">
        <button
          className={cn(
            "absolute top-0 right-0 hidden pt-4 pr-4 text-slate-400 hover:text-slate-500 focus:ring-0 focus:outline-none sm:block"
          )}
          onClick={() => {
            setOpen(false);
          }}>
          <XIcon className="h-6 w-6 rounded-md bg-white" />
          <span className="sr-only">Close</span>
        </button>
        <div className="rounded-t-lg bg-slate-100">
          <div className="flex w-full items-center justify-between p-6">
            <div className="flex items-center space-x-2">
              <div>
                <H4>{t("environments.settings.teams.invite_member")}</H4>
                <Muted className="text-slate-500">
                  {t("environments.settings.teams.invite_member_description")}
                </Muted>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 p-6">
        <TabToggle
          id="type"
          options={[
            { value: "individual", label: t("environments.settings.teams.individual") },
            { value: "bulk", label: t("environments.settings.teams.bulk_invite") },
          ]}
          onChange={(inviteType) => setType(inviteType)}
          defaultSelected={type}
        />
        {tabs[type]}
      </div>
    </Modal>
  );
};
