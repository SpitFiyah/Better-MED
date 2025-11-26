# Medical Verification Platform

## Overview
This project contains a web and mobile application for verifying medicine batches, using Supabase as a shared database. The website includes a public landing page, while the mobile app provides a streamlined, direct-to-tool experience.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** Supabase
- **Mobile:** Capacitor

---

## How to Run the Website

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your web browser.

---

## How to Create the Shareable Android APK

This is the most important part. To see the correct "Build" menu, you must open the `android` folder as its own project in Android Studio.

### Step 1: Prepare the Android Project

First, run the necessary build and sync commands from your terminal inside the `frontend` folder:

```bash
# 1. Build the web assets
npm run build

# 2. Sync the assets with the Android project
npx capacitor sync android
```

### Step 2: Open the Correct Project in Android Studio

1.  Open Android Studio.
2.  If you have the `hackathon` project open, **close it** by going to **File -> Close Project**.
3.  From the Android Studio welcome screen, click on **Open**.
4.  Navigate to the correct folder: `D:/hackathon/frontend/android`.
5.  Select the `android` folder and click **OK**. Do **NOT** open the main `hackathon` or `frontend` folders.
6.  Android Studio will now load this as a proper Android project. You will see a `app` folder and `Gradle Scripts` in the Project Explorer on the left. This is how you know you've opened it correctly.

### Step 3: Build the APK

1.  Wait for Android Studio to finish syncing Gradle (a progress bar will be at the bottom).
2.  Now, the **Build** option will be visible in the top menu bar.
3.  Click on **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
4.  Once the build is complete, a notification will pop up. Click the **locate** link.
5.  The `app-debug.apk` file will be in that folder. You can now share this file and install it on your phones.
"# Better-meds" 
