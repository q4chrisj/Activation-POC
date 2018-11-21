
var CurrentJob = new StartedJob;
var CurrentJobHistory = new JobHistoryList

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
        this.listenTo(CurrentJobHistory, 'sync', this.render);

        CurrentJobHistory.fetch({ url: appConfig.apiUrl + "/jobHistory/" + this.model.id, reset: true });
    },

    render: function () {
        this.$el.empty();

        CurrentJobHistory.each(function (jobHistory) {
            var view = new CurrentJobHistoryView({ model: jobHistory });
            $('#currentjob-history-list').append(view.render().el)
        });
    }
});

var CurrentJobViewController = Backbone.View.extend({
    el: $('#current-job-info'),
    template: _.template($('#job-started-template').html()),

    initialize: function () {
        this.listenTo(CurrentJob, 'change', this.render);
        this.listenTo(CurrentJob, 'change', this.showHistory);

        CurrentJob.fetch();

        var view = this;
        window.setInterval(function () {
            CurrentJob.fetch({
                success: function (data) {
                    if (data.get('JobId') !== undefined) {
                        view.render();
                        view.showHistory();
                    } else {
                        $('#current-job-history').hide();
                    }
                },
                error: function () {

                }
            });
        }, 10000)
    },

    render: function () {
        this.$el.html(this.template(CurrentJob.toJSON()))

        return true;
    },

    showHistory: function () {
        var HistoryController = new CurrentJobHistoryViewController({ model: CurrentJob });
        $('#current-job-history').show();
    }
});
