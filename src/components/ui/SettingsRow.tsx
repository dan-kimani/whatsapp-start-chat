import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useIsDark } from "../../hooks/useIsDark";

interface Props {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

export default function SettingsRow({ icon, label, subtitle, onPress, right }: Props) {
  const isDark = useIsDark();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !right}
      style={({ pressed }) => [pressed && { backgroundColor: isDark ? "#1e293b" : "#f3f4f6" }]}
      className="flex-row items-center px-5 py-3.5"
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        {icon}
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-gray-900 dark:text-gray-100">{label}</Text>
        {subtitle && (
          <Text className="text-[13px] text-gray-400 dark:text-gray-500">{subtitle}</Text>
        )}
      </View>
      {right || (onPress && <ChevronRight size={16} color="#9ca3af" />)}
    </Pressable>
  );
}
