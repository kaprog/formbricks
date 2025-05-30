import { segmentCache } from "@/lib/cache/segment";
import { capturePosthogEnvironmentEvent } from "@/lib/posthogServer";
import { surveyCache } from "@/lib/survey/cache";
import { Prisma, Survey } from "@prisma/client";
import { prisma } from "@formbricks/database";
import { logger } from "@formbricks/logger";
import { DatabaseError } from "@formbricks/types/errors";

export const createSurvey = async (
  environmentId: string,
  surveyBody: Pick<Survey, "name" | "questions">
): Promise<{ id: string }> => {
  try {
    const survey = await prisma.survey.create({
      data: {
        ...surveyBody,
        environment: {
          connect: {
            id: environmentId,
          },
        },
      },
      select: {
        id: true,
        type: true,
        environmentId: true,
        resultShareKey: true,
      },
    });

    // if the survey created is an "app" survey, we also create a private segment for it.
    if (survey.type === "app") {
      const newSegment = await prisma.segment.create({
        data: {
          title: survey.id,
          filters: [],
          isPrivate: true,
          environment: {
            connect: {
              id: environmentId,
            },
          },
        },
      });

      await prisma.survey.update({
        where: {
          id: survey.id,
        },
        data: {
          segment: {
            connect: {
              id: newSegment.id,
            },
          },
        },
      });

      segmentCache.revalidate({
        id: newSegment.id,
        environmentId: survey.environmentId,
      });
    }

    surveyCache.revalidate({
      id: survey.id,
      environmentId: survey.environmentId,
      resultShareKey: survey.resultShareKey ?? undefined,
    });

    await capturePosthogEnvironmentEvent(survey.environmentId, "survey created", {
      surveyId: survey.id,
      surveyType: survey.type,
    });

    return { id: survey.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(error, "Error creating survey");
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};
