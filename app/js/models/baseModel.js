var BaseModel = Backbone.Model.extend({
    initialize: function () {
       this.setDate();
    },
    setDate: function() {
        // convert utc dates to local date/time
        var date = moment.utc(this.attributes.Date);
        date = moment.tz(date, "America/Toronto");
        date = date.format('YYYY-MM-DD h:mm:ss');

        this.set('Date', date);        
    }
});

var ErrorModel = Backbone.Model.extend({
    
})