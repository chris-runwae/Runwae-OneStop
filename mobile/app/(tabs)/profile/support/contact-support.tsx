import OptionButtons from "@/components/ui/OptionButtons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { CONTACT_ITEMS } from "@/constants/contact-support.constant";
import { MessageSquare } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ContactSupport = () => {
  return (
    <SafeAreaView className="flex-1">
      <ScreenHeader
        title="Contact Support"
        subtitle="We would love to hear from you."
      />

      <View className="mt-10 px-[20px] flex-1 relative">
        <TouchableOpacity className="absolute bottom-32 flex items-center justify-center right-5 h-[50px] w-[50px] bg-primary rounded-full">
          <MessageSquare size={20} strokeWidth={2} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="flex-col gap-y-5">
          {CONTACT_ITEMS.map((item) => (
            <OptionButtons
              key={item.title}
              title={item.title}
              icon={item.icon}
              onPress={item.onPress}
              badge={item.badge}
              badgeText={item.badgeText}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ContactSupport;
