import { Text } from "react-native";

export default function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="mt-6 mb-2 ml-5 text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
      {title}
    </Text>
  );
}
