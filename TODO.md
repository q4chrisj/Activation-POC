# Dashboard App - To Do

## To Do

* Domain Management
  * [ ] Implement with multiple domain examples
  * [ ] Ensure that we are always switching from a cname to a cname
  * [ ] Need a function to seed data to this table.
  * [ ] For each domain, display the current change status.
* [ ] Trigger code deploy from web app
* [ ] Implement loading view pattern.
* [ ] Figure out view management better.
  * [ ] Implement the BaseView concept with close method and then a generic view controller to render/close views.
* [ ] Serve the dashboard out of S3 + cloudfront (with a nice domain).
  * [x] S3
  * [ ] Custom domain
  * [ ] Cloudfront
* [ ] Business logic - prevent more than one activation happening at a time.
* serverless updates:
  * [ ] Create dynamodb tables
  * [ ] Create S3 bucket + cloudfront (s3 plugin)
  * [ ] Create custom domain

## Done

* [x] Collection sorting, by date, correctly.
  * [x] Include seconds in date field - dynamo.
  * [x] Format dates to local timezone in app
* [x] Implement JobHistoryDetail
  * [x] Api Gateway
  * [x] Tester
  * [x] App
* [x] JobHistory api gateway should return jobHistory:result.Items, not jobs:result.Items.
* [x] "Cannot read property 'ApiUrl' of undefined" in jobModel.StartedJob
* [x] Auto reload various lists etc.
* [x] Implement Backbone router to split current and archived into seperate pages.
* [x] Docker for local development
  * `docker run -d -p 80:80 -v ~/Projects/Activation-POC/app:/usr/local/apache2/htdocs --name dashboard-app dashboard-app`