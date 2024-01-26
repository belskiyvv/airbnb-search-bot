import puppeteer, { Browser, ElementHandle, NodeFor, Page } from 'puppeteer';
import { config } from '../config';
import { ListingDetails } from '../models/listing-details.interface';

const statsSelector = '.to8eev7.dir.dir-ltr';
const listingCardSelector = 'div[data-testid="card-container"]';
const listingNameSelector = 'span[data-testid="listing-card-name"]';
const pagesSelector = '.p1j2gy66 a[href]';

export class AirbnbService {
  browser: Browser;
  page: Page;

  getLink() {
    return 'https://ru.airbnb.com/s/Porto--Portugal/homes?' +
      'refinement_paths%5B%5D=%2Fhomes&' +
      `checkin=${config.CHECKIN}&` +
      `checkout=${config.CHECKOUT}&` +
      'date_picker_type=calendar&' +
      `adults=${config.ADULTS}&` +
      'search_type=user_map_move&' +
      'tab_id=home_tab&' +
      'query=Porto%2C%20Portugal&' +
      'place_id=ChIJwVPhxKtlJA0RvBSxQFbZSKY&f' +
      'lexible_trip_lengths%5B%5D=one_week&' +
      'price_filter_input_type=0&' +
      'price_filter_num_nights=7&' +
      'channel=EXPLORE&' +
      `room_types%5B%5D=${config.ROOM_TYPE}&` +
      `price_min=${config.PRICE_MIN}&` +
      `price_max=${config.PRICE_MAX}&` +
      'ne_lat=41.27535070924899&' +
      'ne_lng=-8.478279470202153&' +
      'sw_lat=41.09352896016996&' +
      'sw_lng=-8.725812991178714&' +
      'zoom=11.577921260194934&' +
      'zoom_level=11.577921260194934&' +
      'search_by_map=true';
  }

  private async launch() {
    if (this.page) {
      await this.page.close();
    }

    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: config.HEADLESS });
    }

    this.page = await this.browser.newPage();
    await this.page.goto(this.getLink());
    await this.page.waitForSelector(listingCardSelector);
  }

  async getStats() {
    await this.launch();
    const statsElement = await this.page.waitForSelector(statsSelector);
    const stats = await statsElement.evaluate(({ textContent }) => textContent);
    this.browser.close();
    return stats;
  }

  private async getListingDetails(listingElement: ElementHandle): Promise<ListingDetails> {
    const [listingNameElement, listingLinkElement] = await Promise.all([
      listingElement.$(listingNameSelector),
      listingElement.$('a'),
    ]);


    const [name, price, link] = await Promise.all([
      listingNameElement.evaluate((el) => el.textContent),
      listingElement.evaluate((el) =>
          (
            el.textContent.match(/\s€\s\d+\s\d*/)?.[0] || el.textContent.match(/€\s\d+\s\d*/)[0]
          ).replace(/\s/g, '')
      ),
      listingLinkElement.evaluate((el) => el.href),
    ]);

    return { name, price, link };
  }

  private async getOnePageListingsDetails() {
    await this.page.waitForSelector(listingCardSelector);
    const listingsElements = await this.page.$$(listingCardSelector);
    return Promise.all(
      listingsElements.map((listing) => this.getListingDetails(listing)),
    );
  }

  private async getPages(): Promise<ElementHandle[]> {
    await this.page.waitForSelector(pagesSelector, { timeout: config.WAIT_FOR_PAGES_TIMEOUT }).catch(() => true);
    const allPages = await this.page.$$(pagesSelector).catch(() => []);
    allPages.shift(); //remove last item because this is > - next page button
    return allPages;
  }

  async getAllListingsDetails(): Promise<ListingDetails[]> {
    await this.launch();
    const pages = await this.getPages();
    const allListingsDetails = [];

    allListingsDetails.push(...await this.getOnePageListingsDetails());

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex+=1) {
      const page = (await this.getPages())[pageIndex];
      await page.click();
      allListingsDetails.push(...await this.getOnePageListingsDetails());
    }

    this.browser.close();
    return allListingsDetails;
  }
}
