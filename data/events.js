const slugify = require('slugify');

const listings = [
  ['Community Tourism Futures Forum', 'Forum', 'Lisbon, Portugal', '2027-01-21', 'A practical forum for people building welcoming, resilient tourism in their communities.', 'tour-4-cover.jpg'],
  ['Responsible Travel Exchange', 'Conference', 'Kyoto, Japan', '2027-02-11', 'Meet destination teams and travel practitioners sharing ideas for more thoughtful journeys.', 'tour-1-cover.jpg'],
  ['World Heritage Storytelling Lab', 'Workshop', 'Cusco, Peru', '2027-03-06', 'A hands-on gathering about sharing place-based stories with care and local perspective.', 'tour-5-cover.jpg'],
  ['Island Destinations Gathering', 'Forum', 'Victoria, Canada', '2027-03-24', 'An exchange of ideas for island communities balancing visitor experiences and everyday life.', 'tour-2-cover.jpg'],
  ['Tourism and Nature Week', 'Festival', 'Cape Town, South Africa', '2027-04-17', 'A week of guided walks, talks, and community activities celebrating nature-positive travel.', 'tour-3-cover.jpg'],
  ['Travel Technology Open Studio', 'Workshop', 'Barcelona, Spain', '2027-05-08', 'Try practical digital tools and meet the teams making trip planning more accessible.', 'tour-7-cover.jpg'],
  ['Mountain Communities Roundtable', 'Conference', 'Bolzano, Italy', '2027-05-27', 'Local hosts and destination planners discuss year-round livelihoods in mountain regions.', 'tour-1-cover.jpg'],
  ['Foodways and Local Culture Fair', 'Festival', 'Oaxaca, Mexico', '2027-06-12', 'A lively programme of market visits, cooking demonstrations, and cultural exchange.', 'tour-7-cover.jpg'],
  ['Youth in Tourism Assembly', 'Conference', 'Hanoi, Vietnam', '2027-07-03', 'A welcoming space for young professionals to share ideas and shape the future of travel.', 'tour-6-cover.jpg'],
  ['Coastal Futures Dialogue', 'Forum', 'Reykjavik, Iceland', '2027-07-22', 'Discuss community-led approaches to caring for coastlines and ocean destinations.', 'tour-2-cover.jpg'],
  ['Accessible Journeys Design Clinic', 'Workshop', 'Melbourne, Australia', '2027-08-14', 'A collaborative clinic for making visitor information and experiences easier to access.', 'tour-4-cover.jpg'],
  ['Creative Cities Travel Week', 'Festival', 'Seoul, South Korea', '2027-09-02', 'Explore how neighborhood culture, design, and local businesses shape a memorable city visit.', 'tour-8-cover.jpg'],
  ['Rural Routes Knowledge Exchange', 'Conference', 'Kerala, India', '2027-09-19', 'Community hosts share lessons from locally led rural tourism projects.', 'tour-5-cover.jpg'],
  ['Climate Action for Destinations', 'Forum', 'Queenstown, New Zealand', '2027-10-07', 'A working forum on practical climate action for destinations and tourism businesses.', 'tour-3-cover.jpg'],
  ['Culture Keepers and Visitors Workshop', 'Workshop', 'Marrakech, Morocco', '2027-10-28', 'A facilitated conversation about respectful visitor experiences and living heritage.', 'tour-9-cover.jpg'],
  ['Small Business Travel Marketplace', 'Fair', 'Bangkok, Thailand', '2027-11-13', 'Meet independent guides, makers, and hospitality teams from across the region.', 'tour-6-cover.jpg'],
  ['Winter Destinations Learning Forum', 'Forum', 'Sapporo, Japan', '2027-12-04', 'Destination teams exchange ideas for safe, inclusive, and lower-impact winter travel.', 'tour-3-cover.jpg'],
  ['Year-End Tourism Ideas Summit', 'Conference', 'New York, USA', '2027-12-16', 'A year-end gathering to share new partnerships, useful research, and ideas worth carrying forward.', 'tour-8-cover.jpg']
];

module.exports = listings.map(
  ([title, category, location, date, summary, image]) => ({
    title,
    slug: slugify(title, { lower: true }),
    category,
    location,
    startDate: new Date(`${date}T09:00:00.000Z`),
    endDate: new Date(`${date}T17:00:00.000Z`),
    summary,
    description: `${summary} This sample programme is designed as a starting point for an event listing. Please confirm the schedule, venue, registration details, and accessibility information with the event organizer before making plans.`,
    image,
    organizer: 'BookTheVibe community calendar',
    isSample: true
  })
);
