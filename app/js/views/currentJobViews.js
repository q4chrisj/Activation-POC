App = App || {};

var CurrentJobHistoryView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#job-history-template').html()),

    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

var CurrentJobHistoryViewController = Backbone.View.extend({
    el: $('#currentjob-history-list'),

    initialize: function () {
        this.collection = new JobHistoryList;
        this.listenTo(this.collection, 'sync', this.render);

        this.collection.fetch({ url: App.Config.ApiUrl + "/jobHistory/" + this.model.id});

        $('#current-job-history').show();
    },

    render: function () {
        this.$el.empty();

        this.collection.each(function (jobHistory) {
            var view = new CurrentJobHistoryView({ model: jobHistory });
            $('#currentjob-history-list').append(view.render().el);
        });
    }
});

var CurrentJobViewController = Backbone.View.extend({
    el: $('#current-job-status'),
    template: _.template($('#job-started-template').html()),

    initialize: function () {
        this.model = new StartedJob;

        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'change', this.showHistory);

        var view = this;

        this.model.fetch({
            success: function(data) {
                if(data.get('JobId') !== undefined) {
                    view.model.setDate();
                }
            }
        });

        window.setInterval(function () {
            view.model = new StartedJob;
            view.model.clear({silent:true});
            view.model.fetch({
                success: function (data) {
                    view.model.setDate();
                    if (data.get('JobId') !== undefined) {
                        view.render();
                        view.showHistory();
                    } else {
                        view.model.clear();
                        $('#current-job-status').hide();
                        $('#current-job-history').hide();
                        $('#current-job-info').show();
                    }
                },
                error: function () {

                }
            });
        }, 10000)
    },

    render: function () {
        $('#current-job-info').hide();
        this.$el.show();

        this.$el.html(this.template(this.model.toJSON()))

        return true;
    },

    showHistory: function () {
        var HistoryController = new CurrentJobHistoryViewController({ model: this.model });
    }
});
