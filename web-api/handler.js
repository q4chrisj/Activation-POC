'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getJobs = async (event, context, callback) => {
  const params = {
    TableName: "DRActivation-Job",
  };

  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    // if (error) {
    //   console.log("Error encountered");
    //   console.error(error);
    //   context.error({
    //     'isBase64Encoded': false,
    //     'statusCode': error.statusCode || 501,
    //     'headers': { 'Content-Type': 'text/plain' },
    //     'body': JSON.stringify({
    //       message:'Error fetching the job'
    //     })
    //   });

    // }

    console.log(result);

    // create a response
    var response = {
      "isBase64Encoded": false,
      "statusCode": 200,
      "headers": { 'Content-Type': 'application/json'},
      "body": JSON.stringify(result.Item),
    };
    
    callback(null, response);

  });
}
