# Atomic IQ 💬

Reach your customers on WhatsApp in seconds — no contact clutter, no friction. Chat, call, broadcast, and schedule follow-ups without saving a single number. Built for business owners who move fast. Built with **Expo**, **Uniwind**, and **SQLite** (Drizzle ORM).

## 👤 Who This Is For

You run a business and your customers are on WhatsApp. You need to reach them quickly — without saving every number to your personal contacts. You send order updates, payment confirmations, appointment reminders, or promotional broadcasts. You don't want a heavy CRM. You want something fast that lives on your phone.

**Perfect for:** real estate agents, delivery services, salons & barbers, freelancers, small retailers, service providers, and anyone who messages customers on WhatsApp daily.

---

## ✨ Features

### 📲 Reach Customers Instantly

- **One-tap Chat or Call**: Type a customer's number and you're talking to them in seconds — no saving to your phonebook, no friction.
- **Smart Clipboard**: Copy a number anywhere (website, email, SMS) and the app detects it automatically. One tap to paste.
- **Recent Customers**: Every number you contact is saved locally in your history, with names pulled from your device contacts so you know who's who.

### 📢 Broadcast to Multiple Customers

- **Broadcast Mode**: Draft one message and send it to a list of customers one by one. Track who's been sent with a progress bar and checklist — pick up right where you left off, even after switching away from the app.
- **Customer Lists by Number**: Add recipients by phone number — no need to have them in your contacts.

### ⏰ Never Drop a Follow-up

- **Follow-up Reminders**: Schedule a reminder for any customer. Get a notification when it's time, tap it, and you're in WhatsApp with the message pre-filled.
- **Reminder Dashboard**: See overdue, upcoming, and completed follow-ups in one place. Mark them done or delete as you go.

### 📝 Message Faster with Templates

- **Quick Response Templates**: Save your most-used messages — order confirmations, payment requests, appointment reminders — and insert them with one tap.
- **Inline Message Composer**: Format your messages with **bold**, _italic_, ~strikethrough~, `monospace`, bullet lists, numbered lists, and blockquotes. A live preview shows exactly how the message will look before you send.

### 🌍 Works Across Borders

- **Auto Country Detection**: Type an international number and the app detects the country from the prefix — no manual selection needed.
- **Searchable Country Picker**: Need to switch countries? Search by name, code, or calling code, with flags for quick visual scanning.

### 🔒 Private by Default

- **On-device Storage**: All customer data stays on your phone (SQLite), not in the cloud. Your customer list is yours alone.
- **Dark Mode**: Easy on the eyes, follows your system preference.

---

## 📸 Screenshots

|                                Home Screen                                |                                     Smart Clipboard                                      |                                   Start Chat                                   |
| :-----------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------: |
| <img src="./assets/screenshots/home.png" width="250" alt="Home Screen" /> | <img src="./assets/screenshots/cliboard-number.png" width="250" alt="Smart Clipboard" /> | <img src="./assets/screenshots/start-chat.png" width="250" alt="Start Chat" /> |

|                                     Recent Contacts                                      |                                     Swipe to Delete                                      |
| :--------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: |
| <img src="./assets/screenshots/recent-contacts.png" width="250" alt="Recent Contacts" /> | <img src="./assets/screenshots/swipe-to-delete.png" width="250" alt="Swipe to Delete" /> |

---

## 🛠️ Tech Stack

- **Framework**: [Expo SDK 56](https://expo.dev) + [React Native 0.85](https://reactnative.dev)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com) + [Uniwind](https://uniwind.dev)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team)
- **Animations**: [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) + [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- **Icons**: [Lucide React Native](https://lucide.dev)
- **Notifications**: [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) — local push notifications for follow-up reminders
- **Countries**: [react-native-country-picker-modal](https://github.com/xcarpentier/react-native-country-picker-modal) + [react-native-country-flag](https://github.com/Chinapy/react-native-country-flag)
- **Clipboard**: [Expo Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/)
- **Haptics**: [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- **Device Contacts**: [Expo Contacts](https://docs.expo.dev/versions/latest/sdk/contacts/) + [Expo Intent Launcher](https://docs.expo.dev/versions/latest/sdk/intent-launcher/) (Android save-contact intent)
- **Date Formatting**: [date-fns](https://date-fns.org)
- **Toast Messages**: [react-native-toast-message](https://github.com/calintamas/react-native-toast-message)
- **UI Primitives**: [@expo/ui](https://docs.expo.dev/versions/latest/sdk/ui/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Yarn](https://yarnpkg.com/) (or Bun)
- **For Android native builds:**
  - [Android Studio](https://developer.android.com/studio) (install to `/opt/android-studio` on Linux)
  - Android SDK (platform-tools, build-tools, platform, NDK)
  - JDK 21+ (the JetBrains Runtime bundled with Android Studio works)

### Environment Setup (Linux)

Add these to your `~/.zshrc` (or `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/opt/android-studio/jbr/
export PATH=${PATH}:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$JAVA_HOME/bin
```

Then reload your shell:

```bash
source ~/.zshrc
```

Verify the setup:

```bash
java -version          # should print OpenJDK 21.x
adb --version          # should print Android Debug Bridge version
sdkmanager --version   # should print version info
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dannysofftie/atomiciq.git
   cd atomiciq
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

### 🏃‍♂️ Run Locally

**Dev server (Expo Go for quick testing):**

```bash
yarn start
```

- Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).
- Press `a` to open in Android Emulator or `i` to open in iOS Simulator.

Note: Some features (contacts, notifications) require a native dev build. Use the commands below for full functionality.

**Native Android build:**

```bash
yarn run android
```

**Native iOS build:**

```bash
yarn run ios
```

---

## 📦 Building for Production

### Android APK (Direct Install)

```bash
yarn build:android
```

This will generate `build/atomiciq.apk`. You can transfer this file to your phone and install it.

### Android App Bundle (Play Store)

```bash
yarn build:android:aab
```

This will generate `build/atomiciq.aab`.

---

## 📱 Project Structure

```sh
src/
├── app/                    # Expo Router file-based navigation
│   ├── _layout.tsx         # Root layout — gesture handler, theme, notification tap handler
│   ├── index.tsx           # Home screen — phone input, country picker, call/WhatsApp buttons
│   ├── broadcast/          # Broadcast (multi-recipient messaging)
│   │   ├── broadcast.tsx   #   Broadcast list with progress indicators
│   │   ├── [id].tsx        #   Broadcast detail — message composer + recipient checklist
│   │   └── new.tsx         #   Creates a blank broadcast, redirects to detail
│   ├── reminders.tsx       # Follow-up reminders — overdue / upcoming / completed sections
│   └── templates.tsx       # Quick response templates — add, edit, copy, delete
├── components/             # Reusable UI components
│   ├── AppHeader.tsx       #   Safe-area header with app title and 3 nav icon buttons
│   ├── PhoneInput.tsx      #   Phone entry with paste chip, validation, expandable message composer
│   ├── CountrySelector.tsx #   Country trigger button + CountryPickerSheet animated bottom sheet
│   ├── StartChatButton.tsx #   Call and WhatsApp dual-action button
│   ├── RecentContactsList.tsx  # Paginated list with swipe actions and per-contact dropdown menu
│   ├── FormatBar.tsx       #   Message formatting toolbar (bold, italic, lists, blockquote)
│   ├── MessageEditor.tsx   #   Composable editor: FormatBar + text input + live preview
│   ├── MessagePreview.tsx  #   Collapsible card rendering WhatsApp markdown as styled text
│   ├── TemplateChips.tsx   #   Horizontal scroll of template pills with copy/delete
│   └── ReminderSheet.tsx   #   Animated bottom sheet for scheduling follow-up notifications
├── db/                     # SQLite database (expo-sqlite + Drizzle ORM)
│   ├── schema.ts           #   5 tables: recent_contacts, broadcasts, broadcast_contacts, templates, reminders
│   ├── client.ts           #   Database client with WAL mode, foreign keys, and migrations
│   ├── index.ts            #   21 query functions — full CRUD for all tables
│   └── migrations/         #   Drizzle SQL migrations
├── store/                  # Zustand state management
│   └── useAppStore.ts      #   Single store — phone input, country detection, contacts, templates, actions
├── hooks/                  # Custom React hooks
│   └── useSmartClipboard.ts    # Monitors clipboard for phone numbers on app focus
├── types/                  # TypeScript declarations (css.d.ts, uniwind-types.d.ts)
└── global.css              # Tailwind/Uniwind entry point
```

---

## 🔧 Key Design Details

- **Country auto-detection**: `setPhoneNumber` strips non-digits, searches a preloaded cache of all countries sorted by calling-code length (longest-match-first). Detects the country from the prefix and splits it from the local number in a single pass.
- **Notification deep link**: Tapping a reminder notification opens WhatsApp directly to the contact with the message pre-filled, via `Linking.openURL` in the `_layout.tsx` notification response listener.
- **Broadcast auto-refresh**: The broadcast detail screen listens to `AppState` changes. When the user returns from WhatsApp after sending, it reloads the contact checklist to mark the latest recipient as sent.
- **Format-aware message preview**: `MessagePreview` parses WhatsApp markdown into styled `<Text>` segments — handles inline formatting (`*bold*`, `_italic_`, `~strike~`, `` `mono` ``) and line prefixes (`*` bullets, `1.` numbered, `>` blockquotes with a vertical bar).
- **Swipe actions on contacts**: Swipe left (red) deletes the contact from history. Swipe right (green) opens an SMS to that number.
- **Gradle workaround**: The project uses Gradle 8.13 instead of 9.x due to a Gradle internal bug where `JvmVendorSpec.IBM_SEMERU` was removed but the Foojay toolchain resolver still references it. AGP 8.12.0 is fully compatible with Gradle 8.13.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License.
