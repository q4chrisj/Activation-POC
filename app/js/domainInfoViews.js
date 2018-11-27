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
        console.log('Toggle domains');
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

        this.collection.fetch();

        var toggleView = new DomainToggleView;
    },

    render: function() {
        return this;
    },
        
    addOne: function (domainInfo) {
        console.log(domainInfo);
        var view = new DomainInfoView({ model: domainInfo });
        this.$el.append(view.render().el);
    },

    addAll: function () {
        this.collection.each(this.addOne, this);
    },

    toggleDomains: function() {
        
    }
});