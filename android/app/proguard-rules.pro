# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-gesture-handler
-keep class com.swmansion.gesturehandler.** { *; }

# expo-router — dynamic imports
-keep class com.whatsappstartchat.** { *; }

# expo-modules-core
-keep class expo.modules.** { *; }

# Keep ALL expo modules — they use reflection for autolinking
-keep class expo.modules.** { *; }

# Keep app package
-keep class com.whatsappstartchat.** { *; }

# Keep React Native bridge interfaces
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep metadata
-keepattributes *Annotation*,Signature,SourceFile,LineNumberTable
-keep class expo.modules.** { *; }

# General keep rules for React Native JS bundle
-keep,allowobfuscation class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep,allowobfuscation class * {
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}
-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Don't strip debug symbols (helps with crash reports)
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
