import ckanext.mapsearch.logic.action as mapSearchAction
import ConfigParser
import os
import requests
import json
import uuid
import string
import random
import ckan.tests as tests
import ckan.model as model
import paste.fixture
import pylons.test

class TestMapSearchAction(object):

    #setup_class executes (auto once) before anything in this class
    @classmethod
    def setup_class(self):
        print ("")

        self.actions = mapSearchAction

        # get config options
        config = ConfigParser.RawConfigParser({
            'ckan_host': '0.0.0.0',
        })
        config.read(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                 'tests_config.cfg'))

        self.host = config.get('tests', 'ckan_host')
        self.mapsearch_path = config.get('tests', 'ckan_mapsearch_path')
        self.ckan_api_path = config.get('tests', 'ckan_api_path')
        self.serviceUrl = config.get('tests', 'ckan_web_map_service_url')

        if not self.host:
            raise Exception('You must add a Host to the tests '
                            ' configuration file')

        if not self.mapsearch_path:
            raise Exception('You must add a MapSearch path to the tests '
                            ' configuration file')

        if not self.ckan_api_path:
            raise Exception('You must add a CKAN API path to the tests '
                            ' configuration file')

        if not self.serviceUrl:
            raise Exception('You must provide WebMapServer URL to the tests '
                            ' configuration file')

        # Make the Paste TestApp that we'll use to simulate HTTP requests to CKAN.
        self.app = paste.fixture.TestApp(pylons.test.pylonsapp)

        # Access CKAN's model directly (bad) to create a sysadmin user and save
        # it against self for all test methods to access.
        self.sysadmin_user = model.User(name='test_sysadmin', sysadmin=True)
        model.Session.add(self.sysadmin_user)
        model.Session.commit()
        model.Session.remove()

        #Create organization
        organization = {'name': 'test_org',
                    'title': 'Africa - Maroc',
                    'description': 'Maroc in north Africa.'}

        resultOrg = tests.call_action_api(self.app, 'organization_create', apikey=self.sysadmin_user.apikey, **organization)

        self.orgID = resultOrg['id']

        #Create Dataset and tied it to created org
        dataset = {'name': 'test_org_dataset_mapsearch',
                   'title': 'Africa - Maroc: Beautiful country for tourist',
                   'owner_org': organization['name']}

        resultDataset = tests.call_action_api(self.app, 'package_create',
                              apikey=self.sysadmin_user.apikey,
                              **dataset)

        self.datasetID = resultDataset['id']

        #Create Resource and tied it to created dataset
        resource = {'package_id': resultDataset['id'], 'url': self.serviceUrl}
        resultResource = tests.call_action_api(self.app, 'resource_create',
                              apikey=self.sysadmin_user.apikey,
                              **resource)

        #save resource id
        self.resourceID = resultResource['id']

    #teardown_class executes (auto once) after anything in this class
    @classmethod
    def teardown_class(self):
        print ("")

        #Delete Resource created for test
        tests.call_action_api(self.app, 'resource_delete',
                              apikey=self.sysadmin_user.apikey,
                              **{'id':self.resourceID})

        #Delete Dataset created for test
        tests.call_action_api(self.app, 'package_delete',
                              apikey=self.sysadmin_user.apikey,
                              **{'id':self.datasetID})

        #delete organization created
        tests.call_action_api(self.app, 'organization_delete',
                              apikey=self.sysadmin_user.apikey,
                              **{'id':self.orgID})

        self.actions = None
        self.host = None
        self.mapsearch_path = None
        self.ckan_api_path = None
        self.app = None
        self.sysadmin_user = None
        self.datasetID = None
        self.orgID = None
        self.resourceID = None
        del self.actions
        del self.host
        del self.mapsearch_path
        del self.ckan_api_path
        del self.app
        del self.sysadmin_user
        del self.datasetID
        del self.orgID
        del self.resourceID

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

        def textGenerator(size=6, chars=string.ascii_uppercase + string.digits):
            return ''.join(random.choice(chars) for _ in range(size))

        params = {"extras":{"ext_bbox":"-180,-90,180,90"},"q":textGenerator()+"+res_url:*+","rows":1,"sort":"","start":0}
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

    #Test Bad request map_search action get_package_json response (data) and the response status code is 400
    def testBadRequest_GetPackageJsonAction(self):
        print 'testBadRequest_GetPackageJsonAction(): Running actual test code ..........................'

        def textGenerator(size=6, chars=string.ascii_uppercase + string.digits):
            return ''.join(random.choice(chars) for _ in range(size))

        params = {"extras":{"ext_bbox":"-180,-90,180,90"},"q":textGenerator()+"+res_url:*+","rows":1,"sort":"","start":0}
        try:
            oResponse = requests.post("http://%s/%s/%s" % (self.host, self.ckan_api_path, 'get_package_json'),  data=json.dumps(params))
	    
            assert oResponse.status_code == 400
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

    #Test Bad request map_search action get_wms_info response status code is 400
    def testBadRequest_GetWmsInfoAction(self):
        print 'testBadRequest_GetWmsInfoAction(): Running actual test code ..........................'

        params = {"id":str(uuid.uuid4())}

        try:
            oResponse = requests.post("http://%s/%s/%s" % (self.host, self.ckan_api_path, 'get_wms_info'),  data=json.dumps(params))

            assert oResponse.status_code == 400
        except requests.ConnectionError:
            print "failed to connect"
            assert False

    #test map search package json behavior (search only for created dataset)
    def test_mapSearchPackageJson(self):
        print 'test_mapSearchPackageJson(): Running actual test code ..........................'

        context = {'model': model,
                   'session': model.Session,
                   'user': self.sysadmin_user.name}

        keyword = "test_org_dataset_mapsearch"
        data_dict = {"q":"name:"+keyword}

        result = self.actions.get_package_json(context, data_dict)

        assert result['count'] == 1
        assert result['packages'][0]['name'] == keyword

    #Test bad map search package json behavior (search only for created dataset)
    def testBad_mapSearchPackageJson(self):
        print 'testBad_mapSearchPackageJson(): Running actual test code ..........................'

        context = {'model': model,
                   'session': model.Session,
                   'user': self.sysadmin_user.name}

        keywordBad = "test_org_dataset_mapsearch_bad"
        data_dict = {"q":"name:"+keywordBad}

        result = self.actions.get_package_json(context, data_dict)

        assert result['count'] == 0

    #test map search wms info behavior
    def test_mapSearchWmsInfo(self):
        print 'test_mapSearchWmsInfo(): Running actual test code ..........................'

        def is_array(var):
            return isinstance(var, (list, tuple))

        context = {'model': model,
                   'session': model.Session,
                   'user': self.sysadmin_user.name}

        data_dict = {"id": self.resourceID}

        try:
            result = self.actions.get_wms_info(context, data_dict)

            assert 'srs' in result
            assert 'layer' in result
            assert 'bbox' in result
            assert 'tile_format' in result
            assert 'service_url' in result

            assert is_array(result['bbox'])
            assert isinstance(result['srs'], (unicode, str, basestring))
            assert isinstance(result['tile_format'], (unicode, str, basestring))
            assert isinstance(result['service_url'], (unicode, str, basestring))

            #testing returned values with default values
            assert result['layer'] == 'ThermalSpring' #default value
            assert result['service_url'] == self.serviceUrl
            assert result['srs'] == 'EPSG:4326'
            assert result['tile_format'] == 'image/png'
        except:
            print "Data returned is not correct or one or more of important fields are missing"
            assert False

    #test bad map search wms info behavior
    def testBad_mapSearchWmsInfo(self):
        print 'testBad_mapSearchWmsInfo(): Running actual test code ..........................'

        def is_array(var):
            return isinstance(var, (list, tuple))

        context = {'model': model,
                   'session': model.Session,
                   'user': self.sysadmin_user.name}

        data_dict = {"id": str(uuid.uuid4())}

        try:
            result = self.actions.get_wms_info(context, data_dict)

	    assert result == ''
        except:
            print "Resource ID provided doesn't exist."
            pass 
