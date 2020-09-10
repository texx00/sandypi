from setuptools import setup
from setuptools.command.develop import develop
from setuptools.command.install import install
import time
import platform
import os


class PostDevelopCommand(develop):
    def run(self):
        develop.run(self)
        print("Running post develop script")

class PostInstallCommand(install):
    def run(self):
        install.run(self)
        print("Running post install script")

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
