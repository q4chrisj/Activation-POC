$ApiBaseUrl = "https://jarmnj5kh6.execute-api.us-west-1.amazonaws.com"

function GetJobs {
    $Results = Invoke-WebRequest -Uri "$ApiBaseUrl/dev/jobs"

    $Results = $Results | ConvertFrom-Json

    return $Results.jobs
}

$Jobs = GetJobs

$Jobs | Sort-Object -Property Date | Select-Object Date, JobName, JobState
