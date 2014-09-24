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
    url: '/api/action/get_package_info',
    type: 'POST',
    dataType: 'JSON',
    rows: 50,
    page: 1,
    start: 0,
    query: '',
    extras: '',
    sort: ''
  },
  makeSearch: function (callback) {
    var model
      , qs
      , data
      ;

    model = this;
    qs = model.query + '+res_url:*+';
    data = JSON.stringify({
      extras: model.extras,
      q: qs,
      rows: model.rows,
      sort: model.sort,
      start: model.start
    });

    $.ajax({
      url: model.url,
      type: model.type,
      dataType: model.dataType,
      data: data,
      success: function (response) {
        callback(response);
      }
    })
  }
});