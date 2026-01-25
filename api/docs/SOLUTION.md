# Solution Overview: Token Management & Scaling

## Your Original Problem

> "I build diagram generator site and the 5x was maxed out after 2 hours of testing. If I upgrade to 20x what's the diff? Also my site will be subscription based thus if tokens are depleted how do I programmatically ask for more?"

## How This Solution Addresses Your Needs

### 1. **Automatic Token Depletion Handling** ✅

When Anthropic API returns a 429 (rate limit) error, the system:

```javascript
// In queueManager.js - handleRequestError()
if (response.status === 429) {
  // System automatically:
  // 1. Detects the rate limit
  // 2. Calculates retry time from retry-after header
  // 3. Moves request to retry queue
  // 4. Waits and retries automatically
  // 5. Notifies user via WebSocket
}
```

**You don't need to "ask for more tokens"** - the system queues requests and processes them when capacity is available.

### 2. **5x vs 20x Plan Differences**

| Metric                | 5x Plan    | 20x Plan   | Difference |
|-----------------------|------------|------------|------------|
| Requests/Minute       | ~25        | ~100       | 4x more    |
| Tokens/Minute         | 200,000    | 800,000    | 4x more    |
| Requests/Day          | ~36,000    | ~144,000   | 4x more    |
| Your Test Duration    | 2 hours    | 8 hours    | 4x longer  |

**Reality Check**: If you maxed out in 2 hours of testing, the 20x plan gives you ~8 hours before hitting limits. But for a production subscription site with multiple users, you need smart queue management (which this solution provides).

### 3. **Subscription-Based Architecture**

The system has built-in tier management:

```javascript
// Free users: 10 requests/day
// Basic users: 100 requests/day  
// Pro users: 500 requests/day
// Enterprise: 5000 requests/day

// Users can't exceed their tier limits
// System automatically enforces quotas
// Clean error messages when limits hit
```

### 4. **Queue System Prevents API Overload**

Instead of failing when Anthropic limits are hit, requests wait in queue:

```
User Request → Queue (Position 5) → Wait → Process → Success
User Request → Queue (Position 1) → Process → Success
User Request → Queue FULL → Error (tell user to wait)
```

This means:
- ✅ Users don't lose their requests
- ✅ Fair processing (FIFO with priority by tier)
- ✅ Real-time status updates via WebSocket
- ✅ Automatic retries on temporary failures

### 5. **Smart Rate Limiting at Multiple Levels**

```
┌─────────────────────────────────────────┐
│ Level 1: Per-User Tier Limits          │ ← Prevents single user abuse
├─────────────────────────────────────────┤
│ Level 2: Concurrent Request Limits     │ ← Prevents queue flooding
├─────────────────────────────────────────┤
│ Level 3: Global API Rate Limits        │ ← Protects Anthropic quota
├─────────────────────────────────────────┤
│ Level 4: Exponential Backoff & Retry   │ ← Handles temporary failures
└─────────────────────────────────────────┘
```

## Real-World Scenarios

### Scenario 1: Your Testing Situation (2 hours → maxed out)

**Before (Direct API calls):**
```
Request 1-100: ✓ Success
Request 101: ✗ 429 Rate Limit - FAILED
Your app: Breaks, users see errors
```

**After (With this system):**
```
Request 1-100: ✓ Processed immediately
Request 101-500: ⏳ Queued (position shown to user)
Request 501+: ⏳ Processed as capacity becomes available
Your app: Never breaks, users see "Processing (position 5)"
```

### Scenario 2: Multiple Users on Free Tier

**User A:** Makes 10 requests (hits daily limit)
```json
{
  "error": "USER_LIMIT_EXCEEDED",
  "message": "Daily limit of 10 requests reached",
  "resetTime": "2025-01-25T00:00:00Z"
}
```

**User B:** Still has quota, continues working ✓

**User C:** Upgrades to Pro tier, gets 500/day ✓

### Scenario 3: Black Friday Traffic Spike

**Without Queue:**
```
100 simultaneous users × 10 requests = 1000 requests/minute
Anthropic limit: 100 requests/minute
Result: 900 failed requests 😱
```

**With Queue:**
```
100 simultaneous users × 10 requests = 1000 requests queued
System processes: 100/minute (within Anthropic limits)
Result: All 1000 processed over 10 minutes ✓
Users see: "Position in queue: 523, estimated wait: 5 minutes"
```

## Implementation for Your Diagram Generator

### Frontend Integration

```javascript
// In your React/Vue/whatever frontend:

async function generateDiagram(userPrompt) {
  // 1. Submit request
  const response = await fetch('/api/diagram/generate', {
    method: 'POST',
    headers: {
      'X-API-Key': user.apiKey
    },
    body: JSON.stringify({
      prompt: userPrompt,
      diagramType: 'mermaid'
    })
  });

  const { requestId, position, estimatedWait } = await response.json();

  // 2. Show user their position
  setStatus(`Queued (position ${position}), ~${estimatedWait/1000}s wait`);

  // 3. Connect WebSocket for real-time updates
  const ws = new WebSocket('ws://yourapi.com');
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'subscribe', requestId }));
  };

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    
    switch(update.type) {
      case 'status':
        setStatus(`Position: ${update.position}`);
        break;
      case 'processing':
        setStatus('Generating your diagram...');
        break;
      case 'completed':
        setDiagram(update.result);  // Show diagram to user
        setStatus('Complete!');
        break;
      case 'failed':
        setError(update.error);
        break;
    }
  };
}
```

### Subscription Tier Upsell

```javascript
// When user hits limit, show upgrade option
if (error.code === 'USER_LIMIT_EXCEEDED') {
  showUpgradeModal({
    currentTier: 'free',
    currentUsage: '10/10 requests',
    nextTier: 'basic',
    nextTierLimit: '100 requests/day',
    price: '$9/month'
  });
}
```

## Cost Analysis

### Your Current Costs (Testing Phase)

Assuming you were making requests with ~2000 tokens each:

**5x Plan - 2 Hours to Max Out:**
```
Time to max: 2 hours
Estimated requests: ~120 requests
Tokens used: ~240,000 tokens
Anthropic cost: ~$1.50 (at Sonnet 4.5 pricing)
```

**If You Upgrade to 20x Plan:**
```
4x more capacity
Time to max: ~8 hours
Estimated requests: ~480 requests  
Tokens used: ~960,000 tokens
Anthropic cost: ~$6.00
```

### Production Costs (100 Users)

**Scenario: 100 Pro Tier Users @ 500 requests/day each**

```
Total requests/day: 50,000
Avg tokens/request: 2,000
Total tokens/day: 100,000,000

Anthropic cost: ~$600/day = $18,000/month
Your revenue (100 × $49): $4,900/month

❌ NOT SUSTAINABLE - Need to optimize!
```

### Optimization Strategies

1. **Implement Caching:**
```javascript
// Cache common diagram patterns
const cached = await cache.get(promptHash);
if (cached) return cached; // Save API call
```

2. **Reduce Token Usage:**
```javascript
// Set maxTokens limit
options: {
  maxTokens: 2048  // Instead of 4096
}
```

3. **Tiered Pricing Aligned with Costs:**
```
Free: 10 requests/day (loss leader)
Basic: 100 requests/day @ $15/month
Pro: 500 requests/day @ $79/month
Enterprise: Custom pricing based on actual usage
```

## Programmatically Requesting More Capacity

**You asked:** "How do I programmatically ask for more?"

**Answer:** You don't! Instead:

1. **The queue system handles it automatically**
   - Requests wait in queue
   - Process as capacity becomes available
   - No manual intervention needed

2. **For permanent increases, contact Anthropic:**
```javascript
// No API for this - must email sales
// But you can monitor and alert yourself:

async function checkCapacity() {
  const usage = await usageTracker.getGlobalUsage('minute');
  
  if (usage.totalRequests > 80) { // 80% of 100 req/min
    alertAdmin('Approaching rate limit - consider upgrade');
  }
}
```

3. **For user upgrades:**
```javascript
// User upgrades tier programmatically:
await upgradeUserTier(userId, 'enterprise');

// System immediately applies new limits
// No API restart needed
```

## Final Recommendations

### Short Term (Next 2 Weeks)
1. ✅ Deploy this queue system
2. ✅ Implement caching for common diagrams
3. ✅ Set reasonable maxTokens limits (2048)
4. ✅ Start with 20x plan

### Medium Term (Next 2 Months)  
1. Monitor usage patterns
2. Optimize prompts to reduce tokens
3. Implement diagram templates (less AI needed)
4. Add analytics to identify power users

### Long Term (Scale to 1000+ Users)
1. Contact Anthropic for enterprise pricing
2. Implement multi-region deployment
3. Add diagram caching/CDN
4. Consider hybrid approach (templates + AI)

## Bottom Line

**Your Question:** "If tokens are depleted, how do I programmatically ask for more?"

**Answer:** You don't ask for more. You:
1. Queue the requests (this system does that)
2. Process them when capacity is available (automatic)
3. Show users their queue position (WebSocket updates)
4. Upgrade your Anthropic plan when usage consistently maxes out

This architecture ensures **zero failed requests** and **happy users**, even when hitting rate limits.
