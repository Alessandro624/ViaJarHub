export enum TravelOrder {
  BY_DESTINATION = 'Destinazione',
  BY_PRICE = 'Prezzo',
  BY_STARS = 'Stelle',
}

const translateMap = {
  'Destinazione': 'BY_DESTINATION',
  'Prezzo': 'BY_PRICE',
  'Stelle': 'BY_STARS'
}

export function translateOrder(order: TravelOrder) {
  return translateMap[order];
}
