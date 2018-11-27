'use strict';
// listResourceRecordSets
// changeResourceRecordSets
// https://irvinlim.com/blog/async-await-on-aws-lambda/ <- LIFE SAVER

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const route53 = new AWS.Route53();

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

module.exports.toggleDomain = async (event, context, callback) => {
  console.log(JSON.parse(event.body).HostedZoneId);
  const body = JSON.parse(event.body);
  const params = {
    HostedZoneId: body.HostedZoneId
  };

  var route53Result = await route53.listResourceRecordSets(params).promise();

  console.log(route53Result.ResourceRecordSets);


  var response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    "body": JSON.stringify({message:"Great Job!" + body.Domain})
  }
  
  callback(null, response);
};