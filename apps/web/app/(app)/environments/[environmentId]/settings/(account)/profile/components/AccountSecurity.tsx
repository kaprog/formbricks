"use client";

import { useTranslate } from "@tolgee/react";
import { TUser } from "@formbricks/types/user";

interface AccountSecurityProps {
  user: TUser;
}

export const AccountSecurity = ({}: AccountSecurityProps) => {
  const { t } = useTranslate();
  return (
    <div>
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-slate-800">
            {t("environments.settings.profile.two_factor_authentication")}
          </h1>

          <p className="text-xs text-slate-600">
            {t("environments.settings.profile.two_factor_authentication_description")}
          </p>
        </div>
      </div>
    </div>
  );
};
