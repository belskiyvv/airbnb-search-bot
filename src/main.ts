import { Telegraf } from 'telegraf';
import { PluginsManager } from './plugins/plugins-manager';
import { StatsPlugin } from './plugins/stats.plugin';
import { LinksPlugin } from './plugins/links.plugin';
import { SubscribePlugin } from './plugins/subscribe.plugin';
import { config } from './config';

const token = config.BOT_TOKEN;
const bot = new Telegraf(token);

const pluginsManager = new PluginsManager();

pluginsManager.add(new StatsPlugin(bot));
pluginsManager.add(new LinksPlugin(bot));
pluginsManager.add(new SubscribePlugin(bot));

pluginsManager.register();

bot.launch();
