import { View } from "react-native";

export default function SectionGroup({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
      {children}
    </View>
  );
}
