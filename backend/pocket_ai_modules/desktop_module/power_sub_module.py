import subprocess


class PowerSubModule:

    def shutdown(self, task):
        print('shutdown')
        return "shutdown"

    def restart(self, task):
        print('restart')
        return "restart"

    def lock(self, task):
        print('lock')
        return "lock"

    def sleep(self, task):
        print('sleep')
        return "sleep"

    def hibernate(self, task):
        print('hibernate')
        return "hibernate"
