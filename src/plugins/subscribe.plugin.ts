import { Context, NarrowedContext, Telegraf } from 'telegraf';
import { Plugin } from './plugin.abstract';
import { ListingDetails } from '../models/listing-details.interface';
import { AirbnbService } from '../services/airbnb.service';
import { listingComparator } from '../utils/listing-comparator';
import { config } from '../config';

export class SubscribePlugin extends Plugin {
  static pluginName = 'subscribe';

  private previousListings: ListingDetails[] = null;

  private subscribedChatIds: string[] = [];

  constructor(
    private bot: Telegraf,
  ) {
    super();
  }

  register() {
    this.bot.command(SubscribePlugin.pluginName, (context) =>
      this.execute(context as any),
    );
    setInterval(() => this.sendNews(), config.CHECK_INTERVAL);
  }

  async sendNews() {
    if (!this.subscribedChatIds.length) {
      return;
    }

    const airbnb = new AirbnbService();
    const listings = await airbnb.getAllListingsDetails();

    if (!this.previousListings) {
      this.previousListings = listings;
      return;
    }

    const appeared = listings.filter((newListing) =>
      !this.previousListings.find((prevListing) => listingComparator(prevListing, newListing)),
    );

    const disappeared = this.previousListings.filter((prevListing) =>
      !listings.find((newListing) => listingComparator(prevListing, newListing))
    );

    if(!appeared.length && !disappeared.length) {
      return;
    }

    const message = appeared
      .concat(disappeared)
      .sort((listing1, listing2) => listing1.name.localeCompare(listing2.name))
      .map((listing) => {
        if (disappeared.includes(listing)) {
          return `<a href="${listing.link}"><s>${listing.name} ${listing.price}</s></a>`;
        }
        return `<a href="${listing.link}">${listing.name} ${listing.price}</a>`;
      })
      .concat('<a href="">_</a>')
      .join('\n');

    this.subscribedChatIds.forEach((chatId) =>
      this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' }),
    );
  }

  async execute(context: NarrowedContext<Context, any>) {
    this.subscribedChatIds.push(context.message.chat.id);
    await context.reply('Subscribed!');
  }
}
