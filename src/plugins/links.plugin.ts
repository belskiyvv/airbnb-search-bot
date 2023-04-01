import { Context, NarrowedContext, Telegraf } from 'telegraf';
import { Plugin } from './plugin.abstract';
import { AirbnbService } from '../services/airbnb.service';
import { ListingDetails } from '../models/listing-details.interface';

export class LinksPlugin extends Plugin {
  static pluginName = 'links';

  constructor(
    private bot: Telegraf,
  ) {
    super();
  }

  register() {
    this.bot.command(LinksPlugin.pluginName, (context) =>
      this.execute(context as any),
    );
  }

  listingDetailsToLink(listing: ListingDetails): string {
    return `<a href="${listing.link}">${listing.name} ${listing.price}</a>`;
  }

  async execute(context: NarrowedContext<Context, any>) {
    const airbnb = new AirbnbService();
    const listings = await airbnb.getAllListingsDetails();
    const message = listings
      .map((listing) => this.listingDetailsToLink(listing))
      .concat('<a href="">_</a>')
      .join('\n');

    await context.reply(message, { parse_mode: 'HTML' });
  }
}
