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
    occasion: 'Underground night',
    text: "Ordered on Wednesday, got it by Saturday. The hardware is actually metal, doesn't look like a printed graphic. Wore it to a warehouse night in Chandigarh. Three people asked where I got it.",
    rating: 5,
    daysAgo: 12,
  },
  {
    name: 'Sneha Iyer',
    city: 'Bengaluru',
    size: 'S',
    occasion: 'Club night',
    text: "Fit is true to size for me (I'm usually S in Zara). The lacing takes a minute to get right the first time, but once it's set it holds. Wore it to Toit for a friend's birthday.",
    rating: 5,
    daysAgo: 18,
  },
  {
    name: 'Priya Nair',
    city: 'Kochi',
    size: 'M',
    occasion: 'House party',
    text: "Bought this after seeing it tagged by a few pages I follow. Was expecting to be disappointed. But no. Construction is solid, and the top layers well under an oversized jacket. Only complaint - delivery took 6 days to Kochi.",
    rating: 4,
    daysAgo: 22,
  },
  {
    name: 'Riya Bhardwaj',
    city: 'Mumbai',
    size: 'L',
    occasion: 'Concert',
    text: "Wore it to a gig in Bandra. Boning held up through three hours of standing and moving around. Waistband didn't dig in. Two people asked me for the brand.",
    rating: 5,
    daysAgo: 8,
  },
  {
    name: 'Meher Kapoor',
    city: 'Delhi',
    size: 'S',
    occasion: 'Metro ride, daily wear',
    text: "The mesh layer is denser than I expected from photos, doesn't go see-through when it stretches. Paired with black jeans and boots for a normal day out and it still read intentional.",
    rating: 5,
    daysAgo: 5,
  },
  {
    name: 'Ishani Reddy',
    city: 'Hyderabad',
    size: 'M',
    occasion: 'Tattoo studio visit',
    text: "Ordered on a Tuesday, wanted it for Saturday. Reached Wednesday afternoon. Packed properly. Fit was accurate. Only wish they sold the chain belt separately too.",
    rating: 5,
    daysAgo: 30,
  },
  {
    name: 'Tanvi Shah',
    city: 'Ahmedabad',
    size: 'L',
    occasion: 'Night out',
    text: "Was between M and L, went with L based on the size chart. Right call - the boning doesn't give, so size for your actual measurements, not what you wish they were. Hardware is real weight, not hollow.",
    rating: 5,
    daysAgo: 40,
  },
  {
    name: 'Sara Menon',
    city: 'Pune',
    size: 'S',
    occasion: "College fest",
    text: "Delivery was 4 days to Pune. Construction feels like it costs more than it did - proper D-rings, not the cheap kind that bends. Slight variation from the listing photo but they're upfront that hardware finish can vary a little.",
    rating: 5,
    daysAgo: 45,
  },
  {
    name: 'Nikita Joshi',
    city: 'Jaipur',
    size: 'M',
    occasion: 'Birthday night out',
    text: "Bought for my sister's birthday. She loved it. Fit her fine (she's M in H&M). Only note - the mesh needs careful unpacking, snags easily if you're rough with the tags.",
    rating: 4,
    daysAgo: 15,
  },
  {
    name: 'Ishita Deshmukh',
    city: 'Nagpur',
    size: 'XL',
    occasion: 'Rooftop party',
    text: "XL fits me well, I'm usually between L and XL. The corset actually shapes instead of just sitting there. Paid the extra for prepaid, worth it for the discount.",
    rating: 5,
    daysAgo: 25,
  },
  {
    name: 'Diya Krishnan',
    city: 'Chennai',
    size: 'S',
    occasion: 'Cocktail night',
    text: "Chennai humidity is rough on anything structured. This held up okay for a 3-hour event, hardware didn't tarnish or go sticky. Looks better under warm light than in flash photos.",
    rating: 4,
    daysAgo: 20,
  },
  {
    name: 'Zara Ahmed',
    city: 'Lucknow',
    size: 'M',
    occasion: 'Underground gig',
    text: "Wore it to a small gig with a jacket over it. My friends said it looked expensive. That's the review.",
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




