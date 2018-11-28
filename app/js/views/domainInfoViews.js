var DomainToggleStatusErrorView = Backbone.View.extend({
    tagName: 'div',
    className: 'alert alert-danger',

    render: function() {
        this.$el.html(this.model.toJSON().message);
        return this;
    }
});

var DomainToggleStatusView = Backbone.View.extend({
    tagName: 'div',
    className: 'alert alert-info',
    template: _.template($('#domain-info-status-template').html()),

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    close: function() {
        this.unbind(); // unbind all internal event bindings
        this.remove();
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
            $("#domain-info-toggle-status").html(toggleStatusView.render().el);

            item.save({ToggleDomains:true}, {
                success: function(model, response) {
                    toggleStatusView.close();
                    model.set({'ChangeId':response.result.ChangeInfo.Id});
                    model.set({'ChangeStatus': response.result.ChangeInfo.Status});
                    if(model.get('CurrentStatus') == "Production") {
                        model.set({'CurrentStatus': 'Disaster Recovery'})
                    } else {
                        model.set({'CurrentStatus': 'Production'})
                    }
                },
                error: function(model, response) {
                    var errorModel = new ErrorModel();
                  
                    errorModel.set({message:'There was an error: ' + response.body})
                
                    var errorView = new DomainToggleStatusErrorView({model: errorModel})
                    $("#domain-info-toggle-status").html(errorView.render().el);
                }
            }, {wait:true});
        });

        //this.collection.fetch({clear:true});
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

    close: function() {
        console.log("Closing DomainInfoView", this)
        this.unbind(); // unbind all internal event bindings
        this.remove();
    }
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

        this.childViews = [];
        var view = this;
        this.collection.fetch({
            success: function () {
                new DomainToggleView({ collection: view.collection });
            }
        });

        // window.setInterval(function() {
        //     _.each(view.childViews, function(childView) {
        //         childView.close();
        //     });
        //     view.collection.fetch({
        //         success: function() {
        //             new DomainToggleView({ collection: view.collection });
        //         }
        //     });
        // }, 10000);
    },

    render: function() {
        return this;
    },
        
    addOne: function (domainInfo) {
        var view = new DomainInfoView({ model: domainInfo });
        this.childViews.push(view);
        this.$el.append(view.render().el);
    },

    addAll: function () {
        this.collection.each(this.addOne, this);
    }
});