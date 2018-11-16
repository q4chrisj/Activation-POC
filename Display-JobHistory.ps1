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

function GetActiveJob {
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

function GetCompletedJobs {
    $AttributeDetails= [pscustomobject]@{
        "S" = "COMPLETED"
    }
    $AttributeValues = [pscustomobject]@{
        ":jobstate" = $AttributeDetails
    }
    
    $AttributeValues = $AttributeValues | ConvertTo-Json -Compress
    
    $CompletedJobs = ScanTable -TableName "DRActivation-Job" -Filter "JobState = :jobstate" -AttributeValues $AttributeValues

    $CompletedJobs = $CompletedJobs | ConvertFrom-Json 

    $CompletedJobs.Items | ForEach {
        $_.Date = $_.Date.S
        $_.JobState = $_.JobState.S
        $_.JobId = $_.JobId.S
        $_.JobName = $_.JobName.S
    }

    return $CompletedJobs
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

$CurrentJob = GetActiveJob

if($CurrentJob.Items.Count -gt 0) {
    $CurrentJobId = $CurrentJob.Items.JobId.S
    Clear-Host
    do {
        Write-Host "`nCurrent DR Activation Status`n"
        $JobHistory = GetJobHistory -JobId $CurrentJobId
        foreach ($Item in $JobHistory.Items | Sort-Object -Property Date) {
            if ($Item.Completed -eq "False") {
                Write-Host "`t$($Item.StepName) started at $($Item.Date)"
            } else {
                Write-Host "`t$($Item.StepName) completed at $($Item.Date)`n"
            }
        }

        $CurrentJob = GetActiveJob
        Start-Sleep 20

        Clear-Host
    } until ($CurrentJob.Count -eq 0)

    Write-Host "DR activation complete.`n"
} else {
    Write-Host "DR is not being activated at this time.`n"
}

Write-Host "Completed Jobs"
$CompletedJobs = GetCompletedJobs
$CompletedJobs.Items | Sort-Object -Property Date | Select-Object Date, JobName, JobState