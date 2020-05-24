from setuptools import setup

setup(
    name='UIserver',
    packages=['UIserver'],
    include_package_data=True,
    install_requires=[
        'flask', 'sqlalchemy',
    ],
)