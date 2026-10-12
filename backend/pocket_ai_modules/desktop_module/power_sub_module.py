import subprocess


class PowerSubModule:

    def shutdown(self):
        subprocess.run(["shutdown", "/s", "/t", "0"])

    def restart(self):
        subprocess.run(["shutdown", "/r", "/t", "0"])

    def lock(self):
        subprocess.run(["rundll32.exe", "user32.dll,LockWorkStation"])

    def sleep(self):
        subprocess.run(["rundll32.exe", "powrprof.dll,SetSuspendState", "0,1,0"])

    def hibernate(self):
        subprocess.run(["shutdown", "/h"])
