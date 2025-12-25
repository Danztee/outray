// Subscription plan definitions for Polar
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: {
      maxTunnels: 1,
      maxDomains: 0,
      maxSubdomains: 1,
      maxMembers: 1,
      requestsPerMonth: 1000,
      bandwidthPerMonth: 1024 * 1024 * 100, // 100MB
      retentionDays: 3,
      customDomains: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  ray: {
    name: "Ray",
    price: 7,
    polarProductId: process.env.POLAR_RAY_PRODUCT_ID,
    features: {
      maxTunnels: 3,
      maxDomains: 1,
      maxSubdomains: 5,
      maxMembers: 3,
      requestsPerMonth: 100000,
      bandwidthPerMonth: 1024 * 1024 * 1024 * 10, // 10GB
      retentionDays: 14,
      customDomains: true,
      apiAccess: true,
      prioritySupport: false,
    },
  },
  beam: {
    name: "Beam",
    price: 15,
    polarProductId: process.env.POLAR_BEAM_PRODUCT_ID,
    features: {
      maxTunnels: 10,
      maxDomains: -1, // Unlimited
      maxSubdomains: 10,
      maxMembers: 5,
      requestsPerMonth: 1000000,
      bandwidthPerMonth: 1024 * 1024 * 1024 * 50, // 50GB
      retentionDays: 30,
      customDomains: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
  pulse: {
    name: "Pulse",
    price: 120,
    polarProductId: process.env.POLAR_PULSE_PRODUCT_ID,
    features: {
      maxTunnels: 50,
      maxDomains: -1, // Unlimited
      maxSubdomains: 50,
      maxMembers: -1, // Unlimited
      requestsPerMonth: 10000000,
      bandwidthPerMonth: 1024 * 1024 * 1024 * 1024, // 1TB
      retentionDays: 90,
      customDomains: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export function calculatePlanCost(plan: SubscriptionPlan): number {
  return SUBSCRIPTION_PLANS[plan].price;
}

export function canUseFeature(
  plan: SubscriptionPlan,
  feature: keyof typeof SUBSCRIPTION_PLANS.free.features,
  currentUsage?: number,
): boolean {
  const planFeatures = SUBSCRIPTION_PLANS[plan].features;
  // @ts-ignore
  const limit = planFeatures[feature];

  if (limit === -1) return true; // Unlimited

  if (typeof limit === "number" && currentUsage !== undefined) {
    return currentUsage < limit;
  }

  return !!limit;
}

export function getPlanLimits(plan: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan].features;
}
