window.Flickr = {
  configure: configureFlickr,
  fetchPhotos: fetchFlickrPhotos,
};

let apiKey = '';
let baseUrl = '';
let usedIndices = [];
let carouselPhotos = [];

function configureFlickr(options) {
  apiKey = options.apiKey;
  baseUrl = options.baseUrl || baseUrl;
}

function fetchFlickrPhotos(params, callback) {
  if (!apiKey) {
    return;
  }
  const query = new URLSearchParams({
    method: 'flickr.photos.search',
    api_key: apiKey,
    format: 'json',
    ...params,
  }).toString();
  const script = document.createElement('script');
  script.src = `${baseUrl}?${query}`;
  script.onload = () => {
    if (callback) {
      callback();
    }
  };
  document.body.appendChild(script);
}

function jsonFlickrApi(json) {
  carouselPhotos = json;
}

function getRandomPhoto(resolution) {
  if (!carouselPhotos || !carouselPhotos.photos || !carouselPhotos.photos.photo) {
    return '';
  }
  const photosArray = carouselPhotos.photos.photo;
  if (usedIndices.length === photosArray.length) {
    usedIndices = [];
  }
  let index;
  do {
    index = Math.floor(Math.random() * photosArray.length);
  } while (usedIndices.includes(index));
  usedIndices.push(index);
  const photo = photosArray[index];
  return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_${resolution}.jpg`;
}
