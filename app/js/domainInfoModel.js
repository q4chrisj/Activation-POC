var DomainInfo = Backbone.Model.extend({
    idAttribute: 'DomainInfoId'
});

var DomainInfoList = Backbone.Collection.extend({
    url: function() {
        return App.Config.ApiUrl + '/domainInfo/'
    },
    model: Job,
    parse: function(response) {
        return response.domainInfo;
    }
});