import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SwitchRow from "@/components/ui/SwitchRow";
import React, { useState } from "react";
import { Text, View } from "react-native";

const TWO_FACTOR_METHODS = [
  {
    id: "sms",
    label: "Text Message",
    description: "Receive updates about your account activity.",
  },
  {
    id: "app",
    label: "Authentication App",
    description: "Receive secure codes for added protection.",
  },
  {
    id: "email",
    label: "Email Address",
    description: "Receive security alerts and important updates.",
  },
] as const;

type MethodId = (typeof TWO_FACTOR_METHODS)[number]["id"];

const TwoFactorAuth = () => {
  const [methods, setMethods] = useState<Record<MethodId, boolean>>({
    sms: false,
    app: false,
    email: false,
  });

  const toggleMethod = (id: MethodId) => {
    setMethods((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppSafeAreaView>
      <ScreenHeader
        title="Two Factor Auth"
        subtitle="Add an extra layer of security to your account"
      />

      <View className="mt-5 px-[20px] flex-1 gap-y-6">
        <Text className="text-base text-gray-400">
          Manage your 2-Factor Authentication (2FA) settings to enhance your
          account security.
        </Text>

        <View className="mt-2 gap-y-4 flex-col">
          {TWO_FACTOR_METHODS.map((method) => (
            <SwitchRow
              key={method.id}
              label={method.label}
              description={method.description}
              value={methods[method.id]}
              onValueChange={() => toggleMethod(method.id)}
            />
          ))}
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default TwoFactorAuth;
