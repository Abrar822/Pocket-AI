from pathlib import Path


def set_paths(drives):
    fileInfo = []
    user_folders = set(["Desktop", "Documents", "Downloads", "Pictures"])
    extensions = set([".exe", ".lnk", ".bat", ".cmd", ".msc"])

    for drive in drives:
        root = Path(f"{drive.strip().upper()}:/")
        for path in root.rglob("*"):
            if (
                path.is_file()
                and any(f in path.parts for f in user_folders)
                and path.suffix.lower() in extensions
            ):
                fileInfo.append({"filename": path.name, "location": str(path)})
                continue

            if (
                path.is_file()
                and any(
                    f in path.parts for f in ["Program Files", "Program Files (x86)"]
                )
                and path.suffix.lower() in extensions
            ):
                fileInfo.append({"filename": path.name, "location": str(path)})
                continue
