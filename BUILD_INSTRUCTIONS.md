# Manual Build Instructions

It seems the automated build process is not returning output in this environment. Please run the following commands manually in your terminal to build the app.

## 1. Build the Web App
Open a terminal in `D:\medik\Better-MED\frontend` and run:

```bash
npm run build
```

This should create a `dist` folder.

## 2. Build the Android APK
Once the web build is done, run:

```bash
# Sync web assets to Android project
npx cap sync android

# Build the APK (Windows)
cd android
.\gradlew.bat assembleDebug
```

The APK will be located at:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## 3. Troubleshooting
If `npm run build` fails:
- Ensure `npm install` completed successfully.
- Check if `node_modules` exists.
- Try running `npm install` again.
