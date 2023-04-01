import { ListingDetails } from '../models/listing-details.interface';

export function listingComparator(listing1: ListingDetails, listing2: ListingDetails): boolean {
  if (listing1.name !== listing2.name) {
    return false;
  }

  if (listing1.price !== listing2.price) {
    return false;
  }

  return true;
}
