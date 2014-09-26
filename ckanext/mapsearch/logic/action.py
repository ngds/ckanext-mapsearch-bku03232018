from ckanext.mapsearch.common import logic
from ckanext.mapsearch.common import plugins as p
from ckanext.mapsearch.model import ogc

def get_package_json(context, data_dict):
    search = logic.action.get.package_search(context, data_dict)
    def make_package(search):
        packages = []
        for result in search['results']:
            package = {
                'id': result['id'],
                'title': result['title'],
                'name': result['name'],
                'notes': result['notes'],
                'resources': result['resources'],
                'bbox': [this_val['value'] for this_val in result['extras']
                         if 'type' and 'coordinates' in this_val['value']]
            }
            packages.append(package)
        return packages
    these_packages = make_package(search)
    return {'count': search['count'], 'packages': these_packages}

def get_wms_info(context, data_dict):

    def wms_resource(resource):
        format = resource.get('format').lower()
        if format in ['ogc:wms', 'wms']:
            return True
        else:
            return False

    def get_wms_data(resource):
        resource_url = resource.get('url')
        wms = ogc.HandleWMS(resource_url)
        return wms.get_layer_info(resource)

    try:
        id = data_dict.get('id')
        resource = logic.action.get.resource_show(context, {'id': id})
        data = get_wms_data(resource)
        return data
    except:
        return {'Error':'Server error'}