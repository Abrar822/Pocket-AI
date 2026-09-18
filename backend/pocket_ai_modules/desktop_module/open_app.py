import subprocess
import json
import re

def get_start_apps():
    try:
        result = subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                "Get-StartApps | ConvertTo-Json -Compress",
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
        )
        if result.returncode != 0:
            print("Failed to get Windows applications.")
            print(result.stderr)
            return []
        output = result.stdout.strip()

        if not output:
            return []
        data = json.loads(output)
        # PowerShell returns an object instead of a list
        # when there is only one result.
        if isinstance(data, dict):
            data = [data]
        return data
    except Exception as e:
        print("Error while getting Start Apps:", e)
        return []

def normalize_name(name):
    name = name.lower().strip()
    # Remove common characters
    name = re.sub(r"[^a-z0-9 ]", " ", name)
    # Remove extra spaces
    name = re.sub(r"\s+", " ", name)
    return name

def find_application(application_name):
    applications = get_start_apps()
    if not applications:
        return None
    target = normalize_name(application_name)

    for app in applications:
        name = app.get("Name", "")
        if normalize_name(name) == target:
            return app

    for app in applications:
        name = normalize_name(app.get("Name", ""))
        if target in name:
            return app

    for app in applications:
        name = normalize_name(app.get("Name", ""))
        if name and name in target:
            return app
    return None


def launch_application(application_name):
    app = find_application(application_name)

    if not app:
        return False

    name = app.get("Name", "")
    app_id = app.get("AppID", "")
    try:
        command = f"explorer.exe " f"shell:AppsFolder\\{app_id}"
        subprocess.Popen(command, shell=True)
        return True

    except Exception as e:
        print(e)
        return False
    
def list_applications():
    applications = get_start_apps()
    for app in applications:
        name = app.get("Name", "")
        app_id = app.get("AppID", "")
