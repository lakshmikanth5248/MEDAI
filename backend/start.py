# Launches every backend microservice as a subprocess of this single Render
# web service. Only the gateway binds to $PORT and is internet-facing; the
# rest stay on their fixed internal ports (see backend/.env.example) and are
# only reachable from the gateway via 127.0.0.1.
#
# Local dev: use start-all.ps1 instead, which also loads backend/.env.
import os
import signal
import subprocess
import sys
import time


class Shutdown(Exception):
    pass


def _handle_sigterm(signum, frame):
    raise Shutdown


ROOT = os.path.dirname(os.path.abspath(__file__))

INTERNAL_SERVICES = [
    "auth-service",
    "clinical-service",
    "prescription-service",
    "pharmacy-service",
    "billing-service",
    "notification-service",
    "core-service",
]


def start(service_dir):
    return subprocess.Popen([sys.executable, "app.py"], cwd=os.path.join(ROOT, service_dir))


def main():
    signal.signal(signal.SIGTERM, _handle_sigterm)

    names = list(INTERNAL_SERVICES)
    processes = [start(name) for name in names]

    time.sleep(2)  # let upstream services bind before the gateway starts routing to them
    names.append("gateway")
    processes.append(start("gateway"))

    try:
        while True:
            for name, proc in zip(names, processes):
                code = proc.poll()
                if code is not None:
                    print(f"[start.py] {name} exited with code {code}, shutting down", flush=True)
                    raise SystemExit(code or 1)
            time.sleep(5)
    except (Shutdown, KeyboardInterrupt):
        print("[start.py] received shutdown signal, stopping all services", flush=True)
    finally:
        for proc in processes:
            proc.terminate()
        for proc in processes:
            proc.wait()


if __name__ == "__main__":
    main()
