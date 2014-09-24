from ckanext.mapsearch.common import logic

def get_package_json(context, data_dict):
    search = logic.action.get.package_search(context, data_dict)
    def make_package(search):
        packages = []
        for result in search['results']:
            package = result
            packages.append(package)
        return packages
    these_packages = make_package(search)
    return {'count': search['count'], 'packages': these_packages}