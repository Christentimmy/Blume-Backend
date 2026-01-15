import dotenv from "dotenv";
dotenv.config();

if (
  !process.env.BLUME1WEEKPRICEID ||
  !process.env.BLUME1MONTHPRICEID ||
  !process.env.BLUME3MONTHPRICEID ||
  !process.env.BLUME1YEARPRICEID ||
  !process.env.BOOST_1_PRICE_ID ||
  !process.env.BOOST_5_PRICE_ID ||
  !process.env.BOOST_10_PRICE_ID 
) {
  throw new Error("Please add the subscription plans to the .env file");
}

export const PLANS = {
  WEEK1: {
    id: "1week",
    name: "1 week",
    billingCycle: "$14.99/week",
    // billingPeriodMonths: 1,
    price: 14.99,
    currency: "USD",
    stripePriceId: process.env.BLUME1WEEKPRICEID.toString(),
    features: [
      "Unlimited Swipes",
      "Unlimited Likes",
      "Rewind last swipe",
      "First look at new members",
      "See who viewed your profile",
      "Super Likes per day: 1",
    ],
    limits: {
      superLikesPerDay: 1,
    },
  },
  MONTH1: {
    id: "1month",
    name: "1 month",
    billingCycle: "$4.99/week",
    // billingPeriodMonths: 6,
    price: 19.99,
    currency: "USD",
    stripePriceId: process.env.BLUME1MONTHPRICEID.toString(),
    features: [
      "Unlimited Swipes",
      "Unlimited Likes",
      "Rewind last swipe",
      "First look at new members",
      "See who viewed your profile",
      "Super Likes per day: 1",
    ],
    limits: {
      superLikesPerDay: 3,
    },
  },
  MONTH3: {
    id: "3months",
    name: "3 months",
    billingCycle: "$3.33/week",
    // billingPeriodMonths: 12,
    price: 39.99,
    currency: "USD",
    stripePriceId: process.env.BLUME3MONTHPRICEID.toString(),
    features: [
      "Unlimited Swipes",
      "Unlimited Likes",
      "Rewind last swipe",
      "First look at new members",
      "See who viewed your profile",
      "Super Likes per day: 1",
    ],
    limits: {
      superLikesPerDay: 5,
      boostsPerMonth: 3,
    },
  },
  YEAR1: {
    id: "1year",
    name: "1 year",
    billingCycle: "$1.53/week",
    // billingPeriodMonths: 12,
    price: 79.99,
    currency: "USD",
    stripePriceId: process.env.BLUME1YEARPRICEID.toString(),
    features: [
      "Unlimited Swipes",
      "Unlimited Likes",
      "Rewind last swipe",
      "First look at new members",
      "See who viewed your profile",
      "Super Likes per day: 1",
    ],
    limits: {
      superLikesPerDay: 5,
    },
  },
} as const;


export const BOOST_PLANS = {
  'boost1': {
    id: 'boost1',
    name: '1',
    price: 4.99,
    currency: 'USD',
    stripePriceId: process.env.BOOST_1_PRICE_ID!,
    duration: 30 * 60 * 1000,
    multiplier: 10
  },
  'boost5': {
    id: 'boost5',
    name: '5',
    price: 7.99,
    currency: 'USD',
    stripePriceId: process.env.BOOST_5_PRICE_ID!,
    duration: 30 * 60 * 1000, 
    multiplier: 50
  },
  'boost10': {
    id: 'boost10',
    name: '10',
    price: 14.99,
    currency: 'USD',
    stripePriceId: process.env.BOOST_10_PRICE_ID!,
    duration: 30 * 60 * 1000, 
    multiplier: 100
  },
} as const;
