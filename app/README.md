# README

## Docker

You can run this app in a docker container with apache by doing the following

1. docker build -t dashboard-app .
2. OSX: `docker run -d -p 80:80 -v ~/Projects/Activation-POC/app:/usr/local/apache2/htdocs --name dashboard-app dashboard-app`
3. Windows: `docker run -d -p 80:80 /c/projects/activation-poc/app:/usr/local/apache2/htdocs --name dashboard-app dashboard-app`

## Sync to S3

```bash
aws s3 sync . s3://dr-activation-dashboard --region us-west-1 --profile dr-admin
```