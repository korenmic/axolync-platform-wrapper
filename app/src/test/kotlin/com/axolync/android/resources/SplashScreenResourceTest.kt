package com.axolync.android.resources

import com.axolync.android.R
import org.junit.Test
import org.junit.Assert.*

/**
 * Tests to validate splash screen resources exist and are properly configured.
 * Prevents regression where missing resources cause app crashes on startup.
 * 
 * CRITICAL: These tests prevent app crashes on startup due to missing splash resources.
 */
class SplashScreenResourceTest {
    
    @Test
    fun `splash logo drawable resource ID exists`() {
        // This test prevents regression where splash_logo is missing from drawable/
        // causing app to crash on startup when theme references it
        
        // If R.drawable.splash_logo doesn't exist, this test will fail at compile time
        val resourceId = R.drawable.splash_logo
        
        assertTrue(
            "splash_logo drawable resource ID must exist",
            resourceId != 0
        )
    }
    
    @Test
    fun `splash background color resource ID exists`() {
        val resourceId = R.color.splash_background
        
        assertTrue(
            "splash_background color resource ID must exist",
            resourceId != 0
        )
    }
    
    @Test
    fun `splash background drawable resource ID exists`() {
        val resourceId = R.drawable.splash_background
        
        assertTrue(
            "splash_background drawable resource ID must exist",
            resourceId != 0
        )
    }
    
    @Test
    fun `splash theme resource ID exists`() {
        // Verify that Theme.App.Starting resource ID exists
        val themeId = R.style.Theme_App_Starting
        
        assertTrue(
            "Theme.App.Starting resource ID must exist",
            themeId != 0
        )
    }
}
