import { Telegraf } from 'telegraf';
import { PluginsManager } from './plugins/plugins-manager';
import { StatsPlugin } from './plugins/stats.plugin';
import { LinksPlugin } from './plugins/links.plugin';
import { SubscribePlugin } from './plugins/subscribe.plugin';

const token = '6175282363:AAEIMmzSFcrohTqIryNfwYiQzIFL1SDS51c';
const bot = new Telegraf(token);

const pluginsManager = new PluginsManager();

pluginsManager.add(new StatsPlugin(bot));
pluginsManager.add(new LinksPlugin(bot));
pluginsManager.add(new SubscribePlugin(bot));

pluginsManager.register();

bot.launch();
