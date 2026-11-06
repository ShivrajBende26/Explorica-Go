const guideIds = [
  '5c8a21d02f8fb814b56fa189',
  '5c8a1f292f8fb814b56fa184'
];

const tours = [
  ['The Kyoto Slow Walk', 'Kyoto, Japan', 'Follow quiet lanes, temple gardens, and neighborhood tea houses with a local host.', 5, 'easy', 890, 12, 4, [135.7681, 35.0116]],
  ['The Atlas Mountain Trail', 'Marrakech, Morocco', 'Cross mountain paths and village markets on a small-group journey through the Atlas foothills.', 6, 'medium', 1190, 10, 1, [-7.9811, 31.6295]],
  ['The Lisbon Coast Escape', 'Lisbon, Portugal', 'Pair old-town discoveries with breezy coastal walks and long lunches by the Atlantic.', 5, 'easy', 980, 14, 2, [-9.1393, 38.7223]],
  ['The Patagonia Explorer', 'El Calafate, Argentina', 'Take in glacier viewpoints, open steppe, and big-sky trails in the far south.', 8, 'difficult', 1890, 10, 3, [-72.2648, -50.3408]],
  ['The Bali Rice Path', 'Ubud, Indonesia', 'Wander rice terraces, riverside paths, and small craft studios at an unhurried pace.', 6, 'easy', 1090, 12, 2, [115.2625, -8.5069]],
  ['The Alpine Lake Trek', 'Lucerne, Switzerland', 'Link clear mountain lakes and gentle high-country trails with a local mountain guide.', 7, 'medium', 1690, 10, 1, [8.3093, 46.8182]],
  ['The Oaxaca Table Tour', 'Oaxaca, Mexico', 'Meet makers and cooks while exploring the markets and flavors of the Oaxaca valley.', 4, 'easy', 790, 10, 7, [-96.7266, 17.0732]],
  ['The Iceland Ring Road', 'Reykjavik, Iceland', 'Travel through waterfalls, black-sand shores, and volcanic landscapes on a scenic loop.', 8, 'medium', 2190, 12, 3, [-21.9426, 64.1466]],
  ['The Cape Town Peninsula', 'Cape Town, South Africa', 'Discover coastal paths, colorful neighborhoods, and mountain views around the peninsula.', 6, 'medium', 1390, 12, 4, [18.4241, -33.9249]],
  ['The Hanoi Food Walk', 'Hanoi, Vietnam', 'Taste family-run street-food favorites and explore the old quarter with a local guide.', 3, 'easy', 590, 8, 6, [105.8342, 21.0278]],
  ['The Dolomites Hideaway', 'Bolzano, Italy', 'Spend your days among limestone peaks, alpine meadows, and welcoming mountain inns.', 7, 'difficult', 1790, 10, 1, [11.3548, 46.4983]],
  ['The Scottish Isles Route', 'Isle of Skye, Scotland', 'Explore sea cliffs, island villages, and windswept paths on a small-group island escape.', 6, 'medium', 1490, 10, 5, [-6.2, 57.2736]],
  ['The Jordan Desert Nights', 'Wadi Rum, Jordan', 'Trace sandstone canyons and spend a night beneath a wide desert sky with Bedouin hosts.', 5, 'medium', 1290, 10, 8, [35.4194, 29.5321]],
  ['The Kerala Backwaters', 'Alleppey, India', 'Slow down on palm-lined waterways and discover small villages along Kerala’s backwaters.', 5, 'easy', 990, 12, 2, [76.3388, 9.4981]],
  ['The Peru Sacred Valley', 'Cusco, Peru', 'Visit highland communities, lively markets, and ancient valley paths with time to acclimatize.', 7, 'difficult', 1690, 10, 3, [-71.9675, -13.5319]],
  ['The Hokkaido Snow Trail', 'Sapporo, Japan', 'Enjoy forest snow walks, warm springs, and winter food in Japan’s northern island.', 6, 'medium', 1590, 10, 9, [141.3545, 43.0618]],
  ['The Vancouver Island Way', 'Victoria, Canada', 'Combine rainforest paths, quiet coves, and welcoming harbor towns on the Pacific edge.', 6, 'easy', 1290, 12, 1, [-123.3656, 48.4284]],
  ['The Andalusian Courtyards', 'Seville, Spain', 'Find tiled courtyards, orange-scented lanes, and hilltop villages across southern Spain.', 5, 'easy', 1190, 12, 7, [-5.9845, 37.3891]],
  ['The Galapagos Discovery', 'Puerto Ayora, Ecuador', 'Explore island trails and coastlines on a nature-focused small-group journey.', 8, 'medium', 2490, 10, 6, [-90.315, -0.7402]],
  ['The New Zealand Fjords', 'Queenstown, New Zealand', 'Travel through alpine valleys and quiet lake shores on a scenic South Island escape.', 7, 'difficult', 2290, 10, 3, [168.6626, -45.0312]],
  ['The Marrakech Medina', 'Marrakech, Morocco', 'Get to know the medina through its artisan lanes, gardens, and neighborhood cafés.', 4, 'easy', 850, 10, 4, [-7.9811, 31.6295]]
];

const nextDate = monthOffset => {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + monthOffset);
  date.setUTCHours(9, 0, 0, 0);
  return date;
};

module.exports = tours.map(
  ([name, city, summary, duration, difficulty, price, maxGroupSize, image, coordinates], index) => {
    const cover = `tour-${image}-cover.jpg`;
    const images = [1, 2, 3].map(number => `tour-${image}-${number}.jpg`);
    const startLocation = {
      type: 'Point',
      coordinates,
      description: city,
      address: `Meeting point details shared after booking, ${city}`
    };

    return {
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      duration,
      maxGroupSize,
      difficulty,
      ratingsAverage: 4.5 + (index % 5) / 10,
      ratingsQuantity: 8 + (index % 23),
      price,
      summary,
      description: `${summary} The itinerary leaves space to take in the surroundings, meet local hosts, and enjoy the journey without rushing. Group sizes stay small, and your guide will share practical details before departure.`,
      imageCover: cover,
      images,
      startDates: [nextDate(1 + (index % 8))],
      guides: guideIds,
      startLocation,
      locations: [
        {
          type: 'Point',
          coordinates,
          description: `${city} welcome point`,
          address: startLocation.address,
          day: 1
        }
      ]
    };
  }
);
