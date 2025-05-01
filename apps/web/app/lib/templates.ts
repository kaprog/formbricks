import {
  buildMultipleChoiceQuestion,
  buildRatingQuestion,
  getDefaultSurveyPreset,
} from "@/app/lib/survey-builder";
import { createId } from "@paralleldrive/cuid2";
import { TFnType } from "@tolgee/react";
import { TSurvey, TSurveyOpenTextQuestion, TSurveyQuestionTypeEnum } from "@formbricks/types/surveys/types";
import { TTemplate } from "@formbricks/types/templates";


export const templates = (_: TFnType): TTemplate[] => [
  /*cartAbandonmentSurvey(t),
  siteAbandonmentSurvey(t),
  productMarketFitSuperhuman(t),
  onboardingSegmentation(t),
  churnSurvey(t),
  earnedAdvocacyScore(t),
  improveTrialConversion(t),
  reviewPrompt(t),
  interviewPrompt(t),
  improveActivationRate(t),
  uncoverStrengthsAndWeaknesses(t),
  productMarketFitShort(t),
  marketAttribution(t),
  changingSubscriptionExperience(t),
  identifyCustomerGoals(t),
  featureChaser(t),
  fakeDoorFollowUp(t),
  feedbackBox(t),
  integrationSetupSurvey(t),
  newIntegrationSurvey(t),
  docsFeedback(t),
  nps(t),
  customerSatisfactionScore(t),
  collectFeedback(t),
  identifyUpsellOpportunities(t),
  prioritizeFeatures(t),
  gaugeFeatureSatisfaction(t),
  marketSiteClarity(t),
  customerEffortScore(t),
  rateCheckoutExperience(t),
  measureSearchExperience(t),
  evaluateContentQuality(t),
  measureTaskAccomplishment(t),
  identifySignUpBarriers(t),
  buildProductRoadmap(t),
  understandPurchaseIntention(t),
  improveNewsletterContent(t),
  evaluateAProductIdea(t),
  understandLowEngagement(t),
  employeeSatisfaction(t),
  employeeWellBeing(t),
  longTermRetentionCheckIn(t),
  supportiveWorkCulture(t),
  alignmentAndEngagement(t),
  recognitionAndReward(t),
  professionalDevelopmentGrowth(t),
  professionalDevelopmentSurvey(t),
  careerDevelopmentSurvey(t),*/
];

export const customSurveyTemplate = (t: TFnType): TTemplate => {
  return {
    name: t("templates.custom_survey_name"),
    description: t("templates.custom_survey_description"),
    preset: {
      ...getDefaultSurveyPreset(t),
      name: t("templates.custom_survey_name"),
      questions: [
        {
          id: createId(),
          type: TSurveyQuestionTypeEnum.OpenText,
          headline: { default: t("templates.custom_survey_question_1_headline") },
          placeholder: { default: t("templates.custom_survey_question_1_placeholder") },
          buttonLabel: { default: t("templates.next") },
          required: true,
          inputType: "text",
          charLimit: {
            enabled: false,
          },
        } as TSurveyOpenTextQuestion,
      ],
    },
  };
};

export const previewSurvey = (projectName: string, t: TFnType) => {
  return {
    id: "cltxxaa6x0000g8hacxdxejeu",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: t("templates.preview_survey_name"),
    type: "link",
    environmentId: "cltwumfcz0009echxg02fh7oa",
    createdBy: "cltwumfbz0000echxysz6ptvq",
    status: "inProgress",
    welcomeCard: {
      html: {
        default: t("templates.preview_survey_welcome_card_html"),
      },
      enabled: false,
      headline: {
        default: t("templates.preview_survey_welcome_card_headline"),
      },
      timeToFinish: false,
      showResponseCount: false,
    },
    styling: null,
    segment: null,
    questions: [
      {
        ...buildRatingQuestion({
          id: "lbdxozwikh838yc6a8vbwuju",
          range: 5,
          scale: "star",
          headline: t("templates.preview_survey_question_1_headline", { projectName }),
          required: true,
          subheader: t("templates.preview_survey_question_1_subheader"),
          lowerLabel: t("templates.preview_survey_question_1_lower_label"),
          upperLabel: t("templates.preview_survey_question_1_upper_label"),
          t,
        }),
        isDraft: true,
      },
      {
        ...buildMultipleChoiceQuestion({
          id: "rjpu42ps6dzirsn9ds6eydgt",
          type: TSurveyQuestionTypeEnum.MultipleChoiceSingle,
          choiceIds: ["x6wty2s72v7vd538aadpurqx", "fbcj4530t2n357ymjp2h28d6"],
          choices: [
            t("templates.preview_survey_question_2_choice_1_label"),
            t("templates.preview_survey_question_2_choice_2_label"),
          ],
          headline: t("templates.preview_survey_question_2_headline"),
          backButtonLabel: t("templates.preview_survey_question_2_back_button_label"),
          required: true,
          shuffleOption: "none",
          t,
        }),
        isDraft: true,
      },
    ],
    endings: [
      {
        id: "cltyqp5ng000108l9dmxw6nde",
        type: "endScreen",
        headline: { default: t("templates.preview_survey_ending_card_headline") },
        subheader: { default: t("templates.preview_survey_ending_card_description") },
      },
    ],
    hiddenFields: {
      enabled: true,
      fieldIds: [],
    },
    variables: [],
    displayOption: "displayOnce",
    recontactDays: null,
    displayLimit: null,
    autoClose: null,
    runOnDate: null,
    closeOnDate: null,
    delay: 0,
    displayPercentage: null,
    autoComplete: 50,
    isVerifyEmailEnabled: false,
    isSingleResponsePerEmailEnabled: false,
    redirectUrl: null,
    projectOverwrites: null,
    surveyClosedMessage: null,
    singleUse: {
      enabled: false,
      isEncrypted: true,
    },
    pin: null,
    resultShareKey: null,
    languages: [],
    triggers: [],
    showLanguageSwitch: false,
    followUps: [],
    isBackButtonHidden: false,
  } as TSurvey;
};
