function CreateStringDataObject {
    param(
        [string] $Value
    )

    $StringObject = [pscustomobject]@{
        "S" = $Value
    }

    return $StringObject
}

function CreateActivationJob {
    $ActivationJob = [pscustomobject]@{
        JobId = CreateStringDataObject -Value ([guid]::NewGuid().ToString())
        JobName = CreateStringDataObject -Value "DR Activation"
        JobState = CreateStringDataObject -Value "STARTED"
        Date = CreateStringDataObject -Value $(Get-Date).ToString()
    }

    return $ActivationJob
}

function CreateJobHistory {
    param(
        [string] $JobId,
        [string] $StepName,
        [string] $Date,
        [string] $Completed
    )

    $JobHistory = [pscustomobject]@{
        JobHistoryId = CreateStringDataObject -Value $([guid]::NewGuid().ToString())
        JobId = CreateStringDataObject -Value $JobId
        StepName = CreateStringDataObject -Value $StepName
        Date = CreateStringDataObject -Value $Date
        Completed = CreateStringDataObject -Value $Completed
    }

    return $JobHistory
}

function PutItem {
    param(
        [string] $TableName,
        [string] $Payload
    )

    $Payload = $Payload.Replace('"', '\"') # AWS cli requires this
    $cmd = "aws dynamodb put-item --table-name $TableName --item '$Payload' --profile dr-admin --region us-west-1"

    Invoke-Expression $cmd
}

Write-Host "Starting DR Activation Job"
$Job = CreateActivationJob
$JobData = $Job | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-Job" -Payload $JobData

Start-Sleep 30

Write-Host "Starting Primary Instance Activation"
$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Primary Instance Activation" -Date $(Get-Date) -Completed "False"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Start-Sleep 60

$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Primary Instance Activation" -Date $(Get-Date) -Completed "True"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Write-Host "Starting Database Restore"
$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Database Restore" -Date $(Get-Date) -Completed "False"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Start-Sleep 10

$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Database Restore" -Date $(Get-Date) -Completed "True"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Write-Host "Starting client files restore"
$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Clientfiles Restore" -Date $(Get-Date) -Completed "False"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Start-Sleep 30

$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Clientfiles Restore" -Date $(Get-Date) -Completed "True"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Write-Host "Starting Secondary Instance Activation"
$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Secondary Instance Activation" -Date $(Get-Date) -Completed "False"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Start-Sleep 30

$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Secondary Instance Activation" -Date $(Get-Date) -Completed "True"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Write-Host "Starting Enable Live Mode"
$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Enable Live Mode" -Date $(Get-Date) -Completed "False"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData

Start-Sleep 30

$JobHistory = CreateJobHistory -JobId $Job.JobId.S -StepName "Enable Live Mode" -Date $(Get-Date) -Completed "True"
$JobHistoryData = $JobHistory | ConvertTo-Json -Compress
PutItem -TableName "DRActivation-JobHistory" -Payload $JobHistoryData
