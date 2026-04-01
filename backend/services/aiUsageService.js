const AiUsage = require("../models/AiUsage");

const DAILY_LIMIT = 10;

const checkAndUpdateAiUsage = async (userId) => {
  let usage = await AiUsage.findOne({ user: userId });

  const now = new Date();

  // 🟢 First time user
  if (!usage) {
    usage = await AiUsage.create({
      user: userId,
      count: 1,
      lastReset: now
    });

    return {
      allowed: true,
      remaining: DAILY_LIMIT - 1,
      used: 1
    };
  }

  // 🔄 Fixed Daily Reset at 5:30 AM IST

  // Create today's 5:30 AM time
  const resetTime = new Date();
  resetTime.setHours(5, 30, 0, 0);

  // If current time is before 5:30 AM,
  // we consider yesterday's 5:30 AM as reset boundary
  if (now < resetTime) {
    resetTime.setDate(resetTime.getDate() - 1);
  }

  // If last reset happened before today's reset boundary → reset
  if (usage.lastReset < resetTime) {
    usage.count = 1;
    usage.lastReset = now;
    await usage.save();

    return {
      allowed: true,
      remaining: DAILY_LIMIT - 1,
      used: 1
    };
  }

  // ❌ Limit reached
  if (usage.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      used: usage.count
    };
  }

  // ➕ Increment usage
  usage.count += 1;
  await usage.save();

  return {
    allowed: true,
    remaining: DAILY_LIMIT - usage.count,
    used: usage.count
  };
};

module.exports = { checkAndUpdateAiUsage };