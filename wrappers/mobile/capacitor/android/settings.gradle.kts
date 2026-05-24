pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "AxolyncAndroid"
include(":app")
include(":capacitor-android")
project(":capacitor-android").projectDir = file("node_modules/@capacitor/android/capacitor")
include(":capacitor-local-notifications")
project(":capacitor-local-notifications").projectDir = file("node_modules/@capacitor/local-notifications/android")
