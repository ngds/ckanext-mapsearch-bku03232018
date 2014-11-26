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

### Run Tests
#### Step 1
Before running tests, there are 2 configs files for test, need to be configured regarding the test environment of your machine:
- ckanext-mapsearch/test.ini: overrides ckan environment.ini variables or you can point it into a different environment.ini (e.g: use different database for test)
- ckanext-mapsearch/ckanext/mapsearch/tests/tests_config.cfg:
> ckan_host: by default, CKAN Host on your machine
> ckan_web_map_service_url: by default, webMapService (WmsServer service).
> ckan_mapsearch_path: by default, MapSearch URI
> ckan_api_path: by default, ckan API URI

#### Step 2
Command line to perform the tests:

```
$ cd ckanext-mapsearch/ckanext/mapsearch
$ nosetests --ckan --with-pylons=../../test.ini tests/
```
- --with-pylons it's an option to specify the path to environment.ini to use for the test (override ckan default ini).
- tests/ it's the path to all tests files where located
