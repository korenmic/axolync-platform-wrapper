use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

const STORAGE_PROFILE_ENV: &str = "AXOLYNC_DESKTOP_STORAGE_PROFILE";
const STORAGE_ROOT_ENV: &str = "AXOLYNC_DESKTOP_STORAGE_ROOT";
const NATIVE_DATA_ENV: &str = "AXOLYNC_NATIVE_DATA_DIR";
const EMBEDDED_NATIVE_SERVICE_COMPANION_RUNTIME_CONFIG_JSON: &str =
    include_str!("generated_native_service_companion_runtime_config.json");

#[derive(Clone, Deserialize)]
struct DesktopStorageRuntimeConfig {
    #[serde(rename = "storageProfile", default)]
    storage_profile: Option<String>,
}

#[derive(Clone, Serialize)]
pub struct DesktopStoragePlacement {
    #[serde(rename = "storageProfile")]
    pub storage_profile: String,
    #[serde(rename = "storageRoot")]
    pub storage_root: String,
    #[serde(rename = "appDataDir")]
    pub app_data_dir: String,
    #[serde(rename = "webviewUserDataDir")]
    pub webview_user_data_dir: String,
    #[serde(rename = "nativeAssetsDir")]
    pub native_assets_dir: String,
    #[serde(rename = "logsDir")]
    pub logs_dir: String,
    #[serde(rename = "cacheDir")]
    pub cache_dir: String,
    pub warnings: Vec<String>,
}

impl DesktopStoragePlacement {
    pub fn native_assets_path(&self) -> PathBuf {
        PathBuf::from(&self.native_assets_dir)
    }
}

fn default_storage_profile() -> &'static str {
    if cfg!(target_os = "windows") {
        "portable"
    } else {
        "axolync-home"
    }
}

fn normalize_storage_profile(value: Option<String>) -> Result<String, String> {
    let normalized = value
        .unwrap_or_else(|| default_storage_profile().to_string())
        .trim()
        .to_string();
    if normalized == "portable" || normalized == "axolync-home" {
        Ok(normalized)
    } else {
        Err(format!(
            "Unsupported Axolync desktop storage profile \"{}\".",
            normalized
        ))
    }
}

fn configured_storage_profile() -> Option<String> {
    if let Ok(explicit) = std::env::var(STORAGE_PROFILE_ENV) {
        if !explicit.trim().is_empty() {
            return Some(explicit);
        }
    }
    let parsed: DesktopStorageRuntimeConfig = serde_json::from_str(
        EMBEDDED_NATIVE_SERVICE_COMPANION_RUNTIME_CONFIG_JSON,
    )
    .unwrap_or(DesktopStorageRuntimeConfig {
        storage_profile: None,
    });
    parsed.storage_profile
}

fn resolve_axolync_home_root() -> Result<PathBuf, String> {
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map_err(|_| String::from("Unable to resolve Axolync home storage because the home directory is unavailable."))?;
    Ok(PathBuf::from(home).join(".axolync").join("storage"))
}

fn resolve_portable_root(warnings: &mut Vec<String>) -> Result<PathBuf, String> {
    if !cfg!(target_os = "windows") {
        warnings.push(String::from("portable-profile-mapped-to-axolync-home-on-posix"));
        return resolve_axolync_home_root();
    }
    let exe_path = std::env::current_exe().map_err(|error| error.to_string())?;
    let exe_dir = exe_path
        .parent()
        .ok_or_else(|| String::from("Unable to resolve executable directory for portable storage."))?;
    Ok(exe_dir.join("storage"))
}

fn ensure_writable_directory(dir_path: &Path) -> Result<(), String> {
    fs::create_dir_all(dir_path).map_err(|error| error.to_string())?;
    let probe_path = dir_path.join(".axolync-storage-probe");
    fs::write(&probe_path, chrono_like_probe()).map_err(|error| error.to_string())?;
    let _ = fs::remove_file(probe_path);
    Ok(())
}

fn chrono_like_probe() -> String {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_millis().to_string())
        .unwrap_or_else(|_| String::from("0"))
}

pub fn resolve_desktop_storage_placement() -> Result<DesktopStoragePlacement, String> {
    let storage_profile = normalize_storage_profile(configured_storage_profile())?;
    let mut warnings = Vec::new();
    let storage_root = if storage_profile == "portable" {
        resolve_portable_root(&mut warnings)?
    } else {
        resolve_axolync_home_root()?
    };
    let app_data_dir = storage_root.join("app-data");
    let webview_user_data_dir = storage_root.join("webview-user-data");
    let native_assets_dir = storage_root.join("native-assets");
    let logs_dir = storage_root.join("logs");
    let cache_dir = storage_root.join("cache");
    for dir_path in [
        &storage_root,
        &app_data_dir,
        &webview_user_data_dir,
        &native_assets_dir,
        &logs_dir,
        &cache_dir,
    ] {
        ensure_writable_directory(dir_path)?;
    }
    Ok(DesktopStoragePlacement {
        storage_profile,
        storage_root: storage_root.to_string_lossy().to_string(),
        app_data_dir: app_data_dir.to_string_lossy().to_string(),
        webview_user_data_dir: webview_user_data_dir.to_string_lossy().to_string(),
        native_assets_dir: native_assets_dir.to_string_lossy().to_string(),
        logs_dir: logs_dir.to_string_lossy().to_string(),
        cache_dir: cache_dir.to_string_lossy().to_string(),
        warnings,
    })
}

pub fn initialize_desktop_storage() -> Result<DesktopStoragePlacement, String> {
    let placement = resolve_desktop_storage_placement()?;
    std::env::set_var(STORAGE_PROFILE_ENV, &placement.storage_profile);
    std::env::set_var(STORAGE_ROOT_ENV, &placement.storage_root);
    std::env::set_var(NATIVE_DATA_ENV, &placement.native_assets_dir);
    Ok(placement)
}
