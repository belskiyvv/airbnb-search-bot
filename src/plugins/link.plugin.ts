import { Context, NarrowedContext, Telegraf } from 'telegraf';
import { Plugin } from './plugin.abstract';
import { AirbnbService } from '../services/airbnb.service';

export class LinkPlugin extends Plugin {
  static pluginName = 'link';

  constructor(
    private bot: Telegraf,
  ) {
    super();
  }

  register() {
    this.bot.command(LinkPlugin.pluginName, (context) =>
      this.execute(context as any),
    );
  }

  async execute(context: NarrowedContext<Context, any>) {
    const link = new AirbnbService().getLink();
    await context.reply(link);
  }
}
