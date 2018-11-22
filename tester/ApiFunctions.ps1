$ApiBaseUrl = "https://jarmnj5kh6.execute-api.us-west-1.amazonaws.com/dev"

function CreateActivationJob {
    $Job = @{
        JobState = "STARTED"
    } | ConvertTo-Json
 
    $Request = Invoke-WebRequest -Method Post -Uri "$ApiBaseUrl/jobs" -Body $Job

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

    $Request = Invoke-WebRequest -Method Put -Uri "$ApiBaseUrl/jobs" -Body $CompletedJob

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

    $Request = Invoke-WebRequest -Method Post -Uri "$ApiBaseUrl/jobHistory" -Body $JobHistory

    $Request | ConvertFrom-Json

    return $JobHistory.Content
}