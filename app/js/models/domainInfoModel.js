var DomainInfo = Backbone.Model.extend({
    url: function() {
        return App.Config.ApiUrl + '/toggleDomain/'
    },
    
    idAttribute: 'DomainInfoId'
});

var DomainInfoList = Backbone.Collection.extend({
    url: function() {
        return App.Config.ApiUrl + '/domainInfo/'
    },
    model: DomainInfo,
    parse: function(response) {
        return response.domainInfo;
    }
});