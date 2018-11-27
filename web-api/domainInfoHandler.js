'use strict';
// listResourceRecordSets
// changeResourceRecordSets

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const route53 = new AWS.Route53();

var Route53Helpers = {
  getRecordSet: async function(hostedZoneId, domainName) {
    var params = {
      HostedZoneId: hostedZoneId
    };

    var record;
    console.log("Record: " + record);
    await route53.listResourceRecordSets(params, function(error, result) {
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
module.exports.getDomainInfo = async (event, context, callback) => {
  var params = {
    TableName: "DRActivation-DomainInfo" 
  };

  const result = await dynamoDb.scan(params).promise();

  const hostedZoneIds = [];
  const domainNames = [];
  result.Items.forEach(item => {
    hostedZoneIds.push(item.HostedZoneId);
    domainNames.push(item.Domain);
  });

  var route53Results = [];
  for(var i = 0; i < hostedZoneIds.length; i++) {
    var param = {
      HostedZoneId: hostedZoneIds[i]
    }
    var route53Result = await route53.listResourceRecordSets(param).promise();
    route53Results.push(route53Result);
  }
  
  var route53Records = [];
  result.Items.forEach(item => {
    for (var i = 0; i < route53Results.length; i++) {
      var records = route53Results[i].ResourceRecordSets;
      for(var j =0; j < records.length; j++) {
        var record = records[j];
        var recordName = record.Name.replace("\\052","*").slice(0, -1);
        if(recordName == item.Domain) {
          record.Name = recordName; // set the fixed name.
          route53Records.push(record);
        }
      }
    }
  });

  var newResults = [];
  result.Items.forEach(item => {
    var newResult;
    for(var i = 0; i < route53Records.length; i++) {
      var record = route53Records[i];
      var currentTarget;
      if(record.AliasTarget) {
        currentTarget = record.AliasTarget.DNSName;
      } else {
        currentTarget = record.ResourceRecords[0].Value;
      }
      
      console.log("Current Target: " + currentTarget);

      var newResult = {
        DomainId: item.DomainId,
        DisasterRecoverySetting: item.DisasterRecoverySetting,
        Domain: item.Domain,
        HostedZoneId: item.HostedZoneId,
        ProductionSetting: item.ProductionSetting,
      };

      if(currentTarget == item.ProductionSetting) {
        newResult.CurrentStatus = "Production"
      } else {
        newResult.CurrentStatus = "Disaster Recovery"
      }

      newResults.push(newResult);
      break;
    }
  });

  console.log(JSON.stringify(newResults));

  var response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    "body": JSON.stringify({domainInfo:newResults})
  }
  
  callback(null, response);
};