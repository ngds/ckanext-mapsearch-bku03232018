### ckanext-mapsearch
CKAN extension geographical queries in the form of a web map interface.

#### Dependencies
* CKAN v2.3

#### Installation
```
$ git clone https://github.com/ngds/ckanext-mapsearch.git
$ cd ckanext-mapsearch
$ pip install -r requirements.txt

# If you're installing for development:
$ python setup.py develop

# If you're installing for production:
$ python setup.py build
$ python setup.py install

# Enable extension by adding ckanext-mapsearch plugins to ckan.plugins
nano ../path/to/ckan/configuration.ini
ckan.plugins = ... ... mapsearch
```
