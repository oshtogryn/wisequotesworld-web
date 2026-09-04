export const NEWSLETTER_POLICY=Object.freeze({
  cadenceDays:14,
  dailySendCap:300,
  maxCycleCapacity:4200,
  digestMinArticles:3,
  digestMaxArticles:6,
  provider:'brevo',
  deliveryEnabled:false,
  senderAddress:'newsletter@wisequotesworld.com',
  subscriberSource:'D1',
  batchAssignment:'dynamic'
});

export function newsletterBatchForPosition(position){
  const n=Math.max(0,Number(position)||0);
  return {
    batchIndex:Math.floor(n/NEWSLETTER_POLICY.dailySendCap),
    positionInBatch:n%NEWSLETTER_POLICY.dailySendCap
  };
}

export function newsletterPolicyReadback(){
  return {...NEWSLETTER_POLICY};
}
