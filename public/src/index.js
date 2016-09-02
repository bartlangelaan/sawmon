'use strict';

var $ = require('jquery');
var Backbone = require('backbone');

/**
 * Models
 */
var Server = Backbone.Model.extend({
    url: '/api/servers',
    idAttribute: '_id',
    parse: function(data){
        if(data.server) return data.server;
        return data;
    }
});

var Website = Backbone.Model.extend({
    url: '/api/websites',
    idAttribute: '_id',
    parse: function(data){
        if(data.websites) return data.website;
        return data;
    }
});

/**
 * Collections
 */
var ServersCollection = Backbone.Collection.extend({
    url: '/api/servers',
    model: Server,
    parse: function(data){
        if(data.servers) return data.servers;
        return data;
    }
});
var servers = new ServersCollection();

var WebsiteCollection = Backbone.Collection.extend({
    url: '/api/websites',
    model: Website,
    parse: function(data){
        if(data.websites) return data.websites;
        return data;
    }
});
var websites = new WebsiteCollection();

/**
 * Views
 */
var ServersView = Backbone.View.extend({
    template: require('./servers-template.handlebars'),
    collection: servers,
    el: $('#servers'),
    initialize: function(){
        this.listenTo(this.collection, "sync", this.render);
    },
    render: function() {
        this.$el.html(this.template({
            servers: this.collection.toJSON()
        }));
        return this;
    }
});
new ServersView();

var WebsitesView = Backbone.View.extend({
    template: require('./websites-template.handlebars'),
    collection: websites,
    el: $('#websites'),
    initialize: function(){
        this.listenToOnce(this.collection, "sync", function(){
            this.listenTo(this.collection, "add remove change", this.render);
            this.render();
        });
    },
    render: function() {
        this.$el.html(this.template({
            websites: this.collection.toJSON()
        }));
        return this;
    }
});
new WebsitesView();

/**
 * App
 */
function refresh() {
    servers.fetch();
    websites.fetch();
}

refresh();
setInterval(refresh, 1000);