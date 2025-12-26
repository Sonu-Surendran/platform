# Azure Deployment Helper Script

param(
    [string]$ResourceGroupName = "rg-mic-platform",
    [string]$Location = "eastus",
    [string]$DbPassword
)

if (-not $DbPassword) {
    Write-Error "Please provide a database password via the -DbPassword parameter."
    exit 1
}

# 1. Create Resource Group if not exists
Write-Host "Creating Resource Group '$ResourceGroupName' in '$Location'..."
az group create --name $ResourceGroupName --location $Location

# 2. Deploy Bicep Template
Write-Host "Deploying Bicep Template..."
az deployment group create `
  --resource-group $ResourceGroupName `
  --template-file main.bicep `
  --parameters dbAdminPassword=$DbPassword

Write-Host "Deployment Completed."
