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

geo.views.SearchContentTab = Backbone.View.extend({
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

geo.views.PackageSearch = Backbone.View.extend({
  events: {
    'click #draw-area': 'drawArea',
    'click #submit-search': 'submitSearch'
  },
  drawArea: function () {
    var model = this.model;
    model.makeBBoxQuery(function (bbox) {
      model.set('extras', {'ext_bbox': bbox});
    })
  },
  submitSearch: function () {
    var model = this.model
      , text = $('#text-search').val()
      ;
    model.set('query', text);
    model.postSearch(function (response) {
      console.log(response);
    })
  }
});