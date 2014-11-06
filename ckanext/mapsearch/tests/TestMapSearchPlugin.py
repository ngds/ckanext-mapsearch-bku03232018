import ckanext.mapsearch.plugin as pluginMapSearch
import ConfigParser
import os


class TestMapSearchPlugin(object):

    #setup_class executes (auto once) before anything in this class
    @classmethod
    def setup_class(self):
        print ("")
        # get config options
        config = ConfigParser.RawConfigParser({
            'ckan_host': '0.0.0.0',
        })
        config.read(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                 'tests_config.cfg'))

        self.host = config.get('tests', 'ckan_host')
	self.path = config.get('tests', 'ckan_mapsearch_path')

        if not self.host:
            raise Exception('You must add a Host to the tests '
                            ' configuration file')

	if not self.path:
            raise Exception('You must add a MapSearch path to the tests '
                            ' configuration file')

        self.oMapSearch = pluginMapSearch.MapSearch()

    #teardown_class executes (auto once) after anything in this class
    @classmethod
    def teardown_class(self):
        print ("")
        self.oMapSearch = None
        self.host = None
	self.path = None
        del self.oMapSearch
        del self.host
	del self.path

    #setup executes before each method in this class
    def setup(self):
        print ("")
        print ("TestUM:setup() before each test method")

    #setup executes after each method in this class
    def teardown(self):
        print ("")
        print ("TestUM:teardown() after each test method")

    #Check if the method get_actions of MapSearch Class return the {'get_package_json', 'get_wms_info'}
    def test_getActions(self):
        print 'test_getActions(): Running actual test code ..........................'

        result = self.oMapSearch.get_actions()

        #pprint.pprint(result)

        assert 'get_package_json' in result
        assert 'get_wms_info' in result

    #Check if map_search plugin is up and the response status code is 200
    def test_MapSearchUrl(self):
        print 'test_MapSearchUrl(): Running actual test code ..........................'

        import requests
        try:
            oResponse = requests.head("http://%s/%s" % (self.host, self.path))
            assert oResponse.status_code == 200
        except requests.ConnectionError:
            print "failed to connect"
            assert False
