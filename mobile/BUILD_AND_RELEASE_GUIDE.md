# 📱 RawSports Live: A-to-Z Mobile Build & Release Guide

This guide contains everything you need to know to build, update, and release new versions of the RawSports Live native Android application.

---

## 🔑 1. Android Keystore (.jks) and Credentials

### 🛡️ What is a `.jks` file?
A `.jks` (Java KeyStore) file is an encrypted security file that acts as your developer digital signature. It contains:
1.  **The Private Signing Key:** Used to sign your app's code. It proves to Android and Google Play that the app actually came from you.
2.  **The Public Certificate:** Used by Google Play to verify your signature when you upload updates.

> [!IMPORTANT]
> **Never lose this file or its passwords!** If you lose them, Google Play Store will reject any future updates you upload for the app. Keep them safe and do not commit the downloaded `.jks` file to your Git repository.

---

## 🔐 2. How to View Passwords & Download the Keystore File

Expo automatically manages and signs your builds in the cloud. If you ever need to view your keystore passwords or download the signing keystore file:

### Known Credentials Details
*   **Key Alias:** `35ce299beb03f6683332a3b29e524671`
*   **Keystore Type:** `JKS`

### Option A: Via Terminal (Displays Passwords in Plain Text)
Since Expo hides credentials on the web dashboard for security, running the interactive CLI in your terminal is the only way to view the plain-text passwords:

1.  Open your terminal on your computer.
2.  Navigate to the `mobile/` directory:
    ```bash
    cd c:\Users\bishal\Desktop\rawsportslive\mobile
    ```
3.  Run the credentials command:
    ```bash
    eas credentials
    ```
4.  Select **Android** ➜ Select **production** (or `com.rawsportslive.app`).
5.  The terminal will display:
    *   **Keystore Alias**
    *   **Keystore Password**
    *   **Key Password**
    *   An option to download the `.jks` keystore file directly.

### Option B: Via Expo Dashboard (Web Browser)
You can download the keystore file directly from the Expo web dashboard:

1.  Go to the [EAS Android Credentials Dashboard](https://expo.dev/accounts/rawsportslive/projects/rawsports-live/credentials/android/com.rawsportslive.app).
2.  Locate the **Android upload keystore** section.
3.  On the right side of the row, click the **three dots options button (`...`)**.
4.  Click **Download keystore** to save the `.jks` file to your computer.

---

## 🔄 3. How to Update the App to a New Version
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

## 📦 4. How to Compile the App

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
