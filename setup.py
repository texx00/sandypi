from setuptools import setup
from setuptools.command.develop import develop
from setuptools.command.install import install
import time
import platform
import os
from UIserver.utils import settings_utils

class PostDevelopCommand(develop):
    def run(self):
        develop.run(self)
        print("Running post develop script")
        settings_utils.update_settings_file_version()

class PostInstallCommand(install):
    def run(self):
        install.run(self)
        print("Running post install script")
        settings_utils.update_settings_file_version()

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
