'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getJobs = (event, context, callback) => {
  var params = {
    TableName: "DRActivation-Job" 
  };

  if(event.pathParameters && event.pathParameters.state) {
    params.ExpressionAttributeValues = {
        ":state": event.pathParameters.state
    };
    params.FilterExpression = "JobState = :state";
  }

  console.log(params);  

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null,{
        "statusCode": 500,
        "body": JSON.stringify({
          "message":'Error fetching the job'
        })
      });
      return;
    }

    var response = {
      "statusCode": 200,
      "body": JSON.stringify({jobs:result.Items})
    }
    
    callback(null, response);
  });
};

module.exports.jobHistory = (event, context, callback) => {
  if(event.pathParameters == null || event.pathParameters.jobId == null) {
    callback(null,{
      "statusCode": 400,
      "body": JSON.stringify({
        "message":'Missing required parameter jobId'
      })
    }); 
    return;
  }

  var params = {
    TableName: "DRActivation-JobHistory"
  };

  if(event.pathParameters && event.pathParameters.jobId) {
    params.ExpressionAttributeValues = {
      ":jobid": event.pathParameters.jobId
    };
    params.FilterExpression = "JobId = :jobid";
  }

  console.log(params);

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null,{
        "statusCode": 500,
        "body": JSON.stringify({
          "message":'Error fetching job history'
        })
      });
      return;
    }

    var response = {
      "statusCode": 200,
      "body": JSON.stringify({jobs:result.Items})
    }
    
    callback(null, response);
  });
};