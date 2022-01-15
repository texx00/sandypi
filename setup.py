from setuptools import setup
from setuptools.command.develop import develop
from setuptools.command.install import install

class PostDevelopCommand(develop):
    def run(self):
        develop.run(self)
        print("Running post develop script")
        # add here post develop install scripts
        print("Post develop script done")

class PostInstallCommand(install):
    def run(self):
        install.run(self)
        print("Running post install script")
        # add here post install scripts
        print("Post install script done")

setup(
    name='server',
    packages=['server'],
    include_package_data=True,
    install_requires=[
        'flask', 'sqlalchemy',
    ],
    cmdclass={
        'develop': PostDevelopCommand,
        'install': PostInstallCommand,
    },
)
