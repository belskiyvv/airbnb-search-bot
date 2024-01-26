import puppeteer, { Browser, ElementHandle, NodeFor, Page } from 'puppeteer';
import { config } from '../config';
import { ListingDetails } from '../models/listing-details.interface';

const statsSelector = '.to8eev7.dir.dir-ltr';
const listingCardSelector = 'div[data-testid="card-container"]';
const listingNameSelector = 'span[data-testid="listing-card-name"]';
const pagesSelector = '.p1j2gy66 a.l1j9v1wn';

export class AirbnbService {
  PRICE_MIN = 0;
  PRICE_MAX = 100;
  CHECKIN = '2023-04-02';
  CHECKOUT = '2023-04-09';
  ADULTS = 1;
  ROOM_TYPE = 'Entire%20home%2Fapt';

  browser: Browser;
  page: Page;

  getLink() {
    return 'https://ru.airbnb.com/s/Porto--Portugal/homes?' +
      'refinement_paths%5B%5D=%2Fhomes&' +
      `checkin=${this.CHECKIN}&` +
      `checkout=${this.CHECKOUT}&` +
      'date_picker_type=calendar&' +
      `adults=${this.ADULTS}&` +
      'search_type=user_map_move&' +
      'tab_id=home_tab&' +
      'query=Porto%2C%20Portugal&' +
      'place_id=ChIJwVPhxKtlJA0RvBSxQFbZSKY&f' +
      'lexible_trip_lengths%5B%5D=one_week&' +
      'price_filter_input_type=0&' +
      'price_filter_num_nights=7&' +
      'channel=EXPLORE&' +
      `room_types%5B%5D=${this.ROOM_TYPE}&` +
      `price_min=${this.PRICE_MIN}&` +
      `price_max=${this.PRICE_MAX}&` +
      'ne_lat=41.2144518643132&' +
      'ne_lng=-8.435299214999048&' +
      'sw_lat=40.930159741908476&' +
      'sw_lng=-8.8047917374399&' +
      'zoom=11&' +
      'zoom_level=11&' +
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
        el.textContent.match(/\s€\s\d+\s/)?.[0] ||
        el.textContent.match(/€\s\d+\s/)[0]
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
    for (const page of pages) {
      await page.click();
      allListingsDetails.push(...await this.getOnePageListingsDetails());
    }

    this.browser.close();
    return allListingsDetails;
  }
}
