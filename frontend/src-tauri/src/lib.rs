// use std::io::{BufRead, BufReader, Write};
// use std::process::{Child, Command, Stdio};
// use std::sync::Mutex;

// use tauri::{Emitter, Manager, State};

// use tauri_plugin_global_shortcut::{
//     GlobalShortcutExt,
//     Shortcut,
//     ShortcutState,
//  };


// // ============================================================
// // VOICE STATE
// // ============================================================

// struct VoiceState {
//     process: Mutex<Option<Child>>,
//     listening: Mutex<bool>,
// }


// // ============================================================
// // START LISTENING
// // ============================================================

// #[tauri::command]
// fn start_listening(
//     state: State<'_, VoiceState>,
// ) -> Result<(), String> {

//     let mut process = state
//         .process
//         .lock()
//         .map_err(|e| e.to_string())?;

//     let mut listening = state
//         .listening
//         .lock()
//         .map_err(|e| e.to_string())?;

//     if *listening {
//         return Ok(());
//     }

//     if let Some(child) = process.as_mut() {
//         if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
//             *listening = false;
//             return Err(format!(
//                 "Voice process already exited ({status}). Check the Python traceback in the terminal."
//             ));
//         }

//         if let Some(stdin) = child.stdin.as_mut() {

//             stdin
//                 .write_all(b"START\n")
//                 .map_err(|e| e.to_string())?;

//             stdin
//                 .flush()
//                 .map_err(|e| e.to_string())?;

//             *listening = true;

//             println!("Voice listening: START");

//             return Ok(());
//         }
//     }

//     Err("Voice process is not running".to_string())
// }


// // ============================================================
// // STOP LISTENING
// // ============================================================

// #[tauri::command]
// fn stop_listening(
//     state: State<'_, VoiceState>,
// ) -> Result<(), String> {

//     let mut process = state
//         .process
//         .lock()
//         .map_err(|e| e.to_string())?;

//     let mut listening = state
//         .listening
//         .lock()
//         .map_err(|e| e.to_string())?;

//     if !*listening {
//         return Ok(());
//     }

//     if let Some(child) = process.as_mut() {
//         if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
//             *listening = false;
//             return Err(format!(
//                 "Voice process already exited ({status}). Check the Python traceback in the terminal."
//             ));
//         }

//         if let Some(stdin) = child.stdin.as_mut() {

//             stdin
//                 .write_all(b"STOP\n")
//                 .map_err(|e| e.to_string())?;

//             stdin
//                 .flush()
//                 .map_err(|e| e.to_string())?;

//             *listening = false;

//             println!("Voice listening: STOP");

//             return Ok(());
//         }
//     }

//     Err("Voice process is not running".to_string())
// }


// // ============================================================
// // START PYTHON VOICE PROCESS
// // ============================================================

// fn start_voice_process(
//     app: &tauri::AppHandle,
// ) -> Result<Child, String> {

//     // Resolve paths from the Rust source location, not the shell's current directory.
//     // CARGO_MANIFEST_DIR points to frontend/src-tauri during development.
//     let manifest_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
//     let frontend_dir = manifest_dir.parent()
//         .ok_or("Could not resolve frontend directory from CARGO_MANIFEST_DIR")?;
//     let repo_dir = frontend_dir.parent()
//         .unwrap_or(frontend_dir);

//     // Support both common layouts:
//     //   <repo>/ai/voice.py
//     //   <repo>/frontend/ai/voice.py
//     let candidates = [
//         repo_dir.join("ai").join("voice.py"),
//         frontend_dir.join("ai").join("voice.py"),
//         manifest_dir.join("ai").join("voice.py"),
//     ];
//     let voice_path = candidates.iter()
//         .find(|candidate| candidate.is_file())
//         .cloned()
//         .ok_or_else(|| format!(
//             "voice.py not found. Checked: {}",
//             candidates.iter()
//                 .map(|p| p.display().to_string())
//                 .collect::<Vec<_>>()
//                 .join("; ")
//         ))?;

//     let project_dir = voice_path.parent()
//         .and_then(|p| p.parent())
//         .ok_or("Could not resolve voice project directory")?;


//     // ========================================================
//     // PYTHON PATH
//     // ========================================================

//     // let venv_python = project_dir
//     //     .join(".venv")
//     //     .join("Scripts")
//     //     .join("python.exe");
//     let venv_python = project_dir
//     .join("backend")
//     .join(".venv")
//     .join("Scripts")
//     .join("python.exe");

//     let python_path = if venv_python.exists() {

//         venv_python

//     } else {

//         std::path::PathBuf::from("python")
//     };


//     println!("========================================");
//     println!("Pocket AI Voice Engine");
//     println!(
//         "Project: {}",
//         project_dir.display()
//     );
//     println!(
//         "Python: {}",
//         python_path.display()
//     );
//     println!(
//         "Voice: {}",
//         voice_path.display()
//     );
//     println!("========================================");


//     // ========================================================
//     // START PYTHON
//     // ========================================================
//     let backend_url = std::env::var("VITE_BACKEND_URL")
//     .unwrap_or_else(|_| "http://127.0.0.1:8000".to_string());

//     println!("Backend URL: {}", backend_url);

//     let mut child = Command::new(&python_path)
//     .arg("-u")
//     .arg(&voice_path)
//     .current_dir(project_dir)
//     .env("BACKEND_URL", &backend_url)
//     .stdin(Stdio::piped())
//     .stdout(Stdio::piped())
//     .stderr(Stdio::piped())
//     .spawn()
//     .map_err(|e| {
//         format!("Failed to start Python voice process: {}", e)
//     })?;

//     // let mut child = Command::new(&python_path)
//     //     .arg("-u")
//     //     .arg(&voice_path)
//     //     .current_dir(project_dir)
//     //     .stdin(Stdio::piped())
//     //     .stdout(Stdio::piped())
//     //     .stderr(Stdio::piped())
//     //     .spawn()
//     //     .map_err(|e| {

//     //         format!(
//     //             "Failed to start Python voice process: {}",
//     //             e
//     //         )
//     //     })?;


//     // ========================================================
//     // PYTHON STDOUT
//     // ========================================================

//     let stdout = child
//         .stdout
//         .take()
//         .ok_or(
//             "Failed to capture Python stdout"
//         )?;

//     let app_handle = app.clone();

//     std::thread::spawn(move || {

//         let reader = BufReader::new(stdout);

//         for line in reader.lines() {

//             match line {

//                 Ok(line) => {

//                     println!(
//                         "Python: {}",
//                         line
//                     );

//                     match serde_json::from_str::<
//                         serde_json::Value
//                     >(&line) {

//                         Ok(value) => {

//                             if let Err(error) =
//                                 app_handle.emit(
//                                     "voice-event",
//                                     value,
//                                 )
//                             {

//                                 eprintln!(
//                                     "Voice event error: {}",
//                                     error
//                                 );
//                             }
//                         }

//                         Err(error) => {

//                             eprintln!(
//                                 "Invalid Python JSON: {}",
//                                 error
//                             );

//                             eprintln!(
//                                 "Python output: {}",
//                                 line
//                             );
//                         }
//                     }
//                 }

//                 Err(error) => {

//                     eprintln!(
//                         "Python stdout error: {}",
//                         error
//                     );

//                     break;
//                 }
//             }
//         }

//         println!(
//             "Python stdout thread stopped"
//         );
//     });


//     // ========================================================
//     // PYTHON STDERR
//     // ========================================================

//     let stderr = child
//         .stderr
//         .take()
//         .ok_or(
//             "Failed to capture Python stderr"
//         )?;

//     std::thread::spawn(move || {

//         let reader = BufReader::new(stderr);

//         for line in reader.lines() {

//             match line {

//                 Ok(line) => {

//                     eprintln!(
//                         "Python ERROR: {}",
//                         line
//                     );
//                 }

//                 Err(error) => {

//                     eprintln!(
//                         "Python stderr error: {}",
//                         error
//                     );

//                     break;
//                 }
//             }
//         }

//         eprintln!(
//             "Python stderr thread stopped"
//         );
//     });


//     Ok(child)
// }


// // ============================================================
// // TAURI APPLICATION
// // ============================================================

// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn run() {

//     tauri::Builder::default()
//         .plugin(tauri_plugin_dialog::init())
//         .plugin(tauri_plugin_log::Builder::default()
//             .level(log::LevelFilter::Info)
//             .build())

//         // ====================================================
//         // GLOBAL SHORTCUT PLUGIN
//         // ====================================================

//         .plugin(
//             tauri_plugin_global_shortcut::Builder::new()
//                 .build()
//         )


//         // ====================================================
//         // SETUP
//         // ====================================================

//         .setup(|app| {

//             // ------------------------------------------------
//             // START PYTHON VOICE PROCESS
//             // ------------------------------------------------

//             let child =
//                 start_voice_process(
//                     app.handle()
//                 )
//                 .map_err(|error| {

//                     eprintln!(
//                         "Voice startup error: {}",
//                         error
//                     );

//                     error
//                 })?;


//             // ------------------------------------------------
//             // STORE VOICE PROCESS + STATE
//             // ------------------------------------------------

//             app.manage(
//                 VoiceState {
//                     process: Mutex::new(
//                         Some(child)
//                     ),
//                     listening: Mutex::new(false),
//                 }
//             );


//             // ------------------------------------------------
//             // REGISTER CTRL + ALT + A
//             // ------------------------------------------------

//             let shortcut: Shortcut =
//                 "CTRL+ALT+A"
//                     .parse()
//                     .map_err(|e| {

//                         format!(
//                             "Invalid shortcut: {}",
//                             e
//                         )
//                     })?;


//             let app_handle =
//                 app.handle().clone();


//             app.global_shortcut()
//                 .on_shortcut(
//                     shortcut,
//                     move |_app, _shortcut, event| {

//                         // Only handle key press
//                         if event.state
//                             != ShortcutState::Pressed
//                         {
//                             return;
//                         }


//                         println!(
//                             "CTRL + ALT + A pressed"
//                         );


//                         let state =
//                             app_handle
//                                 .state::<VoiceState>();


//                         // Use the same lock order as the Tauri commands:
//                         // process first, then listening, to avoid deadlocks.
//                         let mut process = match state.process.lock() {
//                             Ok(value) => value,
//                             Err(error) => {
//                                 eprintln!("Voice process lock error: {}", error);
//                                 return;
//                             }
//                         };

//                         let mut listening = match state.listening.lock() {
//                             Ok(value) => value,
//                             Err(error) => {
//                                 eprintln!("Listening state error: {}", error);
//                                 return;
//                             }
//                         };

//                         let command = if *listening { "STOP" } else { "START" };
//                         println!("Shortcut command: {}", command);

//                         let mut process_exited = false;
//                         if let Some(child) = process.as_mut() {
//                             match child.try_wait() {
//                                 Ok(Some(status)) => {
//                                     eprintln!("Voice process has exited: {status}. Check Python logs.");
//                                     process_exited = true;
//                                 }
//                                 Ok(None) => {
//                                     if let Some(stdin) = child.stdin.as_mut() {
//                                         if let Err(error) = writeln!(stdin, "{}", command) {
//                                             eprintln!("Failed to send {}: {}", command, error);
//                                             return;
//                                         }

//                                         if let Err(error) = stdin.flush() {
//                                             eprintln!("Failed to flush stdin: {}", error);
//                                             return;
//                                         }

//                                         *listening = !*listening;
//                                         println!("Voice listening: {}", *listening);
//                                         if let Err(error) = app_handle.emit(
//                                             "shortcut-voice-toggle",
//                                             *listening,
//                                         ) {
//                                             eprintln!("Failed to emit shortcut event: {}", error);
//                                         }
//                                     } else {
//                                         eprintln!("Voice process stdin is unavailable");
//                                     }
//                                 }
//                                 Err(error) => {
//                                     eprintln!("Could not check voice process: {error}");
//                                     return;
//                                 }
//                             }
//                         } else {
//                             eprintln!("Voice process is not running");
//                         }

//                         if process_exited {
//                             *process = None;
//                             *listening = false;
//                             let _ = app_handle.emit("shortcut-voice-toggle", false);
//                         }
//                     },
//                 )?;


//             // ------------------------------------------------
//             // STARTUP MESSAGE
//             // ------------------------------------------------

//             println!(
//                 "========================================"
//             );

//             println!(
//                 "Pocket AI Global Shortcut Ready"
//             );

//             println!(
//                 "CTRL + ALT + A = Toggle Voice"
//             );

//             println!(
//                 "========================================"
//             );


//             Ok(())
//         })


//         // ====================================================
//         // TAURI COMMANDS
//         // ====================================================

//         .invoke_handler(
//             tauri::generate_handler![
//                 start_listening,
//                 stop_listening
//             ]
//         )


//         // ====================================================
//         // RUN APPLICATION
//         // ====================================================

//         .run(
//             tauri::generate_context!()
//         )

//         .expect(
//             "error while running Pocket AI"
//         );
// }



use std::{
    io::{BufRead, BufReader, Read, Write},
    net::{TcpListener, TcpStream},
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    sync::Mutex,
    thread,
    time::{Duration, Instant},
};

use tauri::{Emitter, Manager, State};
use tauri_plugin_global_shortcut::{
    GlobalShortcutExt, Shortcut, ShortcutState,
};

// ============================================================
// MANAGED STATE
// ============================================================

struct VoiceState {
    process: Mutex<Option<Child>>,
    listening: Mutex<bool>,
}

struct BackendState {
    url: Mutex<String>,
    qwen: Mutex<Option<Child>>,
    backend: Mutex<Option<Child>>,
}

// ============================================================
// COMMANDS
// ============================================================

#[tauri::command]
fn get_backend_url(state: State<'_, BackendState>) -> Result<String, String> {
    state.url.lock().map(|url| url.clone()).map_err(|e| e.to_string())
}

#[tauri::command]
fn start_listening(state: State<'_, VoiceState>) -> Result<(), String> {
    let mut process = state.process.lock().map_err(|e| e.to_string())?;
    let mut listening = state.listening.lock().map_err(|e| e.to_string())?;

    if *listening {
        return Ok(());
    }

    if let Some(child) = process.as_mut() {
        if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
            *listening = false;
            *process = None;
            return Err(format!("Voice process exited: {status}"));
        }

        if let Some(stdin) = child.stdin.as_mut() {
            stdin.write_all(b"START\n").map_err(|e| e.to_string())?;
            stdin.flush().map_err(|e| e.to_string())?;
            *listening = true;
            return Ok(());
        }
    }

    Err("Voice process is not running".to_string())
}

#[tauri::command]
fn stop_listening(state: State<'_, VoiceState>) -> Result<(), String> {
    let mut process = state.process.lock().map_err(|e| e.to_string())?;
    let mut listening = state.listening.lock().map_err(|e| e.to_string())?;

    if !*listening {
        return Ok(());
    }

    if let Some(child) = process.as_mut() {
        if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
            *listening = false;
            *process = None;
            return Err(format!("Voice process exited: {status}"));
        }

        if let Some(stdin) = child.stdin.as_mut() {
            stdin.write_all(b"STOP\n").map_err(|e| e.to_string())?;
            stdin.flush().map_err(|e| e.to_string())?;
            *listening = false;
            return Ok(());
        }
    }

    Err("Voice process is not running".to_string())
}

// ============================================================
// PORT AND HEALTH CHECK HELPERS
// ============================================================

fn free_port() -> Result<u16, String> {
    let listener = TcpListener::bind(("127.0.0.1", 0))
        .map_err(|e| format!("Could not allocate a port: {e}"))?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    drop(listener);
    Ok(port)
}

fn http_is_healthy(url: &str) -> bool {
    let Some(rest) = url.strip_prefix("http://") else {
        return false;
    };

    let (authority, path) = rest.split_once('/').unwrap_or((rest, ""));
    let path = format!("/{path}");

    let Ok(mut stream) = TcpStream::connect_timeout(
        &match authority.parse() {
            Ok(address) => address,
            Err(_) => return false,
        },
        Duration::from_secs(1),
    ) else {
        return false;
    };

    let _ = stream.set_read_timeout(Some(Duration::from_secs(2)));
    let request = format!(
        "GET {path} HTTP/1.1\r\nHost: {authority}\r\nConnection: close\r\n\r\n"
    );

    if stream.write_all(request.as_bytes()).is_err() {
        return false;
    }

    let mut buffer = [0_u8; 1024];
    match stream.read(&mut buffer) {
        Ok(count) if count > 0 => {
            String::from_utf8_lossy(&buffer[..count])
                .starts_with("HTTP/1.1 200")
                || String::from_utf8_lossy(&buffer[..count])
                    .starts_with("HTTP/1.0 200")
        }
        _ => false,
    }
}

fn wait_until_healthy(
    url: &str,
    child: &mut Child,
    name: &str,
    timeout: Duration,
) -> Result<(), String> {
    let deadline = Instant::now() + timeout;

    loop {
        if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
            return Err(format!("{name} exited before becoming ready: {status}"));
        }

        if http_is_healthy(url) {
            println!("{name} is ready at {url}");
            return Ok(());
        }

        if Instant::now() >= deadline {
            return Err(format!("{name} did not become healthy: {url}"));
        }

        thread::sleep(Duration::from_millis(400));
    }
}

fn stop_child(child: &mut Option<Child>) {
    if let Some(process) = child.as_mut() {
        if process.try_wait().ok().flatten().is_none() {
            let _ = process.kill();
            let _ = process.wait();
        }
    }
    *child = None;
}

// ============================================================
// PRODUCTION QWEN + FASTAPI STARTUP
// ============================================================

fn start_backend_services(
    app: &tauri::AppHandle,
) -> Result<(Child, Child, String), String> {
    let resources = app.path().resource_dir()
        .map_err(|e| format!("Cannot find application resources: {e}"))?;

    let llama = resources
        .join("backend")
        .join("core")
        .join("llama_cpp")
        .join("llama-server.exe");

    let model = resources
        .join("backend")
        .join("core")
        .join("model")
        .join("qwen2.5-1.5b-instruct-q4_k_m.gguf");

    let backend_exe = resources
        .join("PocketBackend")
        .join("PocketBackend.exe");

    for path in [&llama, &model, &backend_exe] {
        if !path.is_file() {
            return Err(format!("Required packaged file not found: {}", path.display()));
        }
    }

    // Start Qwen.
    let llm_port = free_port()?;
    let llm_url = format!("http://127.0.0.1:{llm_port}");

    println!("Starting Qwen: {}", llama.display());

    let mut qwen = Command::new(&llama)
        .arg("-m")
        .arg(&model)
        .args(["-c", "4096", "--host", "127.0.0.1", "--port"])
        .arg(llm_port.to_string())
        .current_dir(llama.parent().unwrap_or(Path::new(".")))
        .stdin(Stdio::null())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Failed to start Qwen: {e}"))?;

    if let Err(error) = wait_until_healthy(
        &format!("{llm_url}/health"),
        &mut qwen,
        "Qwen",
        Duration::from_secs(300),
    ) {
        let _ = qwen.kill();
        let _ = qwen.wait();
        return Err(error);
    }

    // Start packaged FastAPI backend.
    let backend_port = match free_port() {
        Ok(port) => port,
        Err(error) => {
            let _ = qwen.kill();
            let _ = qwen.wait();
            return Err(error);
        }
    };

    let backend_url = format!("http://127.0.0.1:{backend_port}");
    println!("Starting FastAPI: {}", backend_exe.display());

    let mut env = std::env::vars().collect::<Vec<_>>();
    env.retain(|(key, _)| key != "LLM_BASE_URL");

    let mut backend_command = Command::new(&backend_exe);
    backend_command
        .arg("--port")
        .arg(backend_port.to_string())
        .env("LLM_BASE_URL", &llm_url)
        .current_dir(backend_exe.parent().unwrap_or(Path::new(".")))
        .stdin(Stdio::null())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());

    let mut backend = match backend_command.spawn() {
        Ok(child) => child,
        Err(error) => {
            let _ = qwen.kill();
            let _ = qwen.wait();
            return Err(format!("Failed to start FastAPI: {error}"));
        }
    };

    if let Err(error) = wait_until_healthy(
        &format!("{backend_url}/health"),
        &mut backend,
        "FastAPI",
        Duration::from_secs(180),
    ) {
        let _ = backend.kill();
        let _ = backend.wait();
        let _ = qwen.kill();
        let _ = qwen.wait();
        return Err(error);
    }

    Ok((qwen, backend, backend_url))
}

// ============================================================
// VOICE PROCESS
// ============================================================

fn start_voice_process(
    app: &tauri::AppHandle,
    backend_url: &str,
) -> Result<Child, String> {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let frontend_dir = manifest_dir.parent()
        .ok_or("Cannot resolve frontend directory")?;
    let repo_dir = frontend_dir.parent()
        .unwrap_or(frontend_dir);

    let voice_path = if cfg!(debug_assertions) {
        [
            repo_dir.join("ai/voice.py"),
            frontend_dir.join("ai/voice.py"),
            manifest_dir.join("ai/voice.py"),
        ]
        .into_iter()
        .find(|p| p.is_file())
    } else {
        app.path().resource_dir().ok()
            .map(|r| r.join("ai").join("voice.py"))
            .filter(|p| p.is_file())
    }
    .ok_or("voice.py was not found in the expected project/resources directory")?;

    let python = if cfg!(debug_assertions) {
        let project_dir = voice_path.parent()
            .and_then(|p| p.parent())
            .ok_or("Cannot resolve voice project directory")?;

        let venv = project_dir
            .join("backend")
            .join(".venv")
            .join("Scripts")
            .join("python.exe");

        if venv.is_file() {
            venv
        } else {
            PathBuf::from("python")
        }
    } else {
        let resource_dir = app.path().resource_dir()
            .map_err(|e| e.to_string())?;
        let bundled_python = resource_dir.join("python").join("python.exe");

        if !bundled_python.is_file() {
            return Err(format!(
                "Bundled Python runtime not found: {}. Bundle Python and the voice dependencies.",
                bundled_python.display()
            ));
        }
        bundled_python
    };

    let working_dir = voice_path.parent()
        .ok_or("Cannot resolve voice working directory")?;

    println!("Starting voice process: {}", voice_path.display());

    let mut child = Command::new(&python)
        .arg("-u")
        .arg(&voice_path)
        .current_dir(working_dir)
        .env("BACKEND_URL", backend_url)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start voice process: {e}"))?;

    if let Some(stdout) = child.stdout.take() {
        let handle = app.clone();
        thread::spawn(move || {
            for line in BufReader::new(stdout).lines().flatten() {
                println!("Voice: {line}");
                match serde_json::from_str::<serde_json::Value>(&line) {
                    Ok(value) => {
                        if let Err(e) = handle.emit("voice-event", value) {
                            eprintln!("Voice event error: {e}");
                        }
                    }
                    Err(e) => eprintln!("Non-JSON voice output: {line} ({e})"),
                }
            }
        });
    }

    if let Some(stderr) = child.stderr.take() {
        thread::spawn(move || {
            for line in BufReader::new(stderr).lines().flatten() {
                eprintln!("Voice ERROR: {line}");
            }
        });
    }

    Ok(child)
}

// ============================================================
// TAURI APP
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let (qwen, backend, backend_url) = if cfg!(debug_assertions) {
                let url = std::env::var("VITE_BACKEND_URL")
                    .unwrap_or_else(|_| "http://127.0.0.1:8000".to_string());
                (None, None, url)
            } else {
                let (qwen, backend, url) = start_backend_services(app.handle())
                    .map_err(std::io::Error::other)?;
                (Some(qwen), Some(backend), url)
            };

            app.manage(BackendState {
                url: Mutex::new(backend_url.clone()),
                qwen: Mutex::new(qwen),
                backend: Mutex::new(backend),
            });

            let voice = start_voice_process(app.handle(), &backend_url)
                .map_err(std::io::Error::other)?;

            app.manage(VoiceState {
                process: Mutex::new(Some(voice)),
                listening: Mutex::new(false),
            });

            let shortcut: Shortcut = "CTRL+ALT+A"
                .parse()
                .map_err(|e| std::io::Error::other(format!("Invalid shortcut: {e}")))?;

            let handle = app.handle().clone();

            app.global_shortcut().on_shortcut(
                shortcut,
                move |_app, _shortcut, event| {
                    if event.state != ShortcutState::Pressed {
                        return;
                    }

                    let state = handle.state::<VoiceState>();
                    let mut process = match state.process.lock() {
                        Ok(value) => value,
                        Err(e) => {
                            eprintln!("Voice lock error: {e}");
                            return;
                        }
                    };
                    let mut listening = match state.listening.lock() {
                        Ok(value) => value,
                        Err(e) => {
                            eprintln!("Listening lock error: {e}");
                            return;
                        }
                    };

                    let command = if *listening { "STOP\n" } else { "START\n" };

                    if let Some(child) = process.as_mut() {
                        match child.try_wait() {
                            Ok(None) => {
                                if let Some(stdin) = child.stdin.as_mut() {
                                    if stdin.write_all(command.as_bytes()).is_ok()
                                        && stdin.flush().is_ok()
                                    {
                                        *listening = !*listening;
                                        let _ = handle.emit(
                                            "shortcut-voice-toggle",
                                            *listening,
                                        );
                                    }
                                }
                            }
                            Ok(Some(status)) => {
                                eprintln!("Voice process exited: {status}");
                                *process = None;
                                *listening = false;
                                let _ = handle.emit("shortcut-voice-toggle", false);
                            }
                            Err(e) => eprintln!("Voice process check failed: {e}"),
                        }
                    }
                },
            )?;

            println!("Pocket AI startup complete.");
            println!("Ctrl + Alt + A toggles voice.");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_listening,
            stop_listening,
            get_backend_url
        ])
        .build(tauri::generate_context!())
        .expect("error while building Pocket AI")
        .run(|app_handle, event| {
            if let tauri::RunEvent::Exit = event {
                if let Some(state) = app_handle.try_state::<VoiceState>() {
                    if let Ok(mut process) = state.process.lock() {
                        stop_child(&mut process);
                    }
                }

                if let Some(state) = app_handle.try_state::<BackendState>() {
                    if let Ok(mut backend) = state.backend.lock() {
                        stop_child(&mut backend);
                    }
                    if let Ok(mut qwen) = state.qwen.lock() {
                        stop_child(&mut qwen);
                    }
                }
            }
        });
}
