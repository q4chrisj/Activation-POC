. .\ApiFunctions.ps1

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