"use server";

import { getOrganization } from "@/lib/organization/service";
import { getOrganizationProjectsCount } from "@/lib/project/service";
import { updateUser } from "@/lib/user/service";
import { authenticatedActionClient } from "@/lib/utils/action-client";
import { checkAuthorizationUpdated } from "@/lib/utils/action-client-middleware";
import { createProject } from "@/modules/projects/settings/lib/project";
import { z } from "zod";
import { ZId } from "@formbricks/types/common";
import { OperationNotAllowedError } from "@formbricks/types/errors";
import { ZProjectUpdateInput } from "@formbricks/types/project";

const ZCreateProjectAction = z.object({
  organizationId: ZId,
  data: ZProjectUpdateInput,
});

export const createProjectAction = authenticatedActionClient
  .schema(ZCreateProjectAction)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx;

    const organizationId = parsedInput.organizationId;

    await checkAuthorizationUpdated({
      userId: user.id,
      organizationId: parsedInput.organizationId,
      access: [
        {
          data: parsedInput.data,
          schema: ZProjectUpdateInput,
          type: "organization",
          roles: ["owner", "manager"],
        },
      ],
    });

    const organization = await getOrganization(organizationId);

    if (!organization) {
      throw new Error("Organization not found");
    }

    const organizationProjectsLimit = Number.MAX_SAFE_INTEGER;
    const organizationProjectsCount = await getOrganizationProjectsCount(organization.id);

    if (organizationProjectsCount >= organizationProjectsLimit) {
      throw new OperationNotAllowedError("Organization project limit reached");
    }

    if (parsedInput.data.teamIds && parsedInput.data.teamIds.length > 0) {
      const canDoRoleManagement = false;

      if (!canDoRoleManagement) {
        throw new OperationNotAllowedError("You do not have permission to manage roles");
      }
    }

    const project = await createProject(parsedInput.organizationId, parsedInput.data);
    const updatedNotificationSettings = {
      ...user.notificationSettings,
      alert: {
        ...user.notificationSettings?.alert,
      },
      weeklySummary: {
        ...user.notificationSettings?.weeklySummary,
        [project.id]: true,
      },
    };

    await updateUser(user.id, {
      notificationSettings: updatedNotificationSettings,
    });

    return project;
  });
