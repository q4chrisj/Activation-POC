App = App || {};

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
    idAttribute: 'JobId',
    parse: function(response) {
        if(response.jobs) {
            return response.jobs;
        }

        return response;
    }
});

var StartedJob = Backbone.Model.extend({
    url: function() {
        return App.Config.ApiUrl + '/jobs/STARTED'
    },
    idAttribute: 'JobId',
    parse: function(response) {
        return response.jobs;
    }
});

var JobList = Backbone.Collection.extend({
    url: function() {
        return App.Config.ApiUrl + '/jobs/'
    },
    model: Job,
    parse: function(response) {
        return response.jobs;
    },
    comparator: 'Date'
});
