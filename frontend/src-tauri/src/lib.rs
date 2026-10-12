use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;

use tauri::{Emitter, Manager, State};

use tauri_plugin_global_shortcut::{
    GlobalShortcutExt,
    Shortcut,
    ShortcutState,
};


// ============================================================
// VOICE STATE
// ============================================================

struct VoiceState {
    process: Mutex<Option<Child>>,
    listening: Mutex<bool>,
}


// ============================================================
// START LISTENING
// ============================================================

#[tauri::command]
fn start_listening(
    state: State<'_, VoiceState>,
) -> Result<(), String> {

    let mut process = state
        .process
        .lock()
        .map_err(|e| e.to_string())?;

    let mut listening = state
        .listening
        .lock()
        .map_err(|e| e.to_string())?;

    if *listening {
        return Ok(());
    }

    if let Some(child) = process.as_mut() {
        if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
            *listening = false;
            return Err(format!(
                "Voice process already exited ({status}). Check the Python traceback in the terminal."
            ));
        }

        if let Some(stdin) = child.stdin.as_mut() {

            stdin
                .write_all(b"START\n")
                .map_err(|e| e.to_string())?;

            stdin
                .flush()
                .map_err(|e| e.to_string())?;

            *listening = true;

            println!("Voice listening: START");

            return Ok(());
        }
    }

    Err("Voice process is not running".to_string())
}


// ============================================================
// STOP LISTENING
// ============================================================

#[tauri::command]
fn stop_listening(
    state: State<'_, VoiceState>,
) -> Result<(), String> {

    let mut process = state
        .process
        .lock()
        .map_err(|e| e.to_string())?;

    let mut listening = state
        .listening
        .lock()
        .map_err(|e| e.to_string())?;

    if !*listening {
        return Ok(());
    }

    if let Some(child) = process.as_mut() {
        if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
            *listening = false;
            return Err(format!(
                "Voice process already exited ({status}). Check the Python traceback in the terminal."
            ));
        }

        if let Some(stdin) = child.stdin.as_mut() {

            stdin
                .write_all(b"STOP\n")
                .map_err(|e| e.to_string())?;

            stdin
                .flush()
                .map_err(|e| e.to_string())?;

            *listening = false;

            println!("Voice listening: STOP");

            return Ok(());
        }
    }

    Err("Voice process is not running".to_string())
}


// ============================================================
// START PYTHON VOICE PROCESS
// ============================================================

fn start_voice_process(
    app: &tauri::AppHandle,
) -> Result<Child, String> {

    // Resolve paths from the Rust source location, not the shell's current directory.
    // CARGO_MANIFEST_DIR points to frontend/src-tauri during development.
    let manifest_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let frontend_dir = manifest_dir.parent()
        .ok_or("Could not resolve frontend directory from CARGO_MANIFEST_DIR")?;
    let repo_dir = frontend_dir.parent()
        .unwrap_or(frontend_dir);

    // Support both common layouts:
    //   <repo>/ai/voice.py
    //   <repo>/frontend/ai/voice.py
    let candidates = [
        repo_dir.join("ai").join("voice.py"),
        frontend_dir.join("ai").join("voice.py"),
        manifest_dir.join("ai").join("voice.py"),
    ];
    let voice_path = candidates.iter()
        .find(|candidate| candidate.is_file())
        .cloned()
        .ok_or_else(|| format!(
            "voice.py not found. Checked: {}",
            candidates.iter()
                .map(|p| p.display().to_string())
                .collect::<Vec<_>>()
                .join("; ")
        ))?;

    let project_dir = voice_path.parent()
        .and_then(|p| p.parent())
        .ok_or("Could not resolve voice project directory")?;


    // ========================================================
    // PYTHON PATH
    // ========================================================

    let venv_python = project_dir
        .join(".venv")
        .join("Scripts")
        .join("python.exe");

    let python_path = if venv_python.exists() {

        venv_python

    } else {

        std::path::PathBuf::from("python")
    };


    println!("========================================");
    println!("Pocket AI Voice Engine");
    println!(
        "Project: {}",
        project_dir.display()
    );
    println!(
        "Python: {}",
        python_path.display()
    );
    println!(
        "Voice: {}",
        voice_path.display()
    );
    println!("========================================");


    // ========================================================
    // START PYTHON
    // ========================================================

    let mut child = Command::new(&python_path)
        .arg("-u")
        .arg(&voice_path)
        .current_dir(project_dir)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| {

            format!(
                "Failed to start Python voice process: {}",
                e
            )
        })?;


    // ========================================================
    // PYTHON STDOUT
    // ========================================================

    let stdout = child
        .stdout
        .take()
        .ok_or(
            "Failed to capture Python stdout"
        )?;

    let app_handle = app.clone();

    std::thread::spawn(move || {

        let reader = BufReader::new(stdout);

        for line in reader.lines() {

            match line {

                Ok(line) => {

                    println!(
                        "Python: {}",
                        line
                    );

                    match serde_json::from_str::<
                        serde_json::Value
                    >(&line) {

                        Ok(value) => {

                            if let Err(error) =
                                app_handle.emit(
                                    "voice-event",
                                    value,
                                )
                            {

                                eprintln!(
                                    "Voice event error: {}",
                                    error
                                );
                            }
                        }

                        Err(error) => {

                            eprintln!(
                                "Invalid Python JSON: {}",
                                error
                            );

                            eprintln!(
                                "Python output: {}",
                                line
                            );
                        }
                    }
                }

                Err(error) => {

                    eprintln!(
                        "Python stdout error: {}",
                        error
                    );

                    break;
                }
            }
        }

        println!(
            "Python stdout thread stopped"
        );
    });


    // ========================================================
    // PYTHON STDERR
    // ========================================================

    let stderr = child
        .stderr
        .take()
        .ok_or(
            "Failed to capture Python stderr"
        )?;

    std::thread::spawn(move || {

        let reader = BufReader::new(stderr);

        for line in reader.lines() {

            match line {

                Ok(line) => {

                    eprintln!(
                        "Python ERROR: {}",
                        line
                    );
                }

                Err(error) => {

                    eprintln!(
                        "Python stderr error: {}",
                        error
                    );

                    break;
                }
            }
        }

        eprintln!(
            "Python stderr thread stopped"
        );
    });


    Ok(child)
}


// ============================================================
// TAURI APPLICATION
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build())

        // ====================================================
        // GLOBAL SHORTCUT PLUGIN
        // ====================================================

        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .build()
        )


        // ====================================================
        // SETUP
        // ====================================================

        .setup(|app| {

            // ------------------------------------------------
            // START PYTHON VOICE PROCESS
            // ------------------------------------------------

            let child =
                start_voice_process(
                    app.handle()
                )
                .map_err(|error| {

                    eprintln!(
                        "Voice startup error: {}",
                        error
                    );

                    error
                })?;


            // ------------------------------------------------
            // STORE VOICE PROCESS + STATE
            // ------------------------------------------------

            app.manage(
                VoiceState {
                    process: Mutex::new(
                        Some(child)
                    ),
                    listening: Mutex::new(false),
                }
            );


            // ------------------------------------------------
            // REGISTER CTRL + ALT + A
            // ------------------------------------------------

            let shortcut: Shortcut =
                "CTRL+ALT+A"
                    .parse()
                    .map_err(|e| {

                        format!(
                            "Invalid shortcut: {}",
                            e
                        )
                    })?;


            let app_handle =
                app.handle().clone();


            app.global_shortcut()
                .on_shortcut(
                    shortcut,
                    move |_app, _shortcut, event| {

                        // Only handle key press
                        if event.state
                            != ShortcutState::Pressed
                        {
                            return;
                        }


                        println!(
                            "CTRL + ALT + A pressed"
                        );


                        let state =
                            app_handle
                                .state::<VoiceState>();


                        // Use the same lock order as the Tauri commands:
                        // process first, then listening, to avoid deadlocks.
                        let mut process = match state.process.lock() {
                            Ok(value) => value,
                            Err(error) => {
                                eprintln!("Voice process lock error: {}", error);
                                return;
                            }
                        };

                        let mut listening = match state.listening.lock() {
                            Ok(value) => value,
                            Err(error) => {
                                eprintln!("Listening state error: {}", error);
                                return;
                            }
                        };

                        let command = if *listening { "STOP" } else { "START" };
                        println!("Shortcut command: {}", command);

                        let mut process_exited = false;
                        if let Some(child) = process.as_mut() {
                            match child.try_wait() {
                                Ok(Some(status)) => {
                                    eprintln!("Voice process has exited: {status}. Check Python logs.");
                                    process_exited = true;
                                }
                                Ok(None) => {
                                    if let Some(stdin) = child.stdin.as_mut() {
                                        if let Err(error) = writeln!(stdin, "{}", command) {
                                            eprintln!("Failed to send {}: {}", command, error);
                                            return;
                                        }

                                        if let Err(error) = stdin.flush() {
                                            eprintln!("Failed to flush stdin: {}", error);
                                            return;
                                        }

                                        *listening = !*listening;
                                        println!("Voice listening: {}", *listening);
                                        if let Err(error) = app_handle.emit(
                                            "shortcut-voice-toggle",
                                            *listening,
                                        ) {
                                            eprintln!("Failed to emit shortcut event: {}", error);
                                        }
                                    } else {
                                        eprintln!("Voice process stdin is unavailable");
                                    }
                                }
                                Err(error) => {
                                    eprintln!("Could not check voice process: {error}");
                                    return;
                                }
                            }
                        } else {
                            eprintln!("Voice process is not running");
                        }

                        if process_exited {
                            *process = None;
                            *listening = false;
                            let _ = app_handle.emit("shortcut-voice-toggle", false);
                        }
                    },
                )?;


            // ------------------------------------------------
            // STARTUP MESSAGE
            // ------------------------------------------------

            println!(
                "========================================"
            );

            println!(
                "Pocket AI Global Shortcut Ready"
            );

            println!(
                "CTRL + ALT + A = Toggle Voice"
            );

            println!(
                "========================================"
            );


            Ok(())
        })


        // ====================================================
        // TAURI COMMANDS
        // ====================================================

        .invoke_handler(
            tauri::generate_handler![
                start_listening,
                stop_listening
            ]
        )


        // ====================================================
        // RUN APPLICATION
        // ====================================================

        .run(
            tauri::generate_context!()
        )

        .expect(
            "error while running Pocket AI"
        );
}