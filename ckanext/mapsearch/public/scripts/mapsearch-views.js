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

geo.views.PackageSearchView = Backbone.View.extend({

});