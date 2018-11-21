# Dashboard App - To Do

* [ ] Figure out view management better.
  * [ ] Implement the BaseView concept with close method and then a generic view controller to render/close views.
* [x] Auto reload various lists etc.
* [ ] Collection sorting, by date, correctly.
* [ ] Outputting dates correctly (with milliseconds?)
* [ ] Implement Backbone router to split current and archived into seperate pages.
* [ ] Serve the dashboard out of S3 + cloudfront (with a nice domain).
* [ ] JobHistory api gateway should return jobHistory:result.Items, not jobs:result.Items.