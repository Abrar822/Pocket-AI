
import argparse
import sys
from pathlib import Path
import uvicorn

ROOT_NAME = Path(__file__).resolve().parent.parent
if str(ROOT_NAME) not in sys.path:
    sys.path.insert(0, str(ROOT_NAME))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, required=True)
    args = parser.parse_args()
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=args.port,
        log_level="info",
    )

if __name__ == "__main__":
    main()
