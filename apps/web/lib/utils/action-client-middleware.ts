import {getMembershipRole} from "@/lib/membership/hooks/actions";
import {returnValidationErrors} from "next-safe-action";
import {ZodIssue, z} from "zod";
import {AuthorizationError} from "@formbricks/types/errors";
import {type TOrganizationRole} from "@formbricks/types/memberships";
import {prisma} from "@formbricks/database";


const formatErrors = (issues: ZodIssue[]): Record<string, { _errors: string[] }> => {
    return {
        ...issues.reduce((acc, issue) => {
            acc[issue.path.join(".")] = {
                _errors: [issue.message],
            };
            return acc;
        }, {}),
    };
};

export type TAccess<T extends z.ZodRawShape> =
    | {
    type: "organization";
    schema?: z.ZodObject<T>;
    data?: z.ZodObject<T>["_output"];
    roles: TOrganizationRole[];
}
    | {
    type: "projectTeam";
    minPermission: string;
    projectId: string;
}
    | {
    type: "team";
    minPermission: string;
    teamId: string;
};

const teamPermissionWeight = {
    read: 1,
    readWrite: 2,
    manage: 3,
};

const teamRoleWeight = {
    contributor: 1,
    admin: 2,
};

export const checkAuthorizationUpdated = async <T extends z.ZodRawShape>({
                                                                             userId,
                                                                             organizationId,
                                                                             access,
                                                                         }: {
    userId: string;
    organizationId: string;
    access: TAccess<T>[];
}) => {
    const role = await getMembershipRole(userId, organizationId);

    for (const accessItem of access) {
        if (accessItem.type === "organization") {
            if (accessItem.schema) {
                const resultSchema = accessItem.schema.strict();
                const parsedResult = resultSchema.safeParse(accessItem.data);
                if (!parsedResult.success) {
                    // @ts-expect-error -- TODO: match dynamic next-safe-action types
                    return returnValidationErrors(resultSchema, formatErrors(parsedResult.error.issues));
                }
            }

            if (accessItem.roles.includes(role)) {
                return true;
            }
        } else {
            if (accessItem.type === "projectTeam") {
                const projectPermission = (await isUserOwner(userId)) ? 'manage' : 'readWrite';
                if (
                    !projectPermission ||
                    (accessItem.minPermission !== undefined &&
                        teamPermissionWeight[projectPermission] < teamPermissionWeight[accessItem.minPermission])
                ) {
                    continue;
                }
            } else {
                const teamRole = (await isUserOwner(userId)) ? 'admin' : 'contributor';
                if (
                    !teamRole ||
                    (accessItem.minPermission !== undefined &&
                        teamRoleWeight[teamRole] < teamRoleWeight[accessItem.minPermission])
                ) {
                    continue;
                }
            }
            return true;
        }
    }

    throw new AuthorizationError("Not authorized");
};

async function isUserOwner(userId: string) {
    const usr = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    })
    if (!usr) {
        throw new Error("User not found");
    }

    return usr.role === null;
}