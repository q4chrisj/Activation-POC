var JobHistory = Backbone.Model.extend({
    defaults: {
        JobId: ''
    },
    idAttribute: 'JobHistoryId'
});

var JobHistoryList = Backbone.Collection.extend({
    urlRoot: function() {
        return App.Config.ApiUrl + '/jobHistory/'
    },
    model: JobHistory,
    parse: function(response) {
        return response.jobs;
    },
    comparator: function(jobHistory) {
        return new Date(jobHistory.get('Date'));
    }

});
