# -- encoding: UTF-8 --
#!/usr/bin/env python

import os
from setuptools import setup, find_packages

setup(
    name="infotv",
    version="0.2.0",
    description="A television, with information",
    author="Aarni Koskela",
    author_email="akx@iki.fi",
    url="https://github.com/kcsry/infotv",
    packages=find_packages('.', exclude=('infotv_test*',)),
    package_data={"infotv": ["static/infotv/*"]},
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'Django>=1.8',
        'jsonfield>=1.0.3',
        'requests>=2.13.0',
    ],
)
