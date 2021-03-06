'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.jobHistory = (event, context, callback) => {
  var params = {
    TableName: "DRActivation-JobHistory"
  };

  if(event.pathParameters && event.pathParameters.jobId) {
    params.ExpressionAttributeValues = {
      ":jobid": event.pathParameters.jobId
    };
    params.FilterExpression = "JobId = :jobid";
  }

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null,{
        "statusCode": 500,
        "headers": {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        "body": JSON.stringify({
          "message":'Error fetching job history'
        })
      });
      return;
    }

    var response = {
      "statusCode": 200,
      "headers": {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      "body": JSON.stringify({jobHistory:result.Items})
    }
    
    callback(null, response);
  });
};

module.exports.createJobHistory = (event, context, callback) => {
  
  const data = JSON.parse(event.body);

  const params = {
    TableName: "DRActivation-JobHistory",
    Item: {
      JobHistoryId: uuid.v1(),
      JobId: data.JobId,
      Completed: data.Completed,
      StepName: data.StepName,
      Date: new Date().toLocaleString()
    }
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.error(error);
      callback(null,{
        "statusCode": 500,
        "headers": {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        "body": JSON.stringify({
          "message":'Error creating the job'
        })
      });
      return;
    }
  });

  const response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    "body": JSON.stringify(params.Item)
  };

  callback(null, response);
};