import { SettingsCard } from "@/app/(app)/environments/[environmentId]/settings/components/SettingsCard";
import { INVITE_DISABLED, IS_FORMBRICKS_CLOUD } from "@/lib/constants";
import { EditMemberships } from "@/modules/organization/settings/teams/components/edit-memberships";
import { OrganizationActions } from "@/modules/organization/settings/teams/components/edit-memberships/organization-actions";
import { getMembershipsByUserId } from "@/modules/organization/settings/teams/lib/membership";
import { getTranslate } from "@/tolgee/server";
import { Suspense } from "react";
import { TOrganizationRole } from "@formbricks/types/memberships";
import { TOrganization } from "@formbricks/types/organizations";

interface MembersViewProps {
  membershipRole?: TOrganizationRole;
  organization: TOrganization;
  currentUserId: string;
  environmentId: string;
  canDoRoleManagement: boolean;
  isUserManagementDisabledFromUi: boolean;
}

const MembersLoading = () => (
  <div className="px-2">
    {Array.from(Array(2)).map((_, index) => (
      <div key={index} className="mt-4">
        <div className={`h-8 w-80 animate-pulse rounded-full bg-slate-200`} />
      </div>
    ))}
  </div>
);

export const MembersView = async ({
  membershipRole,
  organization,
  currentUserId,
  environmentId,
  canDoRoleManagement,
  isUserManagementDisabledFromUi,
}: MembersViewProps) => {
  const t = await getTranslate();

  const userMemberships = await getMembershipsByUserId(currentUserId);
  const isLeaveOrganizationDisabled = userMemberships.length <= 1;

  const isMultiOrgEnabled = false;

  let teams = [];

  if (canDoRoleManagement) {
    teams = [];
    if (!teams) {
      throw new Error(t("common.teams_not_found"));
    }
  }

  return (
    <SettingsCard
      title={t("environments.settings.general.manage_members")}
      description={t("environments.settings.general.manage_members_description")}>
      {membershipRole && (
        <OrganizationActions
          organization={organization}
          membershipRole={membershipRole}
          role={membershipRole}
          isLeaveOrganizationDisabled={isLeaveOrganizationDisabled}
          isInviteDisabled={INVITE_DISABLED}
          canDoRoleManagement={canDoRoleManagement}
          isFormbricksCloud={IS_FORMBRICKS_CLOUD}
          environmentId={environmentId}
          isMultiOrgEnabled={isMultiOrgEnabled}
          teams={teams}
          isUserManagementDisabledFromUi={isUserManagementDisabledFromUi}
        />
      )}

      {membershipRole && (
        <Suspense fallback={<MembersLoading />}>
          <EditMemberships
            canDoRoleManagement={canDoRoleManagement}
            organization={organization}
            currentUserId={currentUserId}
            role={membershipRole}
            isUserManagementDisabledFromUi={isUserManagementDisabledFromUi}
          />
        </Suspense>
      )}
    </SettingsCard>
  );
};
