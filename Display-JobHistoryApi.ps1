function GetJobs {
    $Results = Invoke-WebRequest -Uri "https://r4gl9l7eyb.execute-api.us-west-1.amazonaws.com/dev/jobs"

    $Results = $Results | ConvertFrom-Json

    return $Results.jobs
}

$Jobs = GetJobs

$Jobs | Sort-Object -Property Date | Select-Object Date, JobName, JobState
