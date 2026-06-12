import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";

export default function BackButton() {
  return (
    <Pressable onPress={() => router.back()} className="p-2">
      <ArrowLeft size={22} color="#6b7280" />
    </Pressable>
  );
}
