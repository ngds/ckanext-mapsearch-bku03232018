var root = this;
root.geo == null ? geo = root.geo = {} : geo = root.geo;

geo.initBounds = L.latLngBounds(
  [51.919376, -130.227639],
  [22.637598, -65.891701]
);

geo.mapOpts = {
  attributionControl: true,
  minZoom: 2
};

geo.map = L.map('map', geo.mapOpts).fitBounds(geo.initBounds);

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