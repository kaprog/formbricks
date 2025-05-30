import { MainNavigation } from "@/app/(app)/environments/[environmentId]/components/MainNavigation";
import { TopControlBar } from "@/app/(app)/environments/[environmentId]/components/TopControlBar";
import { IS_DEVELOPMENT, IS_FORMBRICKS_CLOUD } from "@/lib/constants";
import { getEnvironment, getEnvironments } from "@/lib/environment/service";
import { getMembershipByUserIdOrganizationId } from "@/lib/membership/service";
import {
  getMonthlyActiveOrganizationPeopleCount,
  getMonthlyOrganizationResponseCount,
  getOrganizationByEnvironmentId,
  getOrganizationsByUserId,
} from "@/lib/organization/service";
import { getUserProjects } from "@/lib/project/service";
import { getUser } from "@/lib/user/service";
import { DevEnvironmentBanner } from "@/modules/ui/components/dev-environment-banner";
import { LimitsReachedBanner } from "@/modules/ui/components/limits-reached-banner";
import { getTranslate } from "@/tolgee/server";
import type { Session } from "next-auth";

interface EnvironmentLayoutProps {
  environmentId: string;
  session: Session;
  children?: React.ReactNode;
}

export const EnvironmentLayout = async ({ environmentId, session, children }: EnvironmentLayoutProps) => {
  const t = await getTranslate();
  const [user, environment, organizations, organization] = await Promise.all([
    getUser(session.user.id),
    getEnvironment(environmentId),
    getOrganizationsByUserId(session.user.id),
    getOrganizationByEnvironmentId(environmentId),
  ]);

  if (!user) {
    throw new Error(t("common.user_not_found"));
  }

  if (!organization) {
    throw new Error(t("common.organization_not_found"));
  }

  if (!environment) {
    throw new Error(t("common.environment_not_found"));
  }

  const [projects, environments] = await Promise.all([
    getUserProjects(user.id, organization.id),
    getEnvironments(environment.projectId),
  ]);

  if (!projects || !environments || !organizations) {
    throw new Error(t("environments.projects_environments_organizations_not_found"));
  }

  const currentUserMembership = await getMembershipByUserIdOrganizationId(session?.user.id, organization.id);
  const membershipRole = currentUserMembership?.role;


  const isMultiOrgEnabled = false;

  let peopleCount = 0;
  let responseCount = 0;

  if (IS_FORMBRICKS_CLOUD) {
    [peopleCount, responseCount] = await Promise.all([
      getMonthlyActiveOrganizationPeopleCount(organization.id),
      getMonthlyOrganizationResponseCount(organization.id),
    ]);
  }

  const organizationProjectsLimit = Number.MAX_SAFE_INTEGER;

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden">
      <DevEnvironmentBanner environment={environment} />

      {IS_FORMBRICKS_CLOUD && (
        <LimitsReachedBanner
          organization={organization}
          environmentId={environment.id}
          peopleCount={peopleCount}
          responseCount={responseCount}
        />
      )}

      <div className="flex h-full">
        {membershipRole === "owner" ? (
          <MainNavigation
            environment={environment}
            organization={organization}
            organizations={organizations}
            projects={projects}
            organizationProjectsLimit={organizationProjectsLimit}
            user={user}
            isFormbricksCloud={IS_FORMBRICKS_CLOUD}
            isDevelopment={IS_DEVELOPMENT}
            membershipRole={membershipRole}
            isMultiOrgEnabled={isMultiOrgEnabled}
            isLicenseActive={false}
          />
        ) : null}
        <div id="mainContent" className="flex-1 overflow-y-auto bg-slate-50">
          <TopControlBar
            environment={environment}
            environments={environments}
            membershipRole={membershipRole}
          />
          <div className="mt-14">{children}</div>
        </div>
      </div>
    </div>
  );
};
