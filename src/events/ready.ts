import {
  Client,
  MessageActionRow,
  MessageButton,
  TextChannel,
} from "discord.js";
import { Event } from "../typings";
import r from "../handlers/commandHandler";
import getApps from "../utils/appLoad";
import getCmds from "../utils/cmdLoad";
import db from "../db/init";

let ShowStats = new MessageButton()
  .setLabel("📊 | Статистика")
  .setStyle("PRIMARY")
  .setCustomId("suggestion.stats");

export let event: Event = {
  name: "ready",
  run: async (client: Client) => {
    client.guilds.cache.forEach((g) => {
      db.query(
        `INSERT IGNORE INTO guildconfig(guildID, disabledCMDS) VALUES('${g.id}', '[]')`
      );
      db.promise()
        .query(`SELECT * FROM guildconfig WHERE guildID = '${g.id}'`)
        .then((r: any) => {
          let data = r[0][0];
          if (data.suggestionTimeActive == 0) return;
          db.promise()
            .query(
              `SELECT * FROM suggestions WHERE guildID='${g.id}' AND active='yes'`
            )
            .then((u: any) => {
              u[0].forEach(async (s: any) => {
                let timePassed =
                  new Date().getTime() - new Date(s.date).getTime();

                if (timePassed >= data.suggestionTimeActive)
                  doDef(client, data, s);
                else
                  setTimeout(
                    () => doDef(client, data, s),
                    data.suggestionTimeActive - timePassed
                  );
              });
            });
        });
    });
    let apps = await getApps(client);
    let cmds = await getCmds(client);
    setTimeout(() => r(client, (<any>apps).concat(<any>cmds)), 200);
    // Активность бота
    client.user!.setPresence({
      activities: [
        {
          name: "на Пингвина",
          type: "WATCHING",
        },
      ],
      status: "dnd",
    });
  },
};

export let doDef = async (client: any, data: any, s: any) => {
  let userSigned = JSON.parse(s.userSigned);
  let likes = Object.values(userSigned).filter((u) => u == 1).length;
  let dislikes = likes - Object.values(userSigned).length;

  let doneButton = new MessageButton()
    .setLabel(`Время истекло.`)
    .setStyle("PRIMARY")
    .setCustomId("suggestion.done")
    .setDisabled(true);

  let likedButton = new MessageButton()
    .setLabel(`Понравилось ${likes} людям`)
    .setStyle("PRIMARY")
    .setCustomId("suggestion.liked")
    .setDisabled(true);

  let dislikedButton = new MessageButton()
    .setLabel(`Не понравилось ${dislikes} людям`)
    .setStyle("DANGER")
    .setCustomId("suggestion.disliked")
    .setDisabled(true);

  let doneRow = new MessageActionRow().addComponents([
    doneButton,
    likedButton,
    dislikedButton,
    ShowStats,
  ]);

  (<TextChannel>(
    await client.channels.cache.get(data.suggestionChannel)
  ))!.messages
    .fetch(s.messageID)
    .then((m) => {
      m.edit({
        components: [doneRow],
      });
    });

  db.promise().query(
    `UPDATE suggestions SET active='no' WHERE suggestionID = '${s.suggestionID}'`
  );
};
