
Backbone.View.prototype.close = function () {
    this.$el.empty();
    this.stopListening();
    if (this.onClose) {
        this.onClose();
    }
}