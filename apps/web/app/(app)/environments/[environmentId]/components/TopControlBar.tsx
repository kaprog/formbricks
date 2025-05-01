import { TopControlButtons } from "@/app/(app)/environments/[environmentId]/components/TopControlButtons";
import { TEnvironment } from "@formbricks/types/environment";
import { TOrganizationRole } from "@formbricks/types/memberships";

interface SideBarProps {
  environment: TEnvironment;
  environments: TEnvironment[];
  membershipRole?: TOrganizationRole;
  projectPermission: null;
}

export const TopControlBar = ({
  environment,
  environments,
  membershipRole,
  projectPermission,
}: SideBarProps) => {
  return (
    <div className="fixed inset-0 top-0 z-30 flex h-14 w-full items-center justify-end bg-slate-50 px-6">
      <div className="z-10 shadow-xs">
        <div className="flex w-fit items-center space-x-2 py-2">
          <TopControlButtons
            environment={environment}
            environments={environments}
            membershipRole={membershipRole}
            projectPermission={projectPermission}
          />
        </div>
      </div>
    </div>
  );
};
