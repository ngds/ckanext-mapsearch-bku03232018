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
      , url
      , layerOpts;

    model = this;
    layerOpts = options.layerOptions;
    url = model.get('serviceUrl');
    if (url) {
      layer = new L.tileLayer(url, layerOpts);
      callback(layer);
    }
  }
});

geo.models.PackageSearch = Backbone.Model.extend({
  defaults: {
    url: '/api/action/get_package_json',
    type: 'POST',
    dataType: 'JSON',
    rows: 50,
    page: 1,
    start: 0,
    query: '',
    extras: '',
    sort: '',
    featureGroup: '',
  },
  initialize: function () {
    var drawnItems = new L.FeatureGroup();
    this.set('featureGroup', drawnItems);
    geo.map.addLayer(this.get('featureGroup'));
  },
  makeBBoxQuery: function (callback) {
    var featureGroup = this.get('featureGroup');
    new L.Draw.Rectangle(geo.map).enable();
    geo.map.on('draw:created', function (query) {
      var bbox;
      featureGroup.clearLayers();
      featureGroup.addLayer(query.layer);
      bbox = query.layer.getBounds().toBBoxString();
      callback(bbox);
    })
  },
  postSearch: function (callback) {
    var model
      , qs
      , data
      ;
    model = this;
    qs = model.get('query') + '+res_url:*+';
    data = JSON.stringify({
      extras: model.get('extras'),
      q: qs,
      rows: model.get('rows'),
      sort: model.get('sort'),
      start: model.get('start')
    });

    $.ajax({
      url: model.get('url'),
      type: model.get('type'),
      dataType: model.get('dataType'),
      data: data,
      success: function (response) {
        callback(response);
      }
    })
  }
});