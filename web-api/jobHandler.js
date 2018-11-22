'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getJobs = (event, context, callback) => {
  var params = {
    TableName: "DRActivation-Job" 
  };

  console.log(event.pathParameters);
  
  if(event.pathParameters && event.pathParameters.state) {
    params.ExpressionAttributeValues = {
        ":state": event.pathParameters.state
    };
    params.FilterExpression = "JobState = :state";
  }

  console.log("Requesting started jobs with: " + JSON.stringify(params));

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
          "message":'Error fetching the job'
        })
      });
      return;
    }

    console.log(result.Items.length);

    var returnData = result.Items;
    if(result.Items.length == 1) {
      returnData = result.Items[0];
    }

    var response = {
      "statusCode": 200,
      "headers": {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      "body": JSON.stringify({jobs:returnData})
    }
    
    callback(null, response);
  });
};

module.exports.createJob = (event, context, callback) => {

  const data = JSON.parse(event.body);
  const params = {
    TableName: "DRActivation-Job",
    Item: {
      JobId: uuid.v1(),
      JobName: "DR Activation",
      JobState: data.JobState,
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

module.exports.completeJob = (event, context, callback) => {

  const data = JSON.parse(event.body);
  
  const params = {
    TableName: "DRActivation-Job",
    Item: {
      JobId: data.JobId,
      JobName: data.JobName,
      JobState: "COMPLETED",
      Date: new Date(data.Date).toLocaleString()
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
          "message":'Error completing the job'
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