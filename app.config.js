const pkg = require("./package.json");

module.exports = {
  expo: {
    name: "Atomic IQ",
    slug: "atomiciq",
    version: pkg.version,
    scheme: "atomiciq",
    jsEngine: "hermes",
    userInterfaceStyle: "automatic",
    orientation: "default",
    web: {
      output: "static",
    },
    icon: "./assets/icon.png",
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.atomiciq.com",
      versionCode: 1,
      permissions: [
        "READ_CONTACTS",
        "WRITE_CONTACTS",
        "android.permission.READ_CONTACTS",
        "android.permission.WRITE_CONTACTS",
      ],
    },
    extra: {
      router: {},
      eas: {
        projectId: "9cdcb651-7454-4daa-a465-de5c3941483b",
      },
    },
    plugins: [
      "expo-router",
      "expo-sqlite",
      "expo-status-bar",
      [
        "expo-contacts",
        {
          contactsPermission:
            "Allow Atomic IQ to read your contacts to show names for recent numbers.",
        },
      ],
    ],
  },
};
