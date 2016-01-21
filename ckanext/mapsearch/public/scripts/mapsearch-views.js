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
    'click #reset-search': 'resetSearch',
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
      targetBtn = $('#toggle-results-tab');
      otherBtn = $('#toggle-search-tab');

      targetBtn.addClass('active');
      otherBtn.removeClass('active');

      targetTab = $('#results-tab');
      otherTab = $('#search-tab');
      otherTab.removeClass('active');
      targetTab.addClass('active');
      view.renderResponse(response);
      var totC = sumCount + ptCount;
      $('#result-count').text("Datasets found " + ptCount);

    })
  },
  resetSearch: function () {
    ptCount = 0;
    location.reload();
  },
  renderResponse: function (data) {
    var model = this.model;
    model.makeGeoJson(data);
  },
  toggleBbox: function (e) {
    var model
      , id
      , element
      , layer
      , values
      , coords
      , coord
      , bounds
      , bbox
      , i
      ;

    model = this.model;
    id = e.currentTarget.id;
    element = $(e);

    if (element.hasClass('active')) {
      layer = model.get('bboxLayerGroup')[id];
      geo.map.removeLayer(layer);
      element.removeClass('active');
      element.text('Show Area on Map');
    } else {
      values = e.currentTarget.getAttribute('value').split(',');
      coords = [];
      for (i = 0; i < values.length; i++) {
        coord = parseFloat(values[i]);
        coords.push(coord);
      }
      bounds = [[coords[1], coords[0]], [coords[3], coords[2]]];
      bbox = L.rectangle(bounds, {color: 'red', opacity: 1,
        fillOpacity: 0.2, weight: 1});
      model.get('bboxLayerGroup')[id] = bbox;
      layer = model.get('bboxLayerGroup')[id];
      geo.map.addLayer(layer);
      geo.map.fitBounds(layer, {maxZoom: 6, padding: [200, 200]});
      element.addClass('active');
      element.text('Hide Area on Map');
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
          var params
            , bbox
            , layer
            ;

          params = {
            'layers': res['layer'],
            'format': res['tile_format'],
            'transparent': true,
            'version': '1.1.1'
          };
          bbox = [[res.bbox[1], res.bbox[0]],
                  [res.bbox[3], res.bbox[2]]];
          layer = L.tileLayer.wms(res.service_url, params);
          model.get('wmsLayerGroup')[id] = layer;
          wms = model.get('wmsLayerGroup')[id];
          geo.map.addLayer(wms);
          geo.map.fitBounds(bbox);
          element.text('Hide Web Map Service');
        }
      })
    }
  }
});

geo.views.SidebarMapScroll = Backbone.View.extend({
  events: {
    'click button': 'scrollSidebar'
  },
  scrollSidebar: function (e) {
    var content = $('.result-' + e.currentTarget.id);

    $('.id-' + e.currentTarget.id).removeClass('collapsed');
    $('#collapse-' + e.currentTarget.id).addClass('in');

    $('#search-results .results').prepend(content);
    $('#search-results .results').animate({scrollTop: 0}, 'fast');
  }
});