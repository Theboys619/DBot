import { Message } from "https://deno.land/x/discordeno@10.3.0/mod.ts";
import { Command } from "../bot/commander.ts";
import RLApi from "../bot/rlapi.ts";

export default class Stats extends Command {
  constructor() {
    super();
  }

  async run(msg: Message, args: string[]) {
    const rl = new RLApi();

    let username = args[0];
    let platform = args[1];
    if (args.length > 2) {
      username = args.splice(0, args.length - 1).join(" ");
      platform = args[0];
    }
    
    const data = await rl.getStats(username, platform).catch(err => msg.channel?.send(err.message));
    if (!data) return;

    const stats = data.data;
    if (!stats || !stats.segments) return; 
    const { platformUserHandle: fulluser, platformUserIdentifier: id, platformSlug } = stats.platformInfo;
    const overview = stats.segments[0].stats;
    const unranked = stats.segments[1].stats;
    const ranked1 = stats.segments[2].stats;
    const ranked2 = stats.segments[3].stats;
    const ranked3 = stats.segments[4].stats;

    const rankName = overview.seasonRewardLevel.metadata.rankName;
    const rankIcon = rl.endpoints.Images[rankName as "Champion"];

    msg.channel?.send({
      embed: {
        title: `${fulluser} RL Stats`,
        type: 'rich',
        description: `Stats for ${fulluser} on ${args[1]}`,
        color: 15576321,
        thumbnail: {
          url: rankIcon
        },
        url: `https://rocketleague.tracker.network/rocket-league/profile/${platform}/${username}/overview`,
        fields: [
          {
            name: "Goals",
            value: overview.goals.displayValue,
            inline: true
          },
          {
            name: "Shots",
            value: overview.shots.displayValue,
            inline: true
          },
          {
            name: "GoalShotRatio",
            value: overview.goalShotRatio.displayValue,
            inline: true
          },
          {
            name: "Saves",
            value: overview.saves.displayValue,
            inline: true
          },
          {
            name: "Wins",
            value: overview.wins.displayValue,
            inline: true
          },
          {
            name: "Score",
            value: overview.score.displayValue,
            inline: true
          }
        ]
      }
    });
  }
};