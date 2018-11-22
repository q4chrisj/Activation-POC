# Include ApiFunctions.ps1 to communicate with API Gateway
. .\ApiFunctions.ps1

function New-JobHistory {
    param(
        [string] $JobId,
        [string] $StepName,
        [string] $Completed
    )

    if($Completed -eq "False") {
        Write-Host "Starting $StepName" 
    }

    CreateJobHistory -JobId $JobId -StepName $StepName -Completed $Completed | Out-Null
}

$Steps = 
    "Reset Activation Parameters",
    "Start Instances - Batch 1",
    "Download Databases",
    "Start Instances - Batch 2",
    "Restore Master Database",
    "Restore Global Databases",
    "Create Active Directory Users",
    "Restore Client Databases - Batch 1",
    "Restore Client Databases - Batch 2",
    "Restore Client Databases - Batch 3",
    "Start Instances - Batch 3",
    "Enable Live Mode"

Write-Host "Starting DR Activation Job"
$Job = CreateActivationJob

foreach($Step in $Steps) {
    New-JobHistory -JobId $Job.JobId -StepName $Step -Completed "False"

    Start-Sleep 60
    
    New-JobHistory -JobId $Job.JobId -StepName $Step -Completed "True"

    Start-sleep 10
}

Write-Host "`nDR activation complete."
$CompletedJob = CompleteActiveJob -CurrentJob $Job