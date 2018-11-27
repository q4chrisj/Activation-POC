'use strict';
// listResourceRecordSets
// changeResourceRecordSets

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const route53 = new AWS.Route53();

var Route53Helpers = {
  getRecordSet: function(hostedZoneId, domainName) {
    var params = {
      HostedZoneId: hostedZoneId
    };

    var record;
    console.log("Record: " + record);
    route53.listResourceRecordSets(params, function(error, result) {
      if(error) {
        console.log(error);
      } else {
        for (var i = 0; i < result.ResourceRecordSets.length; i++) {
          var item = result.ResourceRecordSets[i];
          var itemName = item.Name.replace("\\052","*").slice(0, -1);
          console.log("Item in helper: " + item);
          if(itemName == domainName) {
            record = item;
            console.log("Record 1: " + record);
            return record;
          }
        }
      }
    });
    console.log("Record 2: " + record)
  }
}
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
    };

    for (var i = 0; i < result.Items.length; i++) {
      var item = result.Items[i];
      var recordSet = Route53Helpers.getRecordSet(item.HostedZoneId, item.Domain)
      console.log(recordSet);
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
