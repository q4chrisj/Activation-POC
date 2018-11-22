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
                $('#current-jobs').hide();
                $('#archived-jobs').hide();

                break;
            case "currentJobs":
                $('#current-jobs').show();
                $('#archived-jobs').hide();

                break;
            case "archivedJobs":
                $('#current-jobs').hide();
                $('#archived-jobs').show();

                break;
        }
    }
};

App.ViewController = ViewController;
App.TransitionController = TransitionController;