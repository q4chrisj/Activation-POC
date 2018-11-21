var JobHistory = Backbone.Model.extend({
    defaults: {
        JobId: ''
    },
    idAttribute: 'JobHistoryId'
});

var JobHistoryList = Backbone.Collection.extend({
    urlRoot: function() {
        return appConfig.apiUrl + '/jobHistory/'
    },
    model: JobHistory,
    parse: function(response) {
        return response.jobs;
    },
    comparator: function(jobHistory) {
        return new Date(jobHistory.get('Date'));
    }

});
