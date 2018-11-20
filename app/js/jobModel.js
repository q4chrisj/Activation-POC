var Job = Backbone.Model.extend({
    url: function() {
        return appConfig.apiUrl + '/jobs/'
    },
    defaults: function() {
        return {
            JobName: "DR Activation",
            JobState: "STARTED",
            Date: new Date()
        }
    },
    idAttribute: 'JobId'
});

var JobList = Backbone.Collection.extend({
    url: function() {
        return appConfig.apiUrl + '/jobs/'
    },
    model: Job,
    parse: function(response) {
        return response.jobs;
    },
    comparator: 'Date'
});