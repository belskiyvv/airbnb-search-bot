import { Context, NarrowedContext, Telegraf } from 'telegraf';
import { Plugin } from './plugin.abstract';
import { AirbnbService } from '../services/airbnb.service';
import { ListingDetails } from '../models/listing-details.interface';
import { config } from '../config';

export class ListingsPlugin extends Plugin {
  static pluginName = 'listings';

  constructor(
    private bot: Telegraf,
  ) {
    super();
  }

  register() {
    this.bot.command(ListingsPlugin.pluginName, (context) =>
      this.execute(context as any),
    );
  }

  listingDetailsToLink(listing: ListingDetails): string {
    return `<a href="${listing.link}">${listing.name} ${listing.price}</a>`;
  }

  async execute(context: NarrowedContext<Context, any>) {
    const airbnb = new AirbnbService();
    let listings = (await airbnb.getAllListingsDetails())
      .sort((listing1, listing2) =>
        +listing1.price.match(/\d+/)[0] - +listing2.price.match(/\d+/)[0],
      )
      .map((listing) => this.listingDetailsToLink(listing));
    const maxCountPerMessage = config.MAX_LISTINGS_PER_MESSAGE;

    for (var i = 0; i < Math.ceil(listings.length / maxCountPerMessage); i++) {
      const message = listings
        .slice(i * maxCountPerMessage, (i + 1) * maxCountPerMessage)
        .concat('<a href="">_</a>')
        .join('\n');

      await context.reply(message, { parse_mode: 'HTML' });
    }
  }
}
