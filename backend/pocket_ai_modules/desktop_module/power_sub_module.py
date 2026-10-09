import subprocess


class PowerSubModule:

    def shutdown(self):
        # subprocess.run(["shutdown", "/s", "/t", "0"])
        print('shutdown')

    def restart(self):
        # subprocess.run(["shutdown", "/r", "/t", "0"])
        print('restart')

    def lock(self):
        # subprocess.run(["rundll32.exe", "user32.dll,LockWorkStation"])
        print('lock')

    def sleep(self):
        # subprocess.run(["rundll32.exe", "powrprof.dll,SetSuspendState", "0,1,0"])
        print('sleep')

    def hibernate(self):
        # subprocess.run(["shutdown", "/h"])
        print('hibernate')
