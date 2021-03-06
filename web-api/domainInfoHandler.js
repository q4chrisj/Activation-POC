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

  var result = await dynamoDb.scan(params).promise();
  var newResults = [];

  for(var i = 0; i < result.Items.length; i++) {
    var item = result.Items[i];

    var route53Result = await route53.listResourceRecordSets({ HostedZoneId: item.HostedZoneId }).promise();
    var route53Results = route53Result.ResourceRecordSets;

    for (var j = 0; j < route53Results.length; j++) {

      var record = route53Results[j];
      if(record.Type != "NS" && record.Type != "SOA") {
        var recordName = record.Name.replace("\\052","*").slice(0, -1);

        if(recordName == item.Domain) {
          var currentTarget = record.ResourceRecords[0].Value;

          var newResult = {
            DomainId: item.DomainId,
            DisasterRecoverySetting: item.DisasterRecoverySetting,
            Domain: item.Domain,
            HostedZoneId: item.HostedZoneId,
            ProductionSetting: item.ProductionSetting,
          };

          if(currentTarget == item.ProductionSetting) {
            newResult.CurrentStatus = "Production"
          } else if (currentTarget == item.DisasterRecoverySetting) {
            newResult.CurrentStatus = "Disaster Recovery"
          } else {
            newResult.CurrentStatus = "Unknown";
          }
    
          newResults.push(newResult);
        }
      }
    } 
  }

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

  console.log("Toggling domain for: " + body.Domain);

  var route53Results = await route53.listResourceRecordSets(params).promise();

  var route53Record;

  for (var i = 0; i < route53Results.ResourceRecordSets.length; i++) {
    var item = route53Results.ResourceRecordSets[i];
    var recordName = item.Name.slice(0, -1); // Route53 includes a trailing . in the name field (*.s3.q4web.com.)
    if(recordName.includes("\\052")) {
      recordName = recordName.replace("\\052", "*") // Route53 converts * to \\052 in the name field.
    }

    if(recordName == body.Domain) {
      route53Record = item;
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