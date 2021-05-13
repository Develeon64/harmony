import { User } from '../../structures/user.ts'
import type { Ready } from '../../types/gateway.ts'
import type { Gateway, GatewayEventHandler } from '../mod.ts'

export const ready: GatewayEventHandler = async (
  gateway: Gateway,
  d: Ready
) => {
  gateway._guildsToBeLoaded = d.guilds.length
  gateway._guildsLoaded = 0
  gateway.client.upSince = new Date()

  if ('application' in d) {
    gateway.client.applicationID = d.application.id
    gateway.client.applicationFlags = d.application.flags
  }

  await gateway.client.users.set(d.user.id, d.user)

  gateway.client.user = new User(gateway.client, d.user)
  gateway.sessionID = d.session_id
  gateway.debug(`Received READY. Session: ${gateway.sessionID}`)

  await gateway.cache.set('session_id', gateway.sessionID)

  for (const guild of d.guilds) {
    await gateway.client.guilds.set(guild.id, guild)
  }

  gateway._checkGuildsLoaded()

  gateway.client.emit('shardReady', gateway.shards?.[0] ?? 0)
}
