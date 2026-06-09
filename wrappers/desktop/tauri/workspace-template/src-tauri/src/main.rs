#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod native_service_companion;
mod storage_placement;

fn main() {
    let storage_placement = storage_placement::initialize_desktop_storage()
        .expect("failed to initialize Axolync desktop storage placement");
    native_service_companion::build_tauri_app(storage_placement)
        .run(tauri::generate_context!())
        .expect("error while running tauri desktop host");
}
