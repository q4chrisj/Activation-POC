var App = App || {};

var ViewController = {
    showView: function(rootEl, view) {
        if(this.currentView) {
            this.currentView.close();
        }
    
        this.currentView = view;
        // if(this.currentView.render) {
        //     this.currentView.render();
        // }
            
        // rootEl.empty();
        // rootEl.append(view.el);
    }
}

App.ViewController = ViewController;