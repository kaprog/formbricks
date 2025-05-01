import { SurveyInactive } from "@/modules/survey/link/components/survey-inactive";
import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Survey",
    description: "Complete this survey",
  };
};

export const ContactSurveyPage = async () => {
  return <SurveyInactive status="link invalid" />;
};
