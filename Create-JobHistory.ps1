$ApiBaseUrl = "https://jarmnj5kh6.execute-api.us-west-1.amazonaws.com"

function CreateActivationJob {
    param(
        [string] $JobState
    )

    $Job = @{
        JobState = "STARTED"
    } | ConvertTo-Json
 
    $Request = Invoke-WebRequest -Method Post -Uri "$ApiBaseUrl/dev/jobs" -Body $Job

    $Request | ConvertFrom-Json

    return $Request.Content
}

function CompleteActiveJob {
    param(
        [object] $CurrentJob
    )

    $CompletedJob = @{
        JobId = $CurrentJob.JobId
        Date = $CurrentJob.Date
        JobName = $CurrentJob.JobName
    } | ConvertTo-Json

    $Request = Invoke-WebRequest -Method Put -Uri "$ApiBaseUrl/dev/jobs" -Body $CompletedJob

    $Request | ConvertFrom-Json

    return $Request.Content
}

function CreateJobHistory {
    param(
        [string] $JobId,
        [string] $StepName,
        [string] $Completed
    )

    $JobHistory = @{
        JobId = $JobId
        StepName = $StepName
        Completed = $Completed
    } | ConvertTo-Json

    $Request = Invoke-WebRequest -Method Post -Uri "$ApiBaseUrl/dev/jobHistory" -Body $JobHistory

    $Request | ConvertFrom-Json

    return $JobHistory.Content
}

Write-Host "Starting DR Activation Job"
$Job = CreateActivationJob

Write-Host "Starting Primary Instance Activation"
$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Primary Instance Activation" -Completed "False"

Start-Sleep 60

$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Primary Instance Activation" -Completed "True"

Write-Host "Starting Database Restore"
$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Database Restore" -Completed "False"

Start-Sleep 60

$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Database Restore" -Completed "True"

Write-Host "Starting client files restore"
$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Clientfiles Restore" -Completed "False"

Start-Sleep 60

$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Clientfiles Restore" -Completed "True"

Write-Host "Starting Secondary Instance Activation"
$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Secondary Instance Activation" -Completed "False"

Start-Sleep 60

$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Secondary Instance Activation" -Completed "True"

Write-Host "Starting Enable Live Mode"
$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Enable Live Mode" -Completed "False"

Start-Sleep 60

$JobHistory = CreateJobHistory -JobId $Job.JobId -StepName "Enable Live Mode" -Completed "True"

Start-Sleep 60

Write-Host "`nDR activation complete."
$CompletedJob = CompleteActiveJob -CurrentJob $Job