import request from 'request-promise'
import { getConfig } from './config'
import { execSync } from 'child_process'

export async function getVHosts() {
  const out = await execSync('apache2ctl -t -D DUMP_VHOSTS')

  const vhosts = []
  const rows = out.split('\n').filter(row => row.match(/^\s.*port/))
  for (let row of rows) {
    let vhost = {}
    let property = null
    for(let value of row.split(' ')) {
      switch (property) {
      case 'port':
        vhost.port = value
        break
      case 'namevhost':
        vhost.name = value
        break
      }
      property = value
    }
    vhosts.push(vhost)
  }
  return vhosts
}

function auth() {
  const { user, pass } = getConfig()

  return user ? { user, pass, sendImmediately: false } : {}
}

export async function checkVHost(name, port) {
  const options = {
    uri: `http://${name}:${port}`,
    auth: auth(),
    resolveWithFullResponse: true
  }
  try {
    const response = await Promise.resolve(request(options))
    return response.statusCode
  } catch (error) {
    return error.statusCode
  }

}
