export type Review = {
  name: string;
  city: string;
  size: string;
  occasion: string;
  text: string;
  rating: 5 | 4;
  daysAgo: number;
};

export const REVIEWS: Review[] = [
  {
    name: 'Ananya Verma',
    city: 'Gurgaon',
    size: 'M',
    occasion: "Cousin\'s roka",
    text: "Ordered on Wednesday, got it by Saturday. The skirt actually has weight, doesn\'t look like a satin bedsheet. Wore it to my cousin\'s roka in Chandigarh. My chachi kept asking where I bought it.",
    rating: 5,
    daysAgo: 12,
  },
  {
    name: 'Sneha Iyer',
    city: 'Bengaluru',
    size: 'S',
    occasion: 'Anniversary dinner',
    text: "Fit is true to size for me (I\'m usually S in Zara). The print is definitely not exactly like the website - mine has more wine, less blush. But actually looks better in person. Wore to Toit for our anniversary.",
    rating: 5,
    daysAgo: 18,
  },
  {
    name: 'Priya Nair',
    city: 'Kochi',
    size: 'M',
    occasion: 'House party',
    text: "Honestly bought this because everyone on my feed was tagging Rose & Co. Was expecting to be disappointed. But no. Fabric is solid, and the top can be worn with just jeans. Only complaint - delivery took 6 days to Kochi.",
    rating: 4,
    daysAgo: 22,
  },
  {
    name: 'Riya Bhardwaj',
    city: 'Mumbai',
    size: 'L',
    occasion: 'Sangeet',
    text: "Wore it to my friend\'s sangeet in Bandra. Skirt is longer than I expected which is a good thing (I\'m 5\'8). Waistband didn\'t poke. Two people asked me for the brand name.",
    rating: 5,
    daysAgo: 8,
  },
  {
    name: 'Meher Kapoor',
    city: 'Delhi',
    size: 'S',
    occasion: 'Brunch at Perch',
    text: "The top is a proper crop, not too short. Paired with white sneakers for brunch and it worked. Skirt has more swish than I expected. Would order in another colour if they release one.",
    rating: 5,
    daysAgo: 5,
  },
  {
    name: 'Ishani Reddy',
    city: 'Hyderabad',
    size: 'M',
    occasion: 'Engagement function',
    text: "Ordered on a Tuesday, wanted for Saturday engagement. Reached Wednesday afternoon. Packed properly, tissue paper and everything. Fit was accurate. Only wish they had matching earrings or something.",
    rating: 5,
    daysAgo: 30,
  },
  {
    name: 'Tanvi Shah',
    city: 'Ahmedabad',
    size: 'L',
    occasion: 'Dinner date',
    text: "Was between M and L, went with L based on the size chart. Right call. The satin doesn\'t stretch so pick the size that fits your hips comfortably. Print is beautiful. Rest is standard.",
    rating: 5,
    daysAgo: 40,
  },
  {
    name: 'Sara Menon',
    city: 'Pune',
    size: 'S',
    occasion: "Colleague\'s farewell",
    text: "Delivery was 4 days to Pune, ok. Fabric feels premium, like the kind you\'d get from AJIO Luxe or something. Print variance is real - mine looks slightly different from the photos but that\'s okay, they warn you.",
    rating: 5,
    daysAgo: 45,
  },
  {
    name: 'Nikita Joshi',
    city: 'Jaipur',
    size: 'M',
    occasion: 'Family function',
    text: "Bought for my sister\'s tilak. She loved it. Fit her fine (she\'s M in H&M). Only note - the skirt needs a good iron the first time you take it out of the packet. Small crease from folding.",
    rating: 4,
    daysAgo: 15,
  },
  {
    name: 'Ishita Deshmukh',
    city: 'Nagpur',
    size: 'XL',
    occasion: 'Birthday dinner',
    text: "XL fits me well, I\'m usually between L and XL. Skirt has an actual A-line, doesn\'t hug the body weirdly around the hips. Paid the extra hundred for prepaid, worth it.",
    rating: 5,
    daysAgo: 25,
  },
  {
    name: 'Diya Krishnan',
    city: 'Chennai',
    size: 'S',
    occasion: 'Cocktail party',
    text: "Chennai humidity is a nightmare for satin. But this held up okay for a 3-hour event. Didn\'t stick to my back or anything. Print is nicer in daylight than in flash photos.",
    rating: 4,
    daysAgo: 20,
  },
  {
    name: 'Zara Ahmed',
    city: 'Lucknow',
    size: 'M',
    occasion: 'Nikaah',
    text: "Wore it to my cousin\'s nikaah with a dupatta over. My mom said it looked expensive. That\'s the review.",
    rating: 5,
    daysAgo: 10,
  },
];

export function daysAgoText(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}
