var root = this;
root.geo == null ? geo = root.geo = {} : geo = root.geo;

geo.initBounds = L.latLngBounds(
  [51.919376, -130.227639],
  [22.637598, -65.891701]
);

geo.mapOpts = {

};

geo.map = L.map('map', geo.mapOpts).fitBounds(geo.initBounds);

geo.baseMap = new geo.views.TileLayerView({
  model: new geo.models.TileLayer({
    id: 'osm-basemap',
    serviceUrl: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    active: true,
    detectRetina: true
  })
}).render();