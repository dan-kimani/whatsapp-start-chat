# ============================================================
# R8/ProGuard Rules — Optimized for Release Builds
# ============================================================

# --- React Native Core ---
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Reanimated ---
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# --- Gesture Handler ---
-keep class com.swmansion.gesturehandler.** { *; }

# --- Expo Modules (autolinking uses reflection) ---
-keep class expo.modules.** { *; }

# --- React Native Bridge interfaces ---
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

# --- Native methods ---
-keepclasseswithmembernames class * {
    native <methods>;
}

# --- Keep enumerations ---
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# --- Keep annotations and signatures needed for reflection ---
-keepattributes *Annotation*,Signature,SourceFile,LineNumberTable

# --- DoNotStrip annotations (used by React Native) ---
-keep,allowobfuscation class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep,allowobfuscation class * {
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}

# --- Firebase / Play Services (required by expo-notifications FCM) ---
# Only keep the classes needed for Firebase Cloud Messaging
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.firebase.iid.** { *; }
-keep class com.google.firebase.FirebaseApp { *; }
-keep class com.google.firebase.installations.** { *; }
-keep class com.google.firebase.FirebaseOptions { *; }
-keep class com.google.firebase.FirebaseNetworkException { *; }
-keep class com.google.firebase.concurrent.** { *; }
-keep class com.google.firebase.components.** { *; }
-keep class com.google.firebase.events.** { *; }
-keep class com.google.firebase.heartbeatinfo.** { *; }
-keep class com.google.firebase.platforminfo.** { *; }
# Play Services — only keep what FCM needs
-keep class com.google.android.gms.tasks.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.cloudmessaging.** { *; }
-keep class com.google.android.gms.stats.** { *; }
-keep class com.google.android.gms.base.** { *; }
-keep class com.google.android.gms.basement.** { *; }
# Allow R8 to remove unused code from these packages
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# --- SQLite native module ---
-keep class expo.modules.sqlite.** { *; }

# --- R8 optimizations ---
-optimizationpasses 5
-allowaccessmodification

# --- Strip logging from release builds ---
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
}
