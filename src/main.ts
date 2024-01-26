import { Telegraf } from 'telegraf';
import { PluginsManager } from './plugins/plugins-manager';
import { StatsPlugin } from './plugins/stats.plugin';
import { ListingsPlugin } from './plugins/listings.plugin';
import { SubscribePlugin } from './plugins/subscribe.plugin';
import { config } from './config';
import { LinkPlugin } from './plugins/link.plugin';

const token = config.BOT_TOKEN;
const bot = new Telegraf(token);

const pluginsManager = new PluginsManager();

pluginsManager.add(new StatsPlugin(bot));
pluginsManager.add(new ListingsPlugin(bot));
pluginsManager.add(new SubscribePlugin(bot));
pluginsManager.add(new LinkPlugin(bot));

pluginsManager.register();

bot.launch();
