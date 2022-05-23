import { Client } from "discord.js";
import { Event } from "../typings";
import r from "../handlers/commandHandler";
import getApps from "../utils/appLoad";
import getCmds from "../utils/cmdLoad";
import db from "../db/init";

export let event: Event = {
  name: "ready",
  run: async (client: Client) => {
    client.guilds.cache.forEach((g) => {
      db.query(
        `INSERT IGNORE INTO guildconfig(guildID, disabledCMDS) VALUES('${g.id}', '[]')`
      );
    });
    let apps = await getApps(client);
    let cmds = await getCmds(client);
    setTimeout(() => r(client, (<any>apps).concat(<any>cmds)), 200);
  },
};
