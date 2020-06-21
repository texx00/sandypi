from setuptools import setup
from setuptools.command.develop import develop
from setuptools.command.install import install
from UIserver.database import DBUpdate
import time
import platform
import os


# Loads the necessary js libraries with bower
def update_bower_dependencies():
    #os.system("cd UIServer/static/js")      # change dir to static/js
    os.system("echo 'Installing js dependencies")
    os.system("npm install -g yarn")       # install bower
    os.system("yarn --cwd ./UIserver/static/js")              # install dependencies using bower


class PostDevelopCommand(develop):
    def run(self):
        develop.run(self)
        print("Running post develop script")
        DBUpdate()
        update_bower_dependencies()

class PostInstallCommand(install):
    def run(self):
        install.run(self)
        print("Running post install script")
        DBUpdate()
        update_bower_dependencies()


setup(
    name='UIserver',
    packages=['UIserver'],
    include_package_data=True,
    install_requires=[
        'flask', 'sqlalchemy',
    ],
    cmdclass={
        'develop': PostDevelopCommand,
        'install': PostInstallCommand,
    },
)
