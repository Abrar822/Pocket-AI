from fastapi import HTTPException, status, APIRouter
from ...pydantic_models.desktop_models import PowerType
import subprocess

power_endpoints = APIRouter()


@power_endpoints.post(
    "/power",
    status_code=status.HTTP_200_OK,
)
def power(power_type: PowerType):
    operation = power_type.power_type

    commands = {
        "shutdown": ["shutdown", "/s", "/t", "5"],
        "restart": ["shutdown", "/r", "/t", "5"],
        "lock": [
            "rundll32.exe",
            "user32.dll,LockWorkStation",
        ],
        "sleep": [
            "powershell.exe",
            "-NoProfile",
            "-Command",
            "Add-Type -AssemblyName System.Windows.Forms; "
            "[System.Windows.Forms.Application]::SetSuspendState("
            "'Suspend', $false, $false)",
        ],
        "hibernate": ["shutdown", "/h"],
    }

    try:
        subprocess.run(
            commands[operation],
            check=True,
            timeout=10,
        )

        return {
            "message": f"{operation.capitalize()} command executed successfully."
        }

    except subprocess.CalledProcessError as err:
        print(f"Windows command failed: {err}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Windows failed to execute {operation}.",
        ) from err

    except subprocess.TimeoutExpired as err:
        print(f"Windows command timed out: {err}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"The {operation} command timed out.",
        ) from err

    except Exception as err:
        print(f"Power operation error: {err}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform {operation}.",
        ) from err