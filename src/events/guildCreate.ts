import { Client, Guild } from 'discord.js'
import { Event } from '../typings/'
import db from '../db/init'
import r from '../handlers/commandHandler'
import getApps from '../utils/appLoad'
import getCmds from '../utils/cmdLoad'

export let event: Event = {
    name: 'guildCreate',
    run: async (client: Client, guild: Guild) => {
        db.promise()
            .query(
                `INSERT IGNORE INTO guildconfig(guildID, disabledCMDS) VALUES('${guild.id}', '[]')`
            )
            .then(async () => {
                let apps = await getApps(client)
                let cmds = await getCmds(client)
                setTimeout(() => r(client, (<any>apps).concat(<any>cmds)), 200)
            })
    },
}
