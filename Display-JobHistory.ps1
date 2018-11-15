function ScanTable {
    param(
        [string] $TableName,
        [string] $Filter,
        [string] $AttributeValues
    )

    $AttributeValues = $AttributeValues.Replace('"', '\"') # AWS cli requires this
    $cmd = "aws dynamodb scan --table-name $TableName --filter-expression '$Filter' --expression-attribute-values '$AttributeValues' --profile dr-admin --region us-west-1"

    return Invoke-Expression $cmd 
}

function GetJob {
    $AttributeDetails= [pscustomobject]@{
        "S" = "STARTED"
    }
    $AttributeValues = [pscustomobject]@{
        ":jobstate" = $AttributeDetails
    }
    
    $AttributeValues = $AttributeValues | ConvertTo-Json -Compress
    
    $CurrentJob = ScanTable -TableName "DRActivation-Job" -Filter "JobState = :jobstate" -AttributeValues $AttributeValues

    return $CurrentJob | ConvertFrom-Json
}

function GetJobHistory {
    param(
        [string] $JobId
    )
    $AttributeDetails= [pscustomobject]@{
        "S" = $JobId
    }
    $AttributeValues = [pscustomobject]@{
        ":jobid" = $AttributeDetails
    }
    
    $AttributeValues = $AttributeValues | ConvertTo-Json -Compress
    
    $JobHistory = ScanTable -TableName "DRActivation-JobHistory" -Filter "JobId = :jobid" -AttributeValues $AttributeValues
    
    $JobHistory = $JobHistory | ConvertFrom-Json
    
    $JobHistory.Items | ForEach {
        $_.StepName = $_.StepName.S
        $_.Date = $_.Date.S
        $_.JobId = $_.JobId.S
        $_.JobHistoryId = $_.JobHistoryId.S
        $_.Completed = $_.Completed.S
    }

    return $JobHistory
}

$CurrentJob = GetJob
$CurrentJobId = $CurrentJob.Items.JobId.S
$JobHistory = GetJobHistory -JobId $CurrentJobId

Write-Host "Current Job $($CurrentJob.Items.JobName.S) started at $($CurrentJob.Items.Date.S)`n"
foreach ($Item in $JobHistory.Items | Sort-Object -Property Date) {
    if ($Item.Completed -eq "False") {
        Write-Host "`t$($Item.StepName) started at $($Item.Date)"
    } else {
        Write-Host "`t$($Item.StepName) completed at $($Item.Date)`n"
    }
}