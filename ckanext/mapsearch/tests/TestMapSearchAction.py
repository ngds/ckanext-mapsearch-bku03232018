import ckanext.mapsearch.logic as mapSearchAction
import ConfigParser
import os
import requests
import json
import uuid

class TestMapSearchAction(object):

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
        self.mapsearch_path = config.get('tests', 'ckan_mapsearch_path')
        self.ckan_api_path = config.get('tests', 'ckan_api_path')
        self.actions = mapSearchAction

        if not self.host:
            raise Exception('You must add a Host to the tests '
                            ' configuration file')

        if not self.mapsearch_path:
            raise Exception('You must add a MapSearch path to the tests '
                            ' configuration file')

        if not self.ckan_api_path:
            raise Exception('You must add a CKAN API path to the tests '
                            ' configuration file')

    #teardown_class executes (auto once) after anything in this class
    @classmethod
    def teardown_class(self):
        print ("")
        self.actions = None
        self.host = None
        self.mapsearch_path = None
        self.ckan_api_path = None
        del self.actions
        del self.host
        del self.mapsearch_path
        del self.ckan_api_path

    #setup executes before each method in this class
    def setup(self):
        print ("")
        print ("TestUM:setup() before each test method")

    #setup executes after each method in this class
    def teardown(self):
        print ("")
        print ("TestUM:teardown() after each test method")

    #Check map_search action get_package_json response (data) and the response status code is 200
    def test_GetPackageJsonAction(self):
        print 'test_GetPackageJsonAction(): Running actual test code ..........................'

        params = {"extras":{"ext_bbox":"-180,-90,180,90"},"q":"false_texte+res_url:*+","rows":1,"sort":"","start":0}
        headers = {'content-type': 'application/x-www-form-urlencoded','encoding':'utf-8', 'X-Requested-With':'XMLHttpRequest'}
        try:
	    oResponse = requests.post("http://%s/%s/%s" % (self.host, self.ckan_api_path, 'get_package_json'),  data=json.dumps(params), headers=headers)
	    jsonResponseData = oResponse.json()

            assert oResponse.status_code == 200
	    assert jsonResponseData['success']
        except requests.ConnectionError:
            print "failed to connect"
            assert False
	except:
	    print "Data returned is not type of json or attribute 'success' is missing"
	    assert False

    #Check map_search action get_wms_info response status code is 200 (This function returns nothing)
    def test_GetWmsInfoAction(self):
        print 'test_GetWmsInfoAction(): Running actual test code ..........................'

        params = {"id":str(uuid.uuid4())}
        headers = {'content-type': 'application/x-www-form-urlencoded','encoding':'utf-8', 'X-Requested-With':'XMLHttpRequest'}
        try:
            oResponse = requests.post("http://%s/%s/%s" % (self.host, self.ckan_api_path, 'get_wms_info'),  data=json.dumps(params), headers=headers)
            jsonResponseData = oResponse.json()

            assert oResponse.status_code == 200
            assert jsonResponseData['success']
        except requests.ConnectionError:
            print "failed to connect"
            assert False
