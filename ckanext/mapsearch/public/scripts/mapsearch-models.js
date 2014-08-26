var root = this;
root.geo == null ? geo = root.geo = {} : geo = root.geo;
geo.models == null ? geo.models = geo.models = {} : geo.models = geo.models;

geo.models.LayerModel = Backbone.Model.extend({
  defaults: {
    id: 'undefined',
    serviceUrl: 'undefined',
    data: 'undefined',
    layerOptions: 'undefined',
    layer: 'undefined',
    active: false,
    detectRetina: true,
    isExtent: false
  },
  initialize: function (options) {
    var model = this;
    model.createLayer(options, function (layer) {
      model.set('layer', layer)
    })
  },
  createLayer: function (options, callback) {}
});

geo.models.TileLayer = geo.models.LayerModel.extend({
  createLayer: function (options, callback) {
    var model
      , layer
      , url;

    model = this;
    url = model.get('serviceUrl');
    if (url) {
      layer = new L.tileLayer(url, options);
      callback(layer);
    }
  }
});