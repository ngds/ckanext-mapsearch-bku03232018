var root = this;
root.geo == null ? geo = root.geo = {} : geo = root.geo;
var sumCount = 0;

geo.initialExtent = L.latLngBounds(
  [50.919376, -130.227639],
  [21.637598, -65.891701]
);

geo.mapOptions = {
  attributionControl: true,
  minZoom: 2
};

geo.map = L.map('map', geo.mapOptions).fitBounds(geo.initialExtent);

geo.width = window.innerWidth;
if (geo.width < 768) { geo.mapOptions['zoomControl'] = false; };

if (geo.width > 768) {
  geo.centerPoint = geo.map.getPixelOrigin().x;
  geo.offset = geo.centerPoint * 0.4;
  geo.pan = geo.centerPoint - geo.offset;
  geo.map.panBy([geo.pan, 0]);
}

geo.baseMap = new geo.views.TileLayerView({
  model: new geo.models.TileLayer({
    id: 'osm-basemap',
    serviceUrl: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
    active: true,
    layerOptions: {
      subdomains: '1234',
      attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">'
        + 'MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetm'
        + 'ap.org">OpenStreetMap</a> contributors, <a href="http://creative'
        + 'commons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      detectRetina: true
    }
  })
}).render();

geo.searchContent = new geo.views.SearchContent({
  el: $('.navbar')
}).render();

geo.searchContentTabs = new geo.views.SearchContentTabs({
  el: $('#content-tab-btns')
}).render();

geo.packageSearch = new geo.views.PackageSearch({
  el: $('#map-content-tab'),
  model: new geo.models.PackageSearch({})
}).render();

geo.sidebarMapScroll = new geo.views.SidebarMapScroll({
  el: $('.leaflet-popup-pane')
}).render();