# import os
# import socket
# import subprocess
# import time
# import urllib.request
# from pathlib import Path

# ROOT = Path(__file__).resolve().parent.parent
# BACKEND_DIR = ROOT / "backend"
# BACKEND_PYTHON = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
# FRONTEND_DIR = ROOT / "frontend"

# def get_port():
#     with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
#         sock.bind(("127.0.0.1", 0))
#         return sock.getsockname()[1]

# def wait(url, process, timeout=120):
#     deadline = time.monotonic() + timeout

#     while time.monotonic() < deadline:
#         if process.poll() is not None:
#             raise RuntimeError("Backend exited before becoming ready.")

#         try:
#             with urllib.request.urlopen(url, timeout=2) as response:
#                 if response.status == 200:
#                     return
#         except Exception:
#             pass

#         time.sleep(0.25)
#     raise TimeoutError("Backend did not become ready in time.")


# port = get_port()
# backend_url = f"http://127.0.0.1:{port}"
# backend = None

# try:
#     backend = subprocess.Popen(
#         [
#             str(BACKEND_PYTHON),
#             str(BACKEND_DIR / "launcher.py"),
#             "--port",
#             str(port),
#         ],
#         cwd=ROOT,
#     )

#     print(f"Waiting for backend at {backend_url}...")
#     wait(f"{backend_url}/health", backend)
#     print("Backend ready. Starting Tauri...")

#     env = os.environ.copy()
#     env["VITE_BACKEND_URL"] = backend_url

#     subprocess.run(
#         ["cmd", "/c", "npm", "run", "tauri", "dev"],
#         cwd=FRONTEND_DIR,
#         env=env,
#         check=True,
#     )

# finally:
#     if backend and backend.poll() is None:
#         backend.terminate()
#         try:
#             backend.wait(timeout=5)
#         except subprocess.TimeoutExpired:
#             backend.kill()




import os
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

BACKEND_PYTHON = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"

LLAMA_SERVER = (
    BACKEND_DIR / "core" / "llama_cpp" / "llama-server.exe"
)
MODEL = (
    BACKEND_DIR / "core" / "model"
    / "qwen2.5-1.5b-instruct-q4_k_m.gguf"
)

def get_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


processes = []


def wait_for_url(url, process, name, timeout=180):
    deadline = time.monotonic() + timeout

    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(
                f"{name} exited with code {process.returncode}"
            )

        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    print(f"{name} is ready.")
                    return
        except Exception:
            pass

        time.sleep(0.5)

    raise TimeoutError(f"{name} did not become ready: {url}")


def stop_process(process):
    if process.poll() is not None:
        return

    process.terminate()

    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()


def main():
    if not BACKEND_PYTHON.is_file():
        raise FileNotFoundError(
            f"Backend Python not found: {BACKEND_PYTHON}"
        )

    if not LLAMA_SERVER.is_file():
        raise FileNotFoundError(
            f"llama-server.exe not found: {LLAMA_SERVER}"
        )

    if not MODEL.is_file():
        raise FileNotFoundError(
            f"GGUF model not found: {MODEL}"
        )

    if not (FRONTEND_DIR / "package.json").is_file():
        raise FileNotFoundError(
            f"Frontend package.json not found: {FRONTEND_DIR}"
        )

    # 1. Start the local LLM.
    print("\n[1/3] Starting Qwen LLM...")
    llm_port = get_port()
    LLM_URL = f'http://127.0.0.1:{llm_port}'
    LLM_HEALTH_URL = f"{LLM_URL}/health"

    llm = subprocess.Popen(
        [
            str(LLAMA_SERVER),
            "-m", str(MODEL),
            "-c", "4096",
            "--host", "127.0.0.1",
            "--port", str(llm_port),
        ],
        cwd=ROOT,
    )
    processes.append(llm)

    wait_for_url(
        LLM_HEALTH_URL,
        llm,
        "Qwen LLM",
        timeout=300,
    )

    # 2. Start FastAPI using the backend virtual environment.
    print("\n[2/3] Starting FastAPI...")
    env = os.environ.copy()
    env['LLM_BASE_URL'] = LLM_URL

    port = get_port()
    backend_url = f"http://127.0.0.1:{port}"

    backend = subprocess.Popen(
        [
            str(BACKEND_PYTHON),
            str(BACKEND_DIR / "launcher.py"),
            "--port",
            str(port),
        ],
        cwd=ROOT,
        env=env
    )
    processes.append(backend)

    wait_for_url(
        f"{backend_url}/health",
        backend,
        "FastAPI",
        timeout=180,
    )

    # 3. Start React + Tauri only after both services are ready.
    print("\n[3/3] Starting Pocket AI frontend...")

    env = os.environ.copy()
    env["VITE_BACKEND_URL"] = backend_url

    npm_command = (
        ["npm.cmd", "run", "tauri", "dev"]
        if os.name == "nt"
        else ["npm", "run", "tauri", "dev"]
    )

    subprocess.run(
        npm_command,
        cwd=FRONTEND_DIR,
        env=env,
        check=True,
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nPocket AI shutdown requested.")
    finally:
        print("\nStopping Pocket AI services...")

        for process in reversed(processes):
            stop_process(process)

        print("Pocket AI services stopped.")

