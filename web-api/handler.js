'use strict';

const uuid = require('uuid');
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

module.exports.createJob = (event, context, callback) => {
  const timestamp = new Date().toLocaleString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const data = JSON.parse(event.body);
  const params = {
    TableName: "DRActivation-Job",
    Item: {
      JobId: uuid.v1(),
      JobName: "DR Activation",
      JobState: data.JobState,
      Date: timestamp
    }
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.error(error);
      callback(null,{
        "statusCode": 500,
        "body": JSON.stringify({
          "message":'Error creating the job'
        })
      });
      return;
    }
  });

  const response = {
    "statusCode": 200,
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
      JobState: "COMPLETED"
    }
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.error(error);
      callback(null,{
        "statusCode": 500,
        "body": JSON.stringify({
          "message":'Error completing the job'
        })
      });
      return;
    }
  });

  const response = {
    "statusCode": 200,
    "body": JSON.stringify(params.Item)
  };

  callback(null, response);  
};

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

module.exports.createJobHistory = (event, context, callback) => {
  const timestamp = new Date().toLocaleString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const data = JSON.parse(event.body);

  const params = {
    TableName: "DRActivation-JobHistory",
    Item: {
      JobHistoryId: uuid.v1(),
      JobId: data.JobId,
      Completed: data.Completed,
      StepName: data.StepName,
      Date: timestamp
    }
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.error(error);
      callback(null,{
        "statusCode": 500,
        "body": JSON.stringify({
          "message":'Error creating the job'
        })
      });
      return;
    }
  });

  const response = {
    "statusCode": 200,
    "body": JSON.stringify(params.Item)
  };

  callback(null, response);
};