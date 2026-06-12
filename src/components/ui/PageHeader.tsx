import { Text, View } from "react-native";

import BackButton from "./BackButton";

interface Props {
  title: string;
  right?: React.ReactNode;
}

export default function PageHeader({ title, right }: Props) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <BackButton />
      <Text className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
        {title}
      </Text>
      {right ?? <View style={{ width: 38 }} />}
    </View>
  );
}
