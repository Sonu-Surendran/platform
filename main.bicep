@description('The location of the resources')
param location string = resourceGroup().location

@description('The name of the App Service Plan')
param appServicePlanName string = 'plan-mic-platform'

@description('The name of the Frontend Web App')
param frontendAppName string = 'app-mic-frontend-${uniqueString(resourceGroup().id)}'

@description('The name of the Backend Web App')
param backendAppName string = 'app-mic-backend-${uniqueString(resourceGroup().id)}'

@description('The name of the PostgreSQL Server')
param postgresName string = 'psql-mic-db-${uniqueString(resourceGroup().id)}'

@description('The admin username for PostgreSQL')
param dbAdminUser string = 'micadmin'

@description('The admin password for PostgreSQL - passed securely')
@secure()
param dbAdminPassword string

@description('The name of the Redis Cache')
param redisName string = 'redis-mic-cache-${uniqueString(resourceGroup().id)}'

// --- App Service Plan (Linux) ---
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// --- PostgreSQL Flexible Server ---
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: postgresName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: dbAdminUser
    administratorLoginPassword: dbAdminPassword
    version: '13'
    storage: {
      storageSizeGB: 32
    }
  }
}

// Firewall Rule to allow Azure Services
resource postgresFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  parent: postgresServer
  name: 'mic_platform_db'
}

// --- Redis Cache ---
resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: redisName
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
  }
}

// --- Backend Web App ---
resource backendApp 'Microsoft.Web/sites@2022-03-01' = {
  name: backendAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${backendAppName}:latest' // Placeholder for image, updated by CI/CD
      appSettings: [
        {
          name: 'DB_HOST'
          value: postgresServer.properties.fullyQualifiedDomainName
        },
        {
          name: 'DB_USER'
          value: dbAdminUser
        },
        {
          name: 'DB_PASSWORD'
          value: dbAdminPassword
        },
        {
          name: 'DB_NAME'
          value: 'mic_platform_db'
        },
        {
          name: 'REDIS_HOST'
          value: redisCache.properties.hostName
        },
        {
          name: 'REDIS_PORT'
          value: string(redisCache.properties.sslPort)
        },
        {
          name: 'REDIS_PASSWORD'
          value: redisCache.listKeys().primaryKey
        }
      ]
    }
  }
}

// --- Frontend Web App ---
resource frontendApp 'Microsoft.Web/sites@2022-03-01' = {
  name: frontendAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${frontendAppName}:latest' // Placeholder
      appSettings: [
        {
          name: 'VITE_API_BASE_URL'
          value: 'https://${backendAppName}.azurewebsites.net'
        }
      ]
    }
  }
}

output frontendUrl string = 'https://${frontendApp.properties.defaultHostName}'
output backendUrl string = 'https://${backendApp.properties.defaultHostName}'
