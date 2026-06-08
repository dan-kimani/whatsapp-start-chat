import { Trash2 } from "lucide-react-native";
import { View } from "react-native";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

export default function SwipeDeleteAction(_prog: SharedValue<number>, _drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => ({
    transform: [{ scale: Math.min(Math.max(_prog.value, 0), 1.2) }],
    opacity: _prog.value,
  }));

  return (
    <View className="w-25 items-end justify-center rounded-xl bg-red-500 pr-6">
      <Reanimated.View style={styleAnimation}>
        <Trash2 color="white" size={22} />
      </Reanimated.View>
    </View>
  );
}
