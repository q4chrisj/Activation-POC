# Dashboard App - To Do

## To Do

* [ ] Implement JobHistoryDetail
    * [ ] Api Gateway
    * [ ] Tester
    * [ ] App
* [ ] Figure out view management better.
  * [ ] Implement the BaseView concept with close method and then a generic view controller to render/close views.
* [ ] Collection sorting, by date, correctly.
  * [x] Include seconds in date field - dynamo.
  * [ ] Format dates to local timezone in app
* [ ] Serve the dashboard out of S3 + cloudfront (with a nice domain).
* [ ] Handle more than one running activation

## Done

* [x] JobHistory api gateway should return jobHistory:result.Items, not jobs:result.Items.
* [x] "Cannot read property 'ApiUrl' of undefined" in jobModel.StartedJob
* [x] Auto reload various lists etc.
* [x] Implement Backbone router to split current and archived into seperate pages.
* [x] Docker for local development
  * `docker run -d -p 80:80 -v ~/Projects/Activation-POC/app:/usr/local/apache2/htdocs --name dashboard-app dashboard-app`