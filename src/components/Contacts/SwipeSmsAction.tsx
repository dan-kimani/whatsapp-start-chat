import { MessageSquare } from "lucide-react-native";
import { View } from "react-native";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

export default function SwipeSmsAction(_prog: SharedValue<number>, _drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => ({
    transform: [{ scale: Math.min(Math.max(_prog.value, 0), 1.2) }],
    opacity: _prog.value,
  }));

  return (
    <View className="w-25 items-start justify-center rounded-xl bg-emerald-500 pl-6">
      <Reanimated.View style={styleAnimation}>
        <MessageSquare color="white" size={22} />
      </Reanimated.View>
    </View>
  );
}
