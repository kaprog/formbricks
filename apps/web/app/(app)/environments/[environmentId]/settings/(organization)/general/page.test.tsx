import { getUser } from "@/lib/user/service";
import { getEnvironmentAuth } from "@/modules/environments/lib/utils";
import { TEnvironmentAuth } from "@/modules/environments/types/environment-auth";
import { getTranslate } from "@/tolgee/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { TUser } from "@formbricks/types/user";
import Page from "./page";

vi.mock("@/lib/constants", () => ({
  IS_FORMBRICKS_CLOUD: false,
  IS_PRODUCTION: false,
  FB_LOGO_URL: "https://example.com/mock-logo.png",
  ENCRYPTION_KEY: "mock-encryption-key",
  ENTERPRISE_LICENSE_KEY: "mock-enterprise-license-key",
  GITHUB_ID: "mock-github-id",
  GITHUB_SECRET: "mock-github-secret",
  GOOGLE_CLIENT_ID: "mock-google-client-id",
  GOOGLE_CLIENT_SECRET: "mock-google-client-secret",
  AZUREAD_CLIENT_ID: "mock-azuread-client-id",
  AZUREAD_CLIENT_SECRET: "mock-azure-client-secret",
  AZUREAD_TENANT_ID: "mock-azuread-tenant-id",
  OIDC_CLIENT_ID: "mock-oidc-client-id",
  OIDC_CLIENT_SECRET: "mock-oidc-client-secret",
  OIDC_ISSUER: "mock-oidc-issuer",
  OIDC_DISPLAY_NAME: "mock-oidc-display-name",
  OIDC_SIGNING_ALGORITHM: "mock-oidc-signing-algorithm",
  SAML_DATABASE_URL: "mock-saml-database-url",
  WEBAPP_URL: "mock-webapp-url",
  SMTP_HOST: "mock-smtp-host",
  SMTP_PORT: "mock-smtp-port",
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/tolgee/server", () => ({
  getTranslate: vi.fn(),
}));

vi.mock("@/lib/user/service", () => ({
  getUser: vi.fn(),
}));

vi.mock("@/modules/environments/lib/utils", () => ({
  getEnvironmentAuth: vi.fn(),
}));

describe("Page", () => {
  let mockEnvironmentAuth = {
    session: { user: { id: "test-user-id" } },
    currentUserMembership: { role: "owner" },
    organization: { id: "test-organization-id", billing: { plan: "free" } },
    isOwner: true,
    isManager: false,
  } as unknown as TEnvironmentAuth;

  const mockUser = { id: "test-user-id" } as TUser;
  const mockTranslate = vi.fn((key) => key);

  beforeEach(() => {
    vi.mocked(getTranslate).mockResolvedValue(mockTranslate);
    vi.mocked(getUser).mockResolvedValue(mockUser);
    vi.mocked(getEnvironmentAuth).mockResolvedValue(mockEnvironmentAuth);
  });

  test("renders the page with organization settings", async () => {
    const props = {
      params: Promise.resolve({ environmentId: "env-123" }),
    };

    const result = await Page(props);

    expect(result).toBeTruthy();
  });

  test("renders if session user id empty", async () => {
    mockEnvironmentAuth.session.user.id = "";

    vi.mocked(getEnvironmentAuth).mockResolvedValue(mockEnvironmentAuth);

    const props = {
      params: Promise.resolve({ environmentId: "env-123" }),
    };

    const result = await Page(props);

    expect(result).toBeTruthy();
  });

  test("handles getEnvironmentAuth error", async () => {
    vi.mocked(getEnvironmentAuth).mockRejectedValue(new Error("Authentication error"));

    const props = {
      params: Promise.resolve({ environmentId: "env-123" }),
    };

    await expect(Page(props)).rejects.toThrow("Authentication error");
  });
});
