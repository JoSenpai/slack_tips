const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')

var secrets = new Map()
async function accessSecretVersion (name) {
  if (secrets.hasOwnProperty(name)){
    return secrets[name]
  }

  const client = new SecretManagerServiceClient()
  const projectId = process.env.PROJECT_ID
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/latest`
  })

  // Extract the payload as a string.
  const payload = version.payload.data.toString('utf8')
  secrets[name] = payload

  return payload
}

module.exports = { accessSecretVersion };