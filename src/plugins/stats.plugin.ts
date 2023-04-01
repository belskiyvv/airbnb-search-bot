import { Context, NarrowedContext, Telegraf } from 'telegraf';
import { Plugin } from './plugin.abstract';
import { AirbnbService } from '../services/airbnb.service';

export class StatsPlugin extends Plugin {
  static pluginName = 'stats';

  constructor(
    private bot: Telegraf,
  ) {
    super();
  }

  register() {
    this.bot.command(StatsPlugin.pluginName, (context) =>
      this.execute(context as any),
    );
  }

  async execute(context: NarrowedContext<Context, any>) {
    const airbnb = new AirbnbService();
    const stats = await airbnb.getStats();
    await context.reply(stats);
  }
}
