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
  const body = JSON.parse(event.body);
  const params = {
    HostedZoneId: body.HostedZoneId
  };

  console.log(body);

  var route53Results = await route53.listResourceRecordSets(params).promise();
  var route53Record;
  for (var i = 0; i < route53Results.ResourceRecordSets.length; i++) {
    route53Record = route53Results.ResourceRecordSets[i];
    var record = route53Results.ResourceRecordSets[i].ResourceRecords[0].Value;
    var recordName = record.includes("*") ? record.replace("\\052","*").slice(0, -1) : record;
    console.log(recordName + "==" + body.Domain);
    if(recordName == body.Domain) {
      currentDNSName = record;
      break;
    }
  }

  
  // determine which domain setting to switch too
  var newDNSName;
  if(body.CurrentStatus == "Production") {
    newDNSName = body.DisasterRecoverySetting;
  } else {
    newDNSName = body.ProductionSetting;
  }

  console.log("New DNS Name: " + newDNSName);

  // create the change batch
  var changeParams = {
    ChangeBatch: {
      Changes: [ ]
    },
    HostedZoneId: ""
  };
  
  var change = {
    Action: "UPSERT",
    ResourceRecordSet: {
      Name: "",
      ResourceRecords: [
        {
          Value: ""
        }
      ],
      TTL: 0,
      Type: ""
    }
  };

  changeParams.HostedZoneId = body.HostedZoneId // take this from the existing record
  change.ResourceRecordSet.Name = route53Record.Name // take this from the existing record (if *, include correct chars)
  change.ResourceRecordSet.ResourceRecords[0].Value = newDNSName // new domain to point to
  change.ResourceRecordSet.TTL = route53Record.TTL // take this from the existing record
  change.ResourceRecordSet.Type = route53Record.Type // take this from the existing record
  changeParams.ChangeBatch.Changes.push(change);

  var changeRequest = await route53.changeResourceRecordSets(changeParams).promise();
  var response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    "body": JSON.stringify({result: changeRequest})
  }
  
  callback(null, response);
};