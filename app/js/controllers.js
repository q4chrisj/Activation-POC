var App = App || {};

var ViewController = {
    showView: function (view) {
        if (this.currentView) {
            this.currentView.close();
        }

        this.currentView = view;
    }
}
var TransitionController = {
    handleChange: function (currentRoute) {
        window.clearInterval();
        switch (currentRoute) {
            case "home":
                $('#home').show();
                $('#current-jobs').hide();
                $('#archived-jobs').hide();
                $('#domain-manager').hide();

                break;
            case "currentJobs":
                $('#current-jobs').show();
                $('#home').hide()
                $('#archived-jobs').hide();
                $('#domain-manager').hide();

                break;
            case "archivedJobs":
                $('#archived-jobs').show();
                $('#home').hide()
                $('#current-jobs').hide();
                $('#domain-manager').hide();

                break;
            case "domainInfo":
                $('#domain-manager').show();
                $('#home').hide()
                $('#current-jobs').hide();
                $('#archived-jobs').hide();

                break;
        }
    }
};

App.ViewController = ViewController;
App.TransitionController = TransitionController;