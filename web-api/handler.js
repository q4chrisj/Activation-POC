'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getJobs = (event, context, callback) => {
  const params = {
    TableName: "DRActivation-Job"
  };

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

  const params = {
    ExpressionAttributeValues: {
      ":jobid": event.pathParameters.jobId
    },
    FilterExpression: "JobId = :jobid",
    TableName: "DRActivation-JobHistory"
  };

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

    console.log(result);

    var response = {
      "statusCode": 200,
      "body": JSON.stringify({jobs:result.Items})
    }
    
    callback(null, response);
  });
};