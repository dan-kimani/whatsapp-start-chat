import { Text, View, Animated } from "react-native";
import { useEffect, useRef } from "react";

export default function AppHeader() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }),
    ]).start();
  }, []);

  return (
    <View className="pt-14 pb-4 px-6">
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <View className="flex-row items-center mb-3">
          <View className="mr-3 bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-2xl">
            <Text className="text-2xl">👋</Text>
          </View>
          <View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Start a chat</Text>
          </View>
        </View>
        <Text className="text-base text-gray-500 dark:text-gray-400 leading-6 font-medium">Message anyone on WhatsApp without saving their contact first. Fast and simple.</Text>
      </Animated.View>
    </View>
  );
}
