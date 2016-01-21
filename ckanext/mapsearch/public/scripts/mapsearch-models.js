var root = this;
root.geo == null ? geo = root.geo = {} : geo = root.geo;
geo.models == null ? geo.models = geo.models = {} : geo.models = geo.models;
var ptCount;

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
    resultsFeatureGroup: '',
    wmsLayerGroup: {},
    bboxLayerGroup: {}
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
  getWms: function (id, callback) {
    $.ajax({
      url: '/api/action/get_wms_info',
      type: 'POST',
      data: JSON.stringify({'id': id}),
      success: function (res) {
        if (res['result']['Error']) {
          callback('Error');
        }
        callback(null, res.result);
      },
      error: function (err) {
        callback(err);
      }
    })
  },
  makeSearchResult: function (data) {
    var model
      , head
      , body
      , resources
      , resource
      , resourceTabs
      , package
      , packageTabs
      , links
      , i
      ;

    model = this;

    function makeResourceTab (url, text) {
      var html = '<div class="accordion-group" id="accordion-search-result">';
      html += '<div class="accordion-heading">';
      html += '<a class="data-ogc" target="_blank" href="'
        + url + '">' + text + '</a>';
      html += '</div></div>';
      return html;
    }

    function makeWmsTab (id, text) {
      html = '<div class="accordion-group" id="accordion-search-result">';
      html += '<div class="accordion-heading">';
      html += '<a id="' + id + '" href="#" class="toggle-wms-layer">' + text + '</a>';
      html += '</div></div>';
      return html;
    }

    function makeBboxTab (id, data, text) {
      html = '<div class="accordion-group" id="accordion-search-result">';
      html += '<div class="accordion-heading">';
      html += '<a id=' + id + ' class="toggle-bbox" value="'
        + data + '" href="#">' + text + '</a>';
      html += '</div></div>';
      return html;
    }

    package = data.properties;
    packageTabs = [
      makeBboxTab(package.pkg_id, package.bboxString, 'Show Area on Map')
    ].join('');

    resources = data.properties.resources;
    resourceTabs = [];
    for (i = 0; i < resources.length; i++) {
      resource = resources[i];
      if (resource.format.toLowerCase() === 'html') {
        resourceTabs.push(makeResourceTab(resource.url, resource.name));
      }
      if (resource.format.toLowerCase() === 'wms' && resource.url.indexOf('kml') < 0) {
        resourceTabs.push(makeWmsTab(resource.id, 'Show Web Map Service'));
        resourceTabs.push(makeResourceTab(resource.url, 'WMS Capabilities'));
      }
      if (resource.format.toLowerCase() === 'wfs') {
        resourceTabs.push(makeResourceTab(resource.url, 'WFS Capabilities'));
      }
      if (resource.format.toLowerCase() === 'csv') {
        resourceTabs.push(makeResourceTab(resource.url, 'CSV Resource'));
      }
      if (resource.format.toLowerCase() === 'pdf') {
        resourceTabs.push(makeResourceTab(resource.url, 'PDF Resource'));
      }
      if (resource.format.toLowerCase() === 'zip') {
        resourceTabs.push(makeResourceTab(resource.url, 'ZIP Resource'));
      }
      if (resource.format.indexOf('ms-excel') > 0) {
        resourceTabs.push(makeResourceTab(resource.url, 'MS Excel Resource'));
      }
      if (resource.format.indexOf('openxml') > 0) {
        resourceTabs.push(makeResourceTab(resource.url, 'MS Office Resource'));
      }
      if (resource.url.indexOf('notifications.usgin.org') > 0) {
        resourceTabs.push(makeResourceTab(resource.url, 'Service Notifications'));
      }
      if (resource.url.indexOf('.tif') > 0 || resource.url.indexOf('.tiff') > 0) {
        resourceTabs.push(makeResourceTab(resource.url, 'TIFF Resource'));
      }
      if (!resource.format && resource.url && resource.url.indexOf('notifications.usgin.org') < 0) {
        resourceTabs.push(makeResourceTab(resource.url, 'External Website'))
      }
    }

    resourceTabs.push(makeResourceTab('/dataset/' + package.pkg_id, 'Data Details Page'))

    links = resourceTabs.join('');

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
      if (desc.length < 199) {
        desc = 'No description available';
      }
      html = '<li class="map-search-result result-' + id + '" >';
      
      html += '<div class="accordion" id="accordion-search">';
      html += '<div class="accordion-group">';
      html += '<div class="accordion-heading">';
      html += '<a class="accordion-toggle id-' + id + '" data-toggle="collapse" data-parent="#accordion-search" href="#collapse-' + id + '">' + title + '</a>';
      html += '<div class=package-description><p>' + desc + '</p></div>';
      html += '</div>';
      html += '<div id="collapse-' + id + '" class="accordion-body collapse">';
      html += packageTabs;
      html += links;
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
      , bboxString
      , bounds
      , center
      , geoJson
      , marker
      , content
      , i
      ;

    model = this;
    layer = model.get('resultsFeatureGroup');
    result = input['result']['packages'];
    if ( isNaN(ptCount) ) { ptCount = 0; }
    ptCount = ptCount + result.length;
    console.log('results count ' + result.length);
    for (i = 0; i < result.length; i++) {
      rec = result[i];
      randomize = Math.floor(Math.random() * 1000000000000000000000);
      coords = JSON.parse(rec.bbox[0]);
      if (coords.type === 'Polygon') {
        bounds = L.latLngBounds([
          [coords.coordinates[0][0][1], coords.coordinates[0][0][0]],
          [coords.coordinates[0][2][1], coords.coordinates[0][2][0]]
        ]);
        bboxString = [coords.coordinates[0][0][0],
                      coords.coordinates[0][0][1],
                      coords.coordinates[0][2][0],
                      coords.coordinates[0][2][1]]
                      .join(',');
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
          'bbox': bounds,
          'bboxString': bboxString
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [center.lat, center.lng]
        }
      };
      model.makeSearchResult(geoJson);


      content = rec.title + '<br><button id="' + randomize +
        '" class="btn btn-small btn-success btn-block marker-btn" ' +
        'type="button">More Information</button>';
      marker = new L.Marker(geoJson['geometry']['coordinates'])
        .bindPopup(content);

      layer.addLayer(marker);
    }
  }
});
