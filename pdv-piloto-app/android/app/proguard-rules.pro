# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep all app classes
-keep class br.com.nebulasistemas.pdvpilotoapp.** { *; }

# Keep Stone SDK classes
-keep class br.com.pdvflow.stone.** { *; }

# Keep React Native
-keep class com.facebook.react.** { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# Keep all classes that extend ReactContextBaseJavaModule
-keep public class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    *;
}

# Keep all classes that extend ReactActivity
-keep public class * extends com.facebook.react.ReactActivity {
    *;
}

# Keep Application class
-keep public class * extends android.app.Application {
    *;
}
