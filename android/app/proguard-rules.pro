# ========================================================
# PROGUARD / R8 KEEP RULES FOR ADMOB & GOOGLE PLAY SERVICES
# ========================================================

# Keep Google Mobile Ads (AdMob) classes and interfaces intact
-keep class com.google.android.gms.ads.** { *; }
-keep interface com.google.android.gms.ads.** { *; }

# Keep the Capacitor Community AdMob plugin native bridge classes intact
-keep class com.capacitorjs.plugins.admob.** { *; }
-keep class com.google.android.gms.common.** { *; }
