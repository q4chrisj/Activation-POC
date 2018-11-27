var DomainToggleStatusView = Backbone.View.extend({
    el: $('#domain-info-toggle-status'),
    tagName: 'div',
    className: 'alert alert-info',
    template: _.template($('#domain-info-status-template').html()),

    initialize: function() {
        //this.listenTo(this.model, 'all', this.render);
    },

    render: function() {
        console.log('Toggling: ' + this.model.toJSON().Domain);
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

var DomainToggleView = Backbone.View.extend({
    el: $('#domain-info-toggle'),
    template: _.template($('#domain-info-toggle-template').html()),

    events: {
        "click #domain-toggle": "toggleDomains"
    },

    initialize: function() {
        this.render();
    },
    
    render: function() {
        this.$el.html(this.template());
        return this;
    },

    toggleDomains: function() {
        this.collection.each(function(item) {
            var toggleStatusView = new DomainToggleStatusView({model: item});
            toggleStatusView.render();

            item.save({ToggleDomains:true}, {
                success: function(model, response) {
                    console.log(response);
                    toggleStatusView.$el.empty();
                },
                error: function(model, response) {
                    console.log(response);
                    toggleStatusView.$el.empty();
                }
            }, {wait:true});
        });
    }
});

var DomainInfoView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#domain-info-template').html()),

    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
});

var DomainInfoViewController = Backbone.View.extend({
    el: $('#domain-info-list'),

    events: {
        'click':'toggleDomains'
    },

    initialize: function() {
        this.collection = new DomainInfoList();

        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.collection, 'reset', this.addAll);
        this.listenTo(this.collection, 'all', this.render);

        var view = this;
        this.collection.fetch({
            success: function () {
                new DomainToggleView({collection:view.collection});
            }
        });
    },

    render: function() {
        return this;
    },
        
    addOne: function (domainInfo) {
        var view = new DomainInfoView({ model: domainInfo });
        this.$el.append(view.render().el);
    },

    addAll: function () {
        this.collection.each(this.addOne, this);
    }
});