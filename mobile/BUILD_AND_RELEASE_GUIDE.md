# 📱 RawSports Live: A-to-Z Mobile Build & Release Guide

This guide contains everything you need to know to build, update, and release new versions of the RawSports Live native Android application.

---

## 🔑 1. How to View & Download Your Keystore Credentials
Expo automatically manages and signs your builds in the cloud. If you ever need to view your keystore passwords or download the signing keystore file for manual builds:

### Option A: Via Terminal (Fastest)
1. Open your terminal inside the `mobile/` directory.
2. Run:
   ```bash
   eas credentials
   ```
3. Select **Android** ➜ Select **production**.
4. The terminal will display:
   *   **Keystore Alias**
   *   **Keystore Password**
   *   **Key Password**
   *   An option to download the `.jks` keystore file directly.

### Option B: Via Expo Dashboard (Web Browser)
1. Go to the [EAS Project Credentials Dashboard](https://expo.dev/accounts/rawsportslive/projects/rawsports-live/credentials).
2. Under **Application Signatures** or **Credentials**, you can view all passwords and download the keystore file.

---

## 🔄 2. How to Update the App to a New Version
When you make changes to the app code and want to push an update to your users or Google Play Store:

1. Open `mobile/app.json`.
2. Locate the `version` and `android.versionCode` properties:
   ```json
   {
     "expo": {
       "version": "1.0.0",           // Update this (e.g. "1.0.1" or "1.1.0") for users to see
       "android": {
         "versionCode": 1,          // ALWAYS increment this by +1 for every new build (e.g. 2, 3, 4)
         ...
       }
     }
   }
   ```
   *Note: Google Play Store will reject any uploaded bundle (.aab) that has a `versionCode` equal to or lower than the previous upload.*

---

## 📦 3. How to Compile the App

Open your terminal in the `mobile/` directory and run the appropriate build command.

### 📲 Build APK (For installing directly on Android phones/testing)
This compiles a standalone `.apk` file that you can share with friends or install directly on your phone:
```bash
eas build --platform android --profile preview
```
*When finished, the terminal will show a QR code you can scan with your phone's camera, or a direct link to download the APK.*

### 📦 Build AAB (For Google Play Store Submission)
This compiles the production App Bundle (`.aab`) required by Google Play Console:
```bash
eas build --platform android --profile production
```
*Once finished, download the compiled `.aab` file and upload it to the Google Play Console.*

---

## 🛠️ Troubleshooting & Command Reference

| Action | Command |
| :--- | :--- |
| **Log in to Expo** | `eas login` |
| **Check login status** | `eas whoami` |
| **View active builds** | `eas build:list` |
| **Cancel a running build** | `eas build:cancel <build-id>` |
| **Force link local files** | `eas init --non-interactive --force` |
