"use client";

import { cn } from "@/lib/cn";
import { FORMBRICKS_LOGGED_IN_WITH_LS } from "@/lib/localStorage";
import { getFormattedErrorMessage } from "@/lib/utils/helper";
import { createEmailTokenAction } from "@/modules/auth/actions";
import { Button } from "@/modules/ui/components/button";
import { FormControl, FormError, FormField, FormItem } from "@/modules/ui/components/form";
import { PasswordInput } from "@/modules/ui/components/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslate } from "@tolgee/react";
import { signIn } from "next-auth/react";
import Link from "next/dist/client/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState} from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const ZLoginForm = z.object({
  email: z.string(),
  password: z.string(),
  totpCode: z.string().optional(),
  backupCode: z.string().optional(),
});

type TLoginForm = z.infer<typeof ZLoginForm>;

interface LoginFormProps {
  emailAuthEnabled: boolean;
  publicSignUpEnabled: boolean;
  passwordResetEnabled: boolean;
  googleOAuthEnabled: boolean;
  githubOAuthEnabled: boolean;
  azureOAuthEnabled: boolean;
  oidcOAuthEnabled: boolean;
  oidcDisplayName?: string;
  isMultiOrgEnabled: boolean;
  isSsoEnabled: boolean;
  samlSsoEnabled: boolean;
  samlTenant: string;
  samlProduct: string;
}

export const LoginForm = ({
  emailAuthEnabled,
  publicSignUpEnabled,
  passwordResetEnabled,
  isMultiOrgEnabled,
}: LoginFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const callbackUrl = searchParams?.get("callbackUrl") ?? "";
  const { t } = useTranslate();

  const form = useForm<TLoginForm>({
    defaultValues: {
      email: searchParams?.get("email") ?? "",
      password: "",
      totpCode: "",
      backupCode: "",
    },
    resolver: zodResolver(ZLoginForm),
  });

  const onSubmit: SubmitHandler<TLoginForm> = async (data) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FORMBRICKS_LOGGED_IN_WITH_LS, "Email");
    }
    try {
      const signInResponse = await signIn("credentials", {
        callbackUrl: callbackUrl ?? "/",
        email: data.email.toLowerCase(),
        password: data.password,
        ...(totpLogin && { totpCode: data.totpCode }),
        ...(totpBackup && { backupCode: data.backupCode }),
        redirect: false,
      });

      if (signInResponse?.error === "second factor required") {
        setTotpLogin(true);
        return;
      }

      if (signInResponse?.error === "Email Verification is Pending") {
        const emailTokenActionResponse = await createEmailTokenAction({ email: data.email });
        if (emailTokenActionResponse?.data) {
          router.push(`/auth/verification-requested?token=${emailTokenActionResponse?.data}`);
        } else {
          const errorMessage = getFormattedErrorMessage(emailTokenActionResponse);
          toast.error(errorMessage);
        }
        return;
      }

      if (signInResponse?.error) {
        toast.error(signInResponse.error);
        return;
      }

      if (!signInResponse?.error) {
        router.push(searchParams?.get("callbackUrl") ?? "/");
      }
    } catch (error) {
      toast.error(error.toString());
    }
  };

  const [showLogin, setShowLogin] = useState(true);
  const [totpLogin, setTotpLogin] = useState(false);
  const [totpBackup, setTotpBackup] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inviteToken = callbackUrl ? new URL(callbackUrl).searchParams.get("token") : null;
  const adminMode = searchParams?.get("admin") === "true";

  useEffect(() => {

    if (!adminMode)
      formRef.current?.requestSubmit();

  }, []);


  const formLabel = useMemo(() => {
    if (totpBackup) {
      return t("auth.login.enter_your_backup_code");
    }

    if (totpLogin) {
      return t("auth.login.enter_your_two_factor_authentication_code");
    }

    return adminMode ? t("auth.login.login_to_your_account") : '';
  }, [t, totpBackup, totpLogin]);

  const TwoFactorComponent = useMemo(() => {
    return null;
  }, [form, totpBackup, totpLogin]);

  return (
    <FormProvider {...form}>
      <div className="text-center">
        <h1 className="mb-4 text-slate-700">{formLabel}</h1>

        <div className="space-y-2">
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {TwoFactorComponent}
            {showLogin && (
              <div className={cn(totpLogin && "hidden", "space-y-2")} hidden={!adminMode}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <div>
                          <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={field.value}
                            onChange={(email) => field.onChange(email)}
                            placeholder="work@email.com"
                            className="focus:border-brand-dark focus:ring-brand-dark block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                          />
                          {error?.message && <FormError className="text-left">{error.message}</FormError>}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <div>
                          <PasswordInput
                            id="password"
                            autoComplete="current-password"
                            placeholder="*******"
                            aria-placeholder="password"
                            aria-label="password"
                            aria-required="true"
                            className="focus:border-brand-dark focus:ring-brand-dark block w-full rounded-md border-slate-300 pr-8 shadow-sm sm:text-sm"
                            value={field.value}
                            onChange={(password) => field.onChange(password)}
                          />
                          {error?.message && <FormError className="text-left">{error.message}</FormError>}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                {passwordResetEnabled && (
                  <div className="ml-1 text-right transition-all duration-500 ease-in-out">
                    <Link
                      href="/auth/forgot-password"
                      className="hover:text-brand-dark text-xs text-slate-500">
                      {t("auth.login.forgot_your_password")}
                    </Link>
                  </div>
                )}
              </div>
            )}
            {emailAuthEnabled && (
              <Button
                onClick={() => {
                  if (!showLogin) {
                    setShowLogin(true);
                    // Add a slight delay before focusing the input field to ensure it's visible
                    setTimeout(() => emailRef.current?.focus(), 100);
                  } else if (formRef.current) {
                    formRef.current.requestSubmit();
                  }
                }}
                className="relative w-full justify-center"
                loading={form.formState.isSubmitting}>
                {totpLogin ? t("common.submit") : adminMode ? t("auth.login.login_with_email") : 'SensUs Identity login'}
                {/*{lastLoggedInWith && lastLoggedInWith === "Email" ? (
                  <span className="absolute right-3 text-xs opacity-50">{t("auth.last_used")}</span>
                ) : null}*/}
              </Button>
            )}
          </form>
        </div>

        {publicSignUpEnabled && !totpLogin && isMultiOrgEnabled && (
          <div className="mt-9 text-center text-xs">
            <span className="leading-5 text-slate-500">{t("auth.login.new_to_formbricks")}</span>
            <br />
            <Link
              href={inviteToken ? `/auth/signup?inviteToken=${inviteToken}` : "/auth/signup"}
              className="font-semibold text-slate-600 underline hover:text-slate-700">
              {t("auth.login.create_an_account")}
            </Link>
          </div>
        )}
      </div>

      {totpLogin && !totpBackup && (
        <div className="mt-9 text-center text-xs">
          <span className="leading-5 text-slate-500">{t("auth.login.lost_access")}</span>
          <br />
          <div className="flex flex-col">
            <button
              type="button"
              className="font-semibold text-slate-600 underline hover:text-slate-700"
              onClick={() => {
                setTotpBackup(true);
              }}>
              {t("auth.login.use_a_backup_code")}
            </button>

            <button
              type="button"
              className="mt-4 font-semibold text-slate-600 underline hover:text-slate-700"
              onClick={() => {
                setTotpLogin(false);
              }}>
              {t("common.go_back")}
            </button>
          </div>
        </div>
      )}

      {totpBackup && (
        <div className="mt-9 text-center text-xs">
          <button
            type="button"
            className="font-semibold text-slate-600 underline hover:text-slate-700"
            onClick={() => {
              setTotpBackup(false);
            }}>
            {t("common.go_back")}
          </button>
        </div>
      )}
    </FormProvider>
  );
};
