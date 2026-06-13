package com.axolync.android.car

import android.content.Intent
import android.content.pm.ApplicationInfo
import androidx.car.app.CarAppService
import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.model.Action
import androidx.car.app.model.Header
import androidx.car.app.model.Pane
import androidx.car.app.model.PaneTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Template
import androidx.car.app.validation.HostValidator

class AxolyncCarAppService : CarAppService() {
    override fun createHostValidator(): HostValidator {
        if (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0) {
            return HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
        }

        return HostValidator.Builder(applicationContext)
            .addAllowedHosts(androidx.car.app.R.array.hosts_allowlist_sample)
            .build()
    }

    override fun onCreateSession(): Session = AxolyncCarSession()
}

private class AxolyncCarSession : Session() {
    override fun onCreateScreen(intent: Intent): Screen = AxolyncCarHomeScreen(carContext)
}

private class AxolyncCarHomeScreen(carContext: CarContext) : Screen(carContext) {
    override fun onGetTemplate(): Template {
        val statusRow = Row.Builder()
            .setTitle("Axolync")
            .addText("Open the phone app for full karaoke controls.")
            .build()

        val launcherRow = Row.Builder()
            .setTitle("Android Auto")
            .addText("This car-safe surface keeps Axolync selectable in the launcher.")
            .build()

        val pane = Pane.Builder()
            .addRow(statusRow)
            .addRow(launcherRow)
            .build()

        val header = Header.Builder()
            .setStartHeaderAction(Action.APP_ICON)
            .build()

        return PaneTemplate.Builder(pane)
            .setHeader(header)
            .build()
    }
}
