var root = this;
root.geo == null ? geo = root.geo = {} : geo = root.geo;
geo.views == null ? geo.views = geo.views = {} : geo.views = geo.views;

geo.views.TileLayerView = Backbone.View.extend({
  render: function () {
    var active = this.activeModel();
    geo.map.addLayer(active.get('layer'));
  },
  activeModel: function () {
    if (this.model.get('active')) return this.model;
  }
});

geo.views.SearchContent = Backbone.View.extend({
  events: {
    'click button': 'configureContent'
  },
  configureContent: function (e) {
    var view = this
      , uid = e.currentTarget.id
      , contentTab = $('#map-content-tab')
      ;
    if (contentTab.hasClass('active')) {
      contentTab.removeClass('active');
    } else {
      contentTab.addClass('active');
    }
  }
});

geo.views.SearchContentTabs = Backbone.View.extend({
  events: {
    'click button': 'switchTabs'
  },
  switchTabs: function (e) {
    var view
      , target
      , other
      ;

    view = this;
    target = e.currentTarget.id;
    target = target.split('toggle-')[1];

    if (target === 'search-tab') {
      targetBtn = $('#toggle-search-tab');
      otherBtn = $('#toggle-results-tab');

      targetBtn.addClass('active');
      otherBtn.removeClass('active');

      targetTab = $('#search-tab');
      otherTab = $('#results-tab');

      otherTab.removeClass('active');
      targetTab.addClass('active');
    }

    if (target === 'results-tab') {
      targetBtn = $('#toggle-results-tab');
      otherBtn = $('#toggle-search-tab');

      targetBtn.addClass('active');
      otherBtn.removeClass('active');

      targetTab = $('#results-tab');
      otherTab = $('#search-tab');

      otherTab.removeClass('active');
      targetTab.addClass('active');
    }
  }
});

geo.views.PackageSearch = Backbone.View.extend({
  events: {
    'click #draw-area': 'drawArea',
    'click #submit-search': 'submitSearch',
    'click .toggle-wms-layer': 'toggleWms',
    'click .toggle-bbox': 'toggleBbox'
  },
  drawArea: function () {
    var model = this.model;
    model.makeBBoxQuery(function (bbox) {
      model.set('extras', {'ext_bbox': bbox});
    })
  },
  submitSearch: function () {
    var model = this.model
      , view = this
      , text = $('#text-search').val()
      ;
    model.set('query', text);
    model.postSearch(function (response) {
      view.renderResponse(response);
    })
  },
  renderResponse: function (data) {
    var model = this.model;
    model.makeGeoJson(data);
  },
  toggleBbox: function (e) {
    var model
      , id
      , element
      , bbox
      ;

    model = this.model;
    id = e.currentTarget.id;
    element = $(e);

    if (element.hasClass('active')) {
      bbox = model.get('bboxLayerGroup')[id];
    }
  },
  toggleWms: function (e) {
    var model
      , id
      , element
      , wms
      ;

    model = this.model;
    id = e.currentTarget.id;
    element = $(e);

    if (element.hasClass('active')) {
      wms = model.get('wmsLayerGroup')[id];
      geo.map.removeLayer(wms);
      element.removeClass('active');
      element.text('Show Web Map Service');
    } else {
      model.getWms(id, function (err, res) {
        if (err) {
          alert('Error contacting host server.');
        } else {
          var i
            , result
            , params
            , bbox
            , layer
            ;

          for (i = 0; i < res.length; i++) {
            result = res[i];
            params = {
              'layers': result['layer'],
              'format': result['format'],
              'transparent': true,
              'version': '1.1.1'
            };
            bbox = [[result.bbox[1], result.bbox[0]],
                    [result.bbox[3], result.bbox[2]]];
            layer = L.tileLayer.wms(result.service_url, params);
            model.get('wmsLayerGroup')[id] = layer;
            wms = model.get('wmsLayerGroup')[id];
            geo.map.addLayer(wms);
            geo.map.fitBounds(bbox);
          }
          element.text('Hide Web Map Service');
        }
      })
    }
  }
});