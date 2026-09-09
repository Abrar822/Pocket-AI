import subprocess
import json
import re

# ============================================================
# GET ALL WINDOWS START APPS
# ============================================================

def get_start_apps():

    try:

        result = subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                "Get-StartApps | ConvertTo-Json -Compress"
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore"
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


# ============================================================
# NORMALIZE APPLICATION NAME
# ============================================================

def normalize_name(name):

    name = name.lower().strip()

    # Remove common characters
    name = re.sub(r"[^a-z0-9 ]", " ", name)

    # Remove extra spaces
    name = re.sub(r"\s+", " ", name)

    return name


# ============================================================
# FIND APPLICATION
# ============================================================

def find_application(application_name):

    applications = get_start_apps()

    if not applications:

        return None

    target = normalize_name(application_name)

    # --------------------------------------------------------
    # 1. EXACT MATCH
    # --------------------------------------------------------

    for app in applications:

        name = app.get("Name", "")

        if normalize_name(name) == target:

            return app

    # --------------------------------------------------------
    # 2. TARGET IS CONTAINED IN APPLICATION NAME
    # --------------------------------------------------------

    for app in applications:

        name = normalize_name(
            app.get("Name", "")
        )

        if target in name:

            return app

    # --------------------------------------------------------
    # 3. APPLICATION NAME IS CONTAINED IN TARGET
    # --------------------------------------------------------

    for app in applications:

        name = normalize_name(
            app.get("Name", "")
        )

        if name and name in target:

            return app

    return None


# ============================================================
# LAUNCH WINDOWS APPLICATION
# ============================================================

def launch_application(application_name):

    print()
    print("=" * 50)
    print("APPLICATION LAUNCHER")
    print("=" * 50)

    print(
        f"Searching for: {application_name}"
    )

    app = find_application(application_name)

    if not app:

        print(
            f"Application not found: {application_name}"
        )

        return False

    name = app.get("Name", "")
    app_id = app.get("AppID", "")

    print()
    print("Application found:")
    print("Name :", name)
    print("AppID:", app_id)

    # --------------------------------------------------------
    # LAUNCH USING WINDOWS APPSFOLDER
    # --------------------------------------------------------

    try:

        command = (
            f'explorer.exe '
            f'shell:AppsFolder\\{app_id}'
        )

        print()
        print("Launching...")
        print("Command:", command)

        subprocess.Popen(
            command,
            shell=True
        )

        print("Application launched.")

        return True

    except Exception as e:

        print()
        print("Failed to launch application:")
        print(e)

        return False


# ============================================================
# LIST ALL APPLICATIONS
# ============================================================

def list_applications():

    applications = get_start_apps()

    print()
    print("=" * 60)
    print("WINDOWS START APPLICATIONS")
    print("=" * 60)

    for app in applications:

        name = app.get("Name", "")
        app_id = app.get("AppID", "")

        print(
            f"{name:<35} | {app_id}"
        )

    print()
    print("Total applications:", len(applications))