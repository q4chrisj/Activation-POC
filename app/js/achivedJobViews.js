var Jobs = new JobList;
var JobHistory = new JobHistoryList;

var JobHistoryView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#job-history-template').html()),

    initialize: function () {
        this.listenTo(this.model, 'change', this.render)
    },

    render: function () {
        console.log(this.model);
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    close: function () {
        this.remove();
    }
});

var JobHistoryController = Backbone.View.extend({
    el: $('#job-history-list'),

    initialize: function () {
        this.listenTo(JobHistory, 'sync', this.render);

        JobHistory.fetch({ url: appConfig.apiUrl + "/jobHistory/" + this.model.id, reset: true });
    },

    render: function () {
        this.$el.empty();

        JobHistory.each(function (jobHistory) {
            var view = new JobHistoryView({ model: jobHistory });
            $('#job-history-list').append(view.render().el);
        });

        return this;
    }
});

var JobView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#job-template').html()),
    events: {
        "click .mark-complete": "markComplete",
        "click .view-details": "viewDetails"
    },

    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    markComplete: function () {
        this.model.set({ JobState: "COMPLETED" });
        this.model.save();
    },

    viewDetails: function () {
        var HistoryController = new JobHistoryController({ model: this.model });
    }
});

var JobController = Backbone.View.extend({
    el: $('#app'),

    initialize: function () {
        this.listenTo(Jobs, 'add', this.addOne);
        this.listenTo(Jobs, 'reset', this.addAll);
        this.listenTo(Jobs, 'all', this.render);

        Jobs.fetch();
    },

    render: function () {
        return this;
    },

    addOne: function (job) {
        var view = new JobView({ model: job });
        $('#job-list').append(view.render().el);
    },

    addAll: function () {
        Jobs.each(this.addOne, this);
    }
});
