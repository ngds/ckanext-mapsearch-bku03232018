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
    extras: {'ext_bbox': '-180,-90,180,90'},
    sort: '',
    queryFeatureGroup: '',
    resultsFeatureGroup: ''
  },
  initialize: function () {
    var drawnItems
      , resultsLayer
      ;

    drawnItems = new L.FeatureGroup();
    resultsLayer = new L.MarkerClusterGroup({
      iconCreateFunction: function (cluster) {
        var count
          , html
          , className
          ;

        count = cluster.getChildCount();
        if (count < 10) {
          html = '<b style="margin-left:10px;vertical-align:-7px;">'
            + count + '</b>';
        }
        if (count >= 10 && count < 100) {
          html = '<b style="margin-left:6px;vertical-align:-7px;">'
            + count + '</b>';
        }
        if (count >= 100 && count < 1000) {
          html = '<b style="margin-left:1px;vertical-align:-7px;">'
            + count + '</b>';
        }
        className = 'clusterfuck';
        return new L.DivIcon({html: html, className: className});
      }
    });
    this.set('queryFeatureGroup', drawnItems);
    this.set('resultsFeatureGroup', resultsLayer);
    geo.map.addLayer(this.get('queryFeatureGroup'));
    geo.map.addLayer(this.get('resultsFeatureGroup'));
  },
  makeBBoxQuery: function (callback) {
    var featureGroup = this.get('queryFeatureGroup');
    new L.Draw.Rectangle(geo.map).enable();
    geo.map.on('draw:created', function (query) {
      var bbox;
      featureGroup.clearLayers();
      featureGroup.addLayer(query.layer);
      bbox = query.layer.getBounds().toBBoxString();
      callback(bbox);
    })
  },
  makeSearchResult: function (data) {
    var head
      , body
      ;

    head = (function () {
      var id
        , title
        , desc
        , html
        ;
      id = data.properties.feature_id;
      title = data.properties.title;
      desc = data.properties.notes;
      if (desc.length > 200) {
        desc = desc.substr(0, 200) + '...';
      }
      html = '<li class="map-search-result result-' + id + '" >';
      html += '<div class="accordion" id="accordion-search">';
      html += '<div class="accordion-group">';
      html += '<div class="accordion-heading">';
      html += '<a class="accordion-toggle id-' + id + '" data-toggle="collapse" data-parent="#accordion-search" href="#collapse-' + id + '">' + title + '</a>';
      html += '<div class=package-description><p>' + desc + '</p></div>';
      html += '</div>';
      html += '</div></div></li>';
      $('#search-results .results').append(html);
    })();
  },
  postSearch: function (callback) {
    var model
      , featureGroup
      , qs
      , data
      ;

    model = this;
    featureGroup = model.get('queryFeatureGroup');
    featureGroup.clearLayers();
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
  },
  makeGeoJson: function (input) {
    var model
      , result
      , layer
      , rec
      , randomize
      , coords
      , bounds
      , center
      , geoJson
      , i
      ;

    model = this;
    layer = model.get('resultsFeatureGroup');
    result = input['result']['packages'];
    for (i = 0; i < result.length; i++) {
      rec = result[i];
      randomize = Math.floor(Math.random() * 1000000000000000000000);
      coords = JSON.parse(rec.bbox[0]);
      if (coords.type === 'Polygon') {
        bounds = L.latLngBounds([
          [coords.coordinates[0][0][1], coords.coordinates[0][0][0]],
          [coords.coordinates[0][2][1], coords.coordinates[0][2][0]]
        ]);
        center = bounds.getCenter();
      }
      if (coords.type === 'Point') {
        center = {
          lat: parseFloat(coords.coordinates[1]),
          lng: parseFloat(coords.coordinates[0])
        }
      }
      geoJson = {
        'type': 'Feature',
        'properties': {
          'feature_id': randomize,
          'title': rec.title,
          'name': rec.name,
          'notes': rec.notes,
          'pkg_id': rec.id,
          'resources': rec.resources,
          'bbox': bounds
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [center.lat, center.lng]
        }
      };
      model.makeSearchResult(geoJson);
      layer.addLayer(new L.Marker(geoJson['geometry']['coordinates']));
    }
  }
});