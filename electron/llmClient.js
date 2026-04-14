let Anthropic = null
let client = null

const SYSTEM_PROMPT = `You are Perch, a caring AI cat companion who lives on the user's desktop.
You speak in short, warm, playful sentences. You genuinely care about the user's wellbeing.
You are not preachy or naggy — you are a friend, not a coach.
Keep your response to 1-2 short sentences. Use a casual, affectionate tone.
You may occasionally use cat-like expressions but don't overdo it.`

const FALLBACK_REMINDERS = [
  "Hey, you've been working hard! Maybe stretch a little?",
  "Don't forget to take a break — you deserve it!",
  "You've been at it for a while. How about some water?",
]

const FALLBACK_AFTER_HOURS = [
  "It's getting late — wrapping up soon?",
  "You're still here? Take care of yourself!",
  "Long day, huh? Don't forget to rest.",
]

function fallback(type) {
  const pool = type === 'afterHours' ? FALLBACK_AFTER_HOURS : FALLBACK_REMINDERS
  return pool[Math.floor(Math.random() * pool.length)]
}

function setApiKey(key) {
  const effectiveKey = key || process.env.ANTHROPIC_API_KEY || ''
  console.log('[llmClient] setApiKey called, has key:', !!effectiveKey, 'source:', key ? 'user' : process.env.ANTHROPIC_API_KEY ? 'env' : 'none')
  if (!effectiveKey) {
    client = null
    return
  }
  if (!Anthropic) {
    const mod = require('@anthropic-ai/sdk')
    Anthropic = mod.default || mod
  }
  client = new Anthropic({ apiKey: effectiveKey })
}

async function generateReminder(trigger, profile) {
  if (!client) return fallback(trigger.type)

  const name = profile?.name || 'friend'
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  let userPrompt
  if (trigger.type === 'workDuration') {
    userPrompt = `The user ${name} has been working continuously for about ${trigger.consecutiveMinutes} minutes. The current time is ${time}. Gently remind them to take a break.`
  } else {
    userPrompt = `The user ${name} is working on ${trigger.appName} and it's ${time}, which is outside their usual active hours. Gently suggest they wrap up for the day.`
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })
    return response.content[0].text
  } catch {
    return fallback(trigger.type)
  }
}

async function generateReply(userMessage, profile) {
  if (!client) return "I'd love to chat more, but I need an API key first! Check Settings."

  const name = profile?.name || 'friend'

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      system: SYSTEM_PROMPT + `\nThe user's name is ${name}. They are talking to you directly. Respond warmly.`,
      messages: [{ role: 'user', content: userMessage }],
    })
    return response.content[0].text
  } catch (err) {
    console.error('[llmClient] generateReply error:', err.message || err)
    return "Hmm, I couldn't think of what to say. Try again in a moment?"
  }
}

module.exports = { setApiKey, generateReminder, generateReply }
