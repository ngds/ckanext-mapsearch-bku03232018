from setuptools import setup, find_packages

version = '0.0.1'

setup(
	name='ckanext-mapsearch',
	version=version,
	description="Search for packages and records through a map interface",
	long_description='''\
	''',
	classifiers=[],
	keywords='',
	author='Arizona Geological Survey',
	author_email='adrian.sonnenschein@azgs.az.gov',
	url='https://github.com/ngds/ckanext-mapsearch',
	license='MIT',
	packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
	namespace_packages=['ckanext'],
    include_package_data=True,
	zip_safe=False,
	install_requires=[],
    entry_points=
	"""
	[ckan.plugins]

    # Map Search plugin
    mapsearch=ckanext.mapsearch.plugin:MapSearch
	""",
)
