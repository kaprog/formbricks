import { OrganizationSettingsNavbar } from "@/app/(app)/environments/[environmentId]/settings/(organization)/components/OrganizationSettingsNavbar";
import { IS_FORMBRICKS_CLOUD } from "@/lib/constants";
import { getEnvironmentAuth } from "@/modules/environments/lib/utils";
import { PageContentWrapper } from "@/modules/ui/components/page-content-wrapper";
import { PageHeader } from "@/modules/ui/components/page-header";
import { SettingsId } from "@/modules/ui/components/settings-id";
import { getTranslate } from "@/tolgee/server";
import { SettingsCard } from "../../components/SettingsCard";
import { DeleteOrganization } from "./components/DeleteOrganization";
import { EditOrganizationNameForm } from "./components/EditOrganizationNameForm";

const Page = async (props: { params: Promise<{ environmentId: string }> }) => {
  const params = await props.params;
  const t = await getTranslate();

  const { currentUserMembership, organization, isOwner } = await getEnvironmentAuth(params.environmentId);

  const isMultiOrgEnabled = false;

  const isDeleteDisabled = !isOwner || !isMultiOrgEnabled;
  const currentUserRole = currentUserMembership?.role;

  return (
    <PageContentWrapper>
      <PageHeader pageTitle={t("environments.settings.general.organization_settings")}>
        <OrganizationSettingsNavbar
          environmentId={params.environmentId}
          isFormbricksCloud={IS_FORMBRICKS_CLOUD}
          membershipRole={currentUserMembership?.role}
          activeId="general"
        />
      </PageHeader>
      <SettingsCard
        title={t("environments.settings.general.organization_name")}
        description={t("environments.settings.general.organization_name_description")}>
        <EditOrganizationNameForm
          organization={organization}
          environmentId={params.environmentId}
          membershipRole={currentUserMembership?.role}
        />
      </SettingsCard>

      {isMultiOrgEnabled && (
        <SettingsCard
          title={t("environments.settings.general.delete_organization")}
          description={t("environments.settings.general.delete_organization_description")}>
          <DeleteOrganization
            organization={organization}
            isDeleteDisabled={isDeleteDisabled}
            isUserOwner={currentUserRole === "owner"}
          />
        </SettingsCard>
      )}

      <SettingsId title={t("common.organization_id")} id={organization.id}></SettingsId>
    </PageContentWrapper>
  );
};

export default Page;
