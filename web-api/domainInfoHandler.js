'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getDomainInfo = (event, context, callback) => {
  var params = {
    TableName: "DRActivation-DomainInfo" 
  };

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

    var response = {
      "statusCode": 200,
      "headers": {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      "body": JSON.stringify({domainInfo:result.Items})
    }
    
    callback(null, response);
  });
};
