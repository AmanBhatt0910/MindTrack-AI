import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";

// ─── Crisis keywords (HIGHEST PRIORITY) ────────────────────────────────────
const CRISIS_KEYWORDS = [
  // English
  "kill myself", "suicide", "suicidal", "end my life", "want to die",
  "don't want to live", "end it all", "no reason to live",
  "self harm", "self-harm", "hurt myself", "cutting myself",
  "overdose", "jump off", "hang myself",
  // Hindi / Hinglish
  "khudkhushi", "marna chahta", "marna chahti", "jeena nahi",
  "mar jaunga", "mar jaungi", "zindagi khatam", "aatmhatya",
  "khud ko marna", "jaan dena", "maut chahiye",
];

const CRISIS_RESPONSE_EN = `I'm really concerned about what you've shared, and I want you to know that your life matters. Please reach out to a crisis helpline immediately:

🆘 **Emergency**: Call 988 (Suicide & Crisis Lifeline)
📱 **Crisis Text Line**: Text HOME to 741741
🇮🇳 **iCall (India)**: 9152987821
🇮🇳 **Vandrevala Foundation**: 1860-2662-345

You don't have to go through this alone. A trained counselor is available 24/7 and can help you right now. Please reach out — they care about you.`;

const CRISIS_RESPONSE_HI = `मैं आपकी बातों से बहुत चिंतित हूँ। कृपया जानिए कि आपकी ज़िंदगी बहुत महत्वपूर्ण है। कृपया तुरंत किसी हेल्पलाइन से संपर्क करें:

🆘 **आपातकालीन**: 988 पर कॉल करें (Suicide & Crisis Lifeline)
📱 **Crisis Text Line**: 741741 पर HOME लिखें
🇮🇳 **iCall (भारत)**: 9152987821
🇮🇳 **वंड्रेवाला फाउंडेशन**: 1860-2662-345

आप अकेले नहीं हैं। प्रशिक्षित काउंसलर 24/7 उपलब्ध हैं और अभी आपकी मदद कर सकते हैं। कृपया संपर्क करें — वे आपकी परवाह करते हैं। 💙`;

function getCrisisResponse(lang: string) {
  const reply = lang === "hi" ? CRISIS_RESPONSE_HI : CRISIS_RESPONSE_EN;
  return {
    reply,
    source: "crisis" as const,
    isCrisis: true,
    crisisResources: [
      { name: "Suicide & Crisis Lifeline", phone: "988", description: "24/7 free support" },
      { name: "Crisis Text Line", phone: "Text HOME to 741741", description: "Free crisis counseling via text" },
      { name: "iCall (India)", phone: "9152987821", description: "Psychosocial helpline by TISS" },
      { name: "Vandrevala Foundation", phone: "1860-2662-345", description: "24/7 mental health support" },
    ],
  };
}

// ─── Language detection ────────────────────────────────────────────────────
const HINDI_PATTERNS = /[\u0900-\u097F]|kya|hai|hoon|mujhe|mera|meri|nahi|bahut|acha|bura|kaise|kaisa|kuch|aur|lekin|kyunki|abhi|kab|yahan|wahan|theek|thik|pata|zyada|kam|bohot|accha|baat|raha|rahi|hota|hoti|chahiye|chahta|chahti|lagta|lagti|samajh|dukhi|udaas|tanaav|chinta|gussa|akela|neend|thaka/i;

function detectLanguage(text: string): string {
  // Check for Devanagari script first
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  // Check for Hinglish patterns
  const words = text.toLowerCase().split(/\s+/);
  const hindiWordCount = words.filter(w => HINDI_PATTERNS.test(w)).length;
  if (hindiWordCount >= 2 || (hindiWordCount >= 1 && words.length <= 5)) return "hi";
  return "en";
}

// ─── Rule-based responses (bilingual) ────────────────────────────────────
interface Rule {
  keywords: string[];
  response_en: string;
  response_hi: string;
}

const RULES: Rule[] = [
  {
    keywords: ["stressed", "stress", "overwhelmed", "pressure", "burnout", "tanaav", "dabav", "tension"],
    response_en: `I hear you — stress can feel really heavy. Here are some things that might help right now:

💨 **Try the 4-7-8 breathing technique**: Inhale for 4 seconds, hold for 7, exhale for 8. Repeat 3 times.
🚶 **Take a short walk**: Even 5 minutes of movement can shift your energy.
📝 **Brain dump**: Write everything on your mind without filtering. Just let it flow.

Remember, it's okay to not have everything figured out. You're handling more than you realize. 💙`,
    response_hi: `मैं समझ सकता/सकती हूँ — तनाव बहुत भारी लग सकता है। ये कुछ चीज़ें हैं जो अभी मदद कर सकती हैं:

💨 **4-7-8 श्वास तकनीक**: 4 सेकंड साँस लें, 7 सेकंड रोकें, 8 सेकंड में छोड़ें। 3 बार दोहराएं।
🚶 **छोटी सैर करें**: 5 मिनट की चहलकदमी भी आपकी ऊर्जा बदल सकती है।
📝 **मन खाली करें**: बिना फ़िल्टर किए जो मन में आए लिख दें।

याद रखें, सब कुछ समझ में न आए तो ठीक है। आप जितना सोचते हैं उससे ज्यादा संभाल रहे हैं। 💙`,
  },
  {
    keywords: ["anxious", "anxiety", "worried", "panic", "nervous", "scared", "chinta", "ghabra", "dar", "pareshan"],
    response_en: `Anxiety can feel overwhelming, but you're not alone in this. Let's try to ground you:

🌍 **5-4-3-2-1 Grounding**: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.
🫁 **Box breathing**: Breathe in 4 seconds, hold 4, out 4, hold 4. Repeat.
💭 **Thought check**: Ask yourself — "Will this matter in 5 years?" Often it helps put things in perspective.

Whatever you're feeling is valid. Take it one moment at a time. 🌱`,
    response_hi: `चिंता बहुत भारी लग सकती है, लेकिन आप इसमें अकेले नहीं हैं। आइए ग्राउंडिंग करें:

🌍 **5-4-3-2-1 ग्राउंडिंग**: 5 चीज़ें जो दिखें, 4 जो छू सकें, 3 जो सुनें, 2 जो सूंघें, 1 जो चखें।
🫁 **बॉक्स ब्रीदिंग**: 4 सेकंड साँस लें, 4 रोकें, 4 में छोड़ें, 4 रोकें। दोहराएं।
💭 **सोच जांचें**: खुद से पूछें — "क्या 5 साल बाद यह मायने रखेगा?"

आप जो महसूस कर रहे हैं वो सही है। एक पल एक बार लें। 🌱`,
  },
  {
    keywords: ["sad", "depressed", "depression", "unhappy", "hopeless", "empty", "numb", "udaas", "dukhi", "dard"],
    response_en: `I'm sorry you're feeling this way. Sadness is a natural emotion, and it's okay to sit with it for a while.

🌞 **Small wins**: Try doing just one tiny thing — make your bed, drink water, step outside.
🎵 **Music can help**: Put on a song that usually lifts your mood, even just as background.
📖 **Gratitude moment**: Write down 3 things, no matter how small, that you appreciate today.

If this feeling persists, consider reaching out to a counselor. You deserve support. 💙`,
    response_hi: `मुझे दुख है कि आप ऐसा महसूस कर रहे हैं। उदासी एक स्वाभाविक भावना है।

🌞 **छोटी जीत**: बस एक छोटा काम करें — बिस्तर ठीक करें, पानी पिएं, बाहर जाएं।
🎵 **संगीत मदद कर सकता है**: अपना पसंदीदा गाना लगाएं।
📖 **कृतज्ञता का पल**: 3 चीज़ें लिखें जिनके लिए आप आभारी हैं, चाहे कितनी भी छोटी हों।

अगर यह भावना बनी रहे, तो काउंसलर से बात करें। आप सहायता के हकदार हैं। 💙`,
  },
  {
    keywords: ["lonely", "alone", "isolated", "no one", "nobody cares", "akela", "akeli"],
    response_en: `Feeling lonely is really painful, and your feelings are completely valid.

👋 **Reach out**: Send a message to someone — a friend, family member, or even an online community.
🫂 **Connection**: Join a support group or community.
💝 **Self-kindness**: Treat yourself like you would a friend.

You're reaching out right now, and that takes courage. I'm here for you. 🌟`,
    response_hi: `अकेलापन बहुत दर्दनाक होता है, और आपकी भावनाएं पूरी तरह सही हैं।

👋 **किसी से बात करें**: एक दोस्त, परिवार के सदस्य या ऑनलाइन समुदाय को संदेश भेजें।
🫂 **जुड़ाव**: किसी सपोर्ट ग्रुप या कम्युनिटी से जुड़ें।
💝 **खुद से प्यार करें**: अपने आप से वैसे पेश आएं जैसे किसी दोस्त से।

आप अभी बात कर रहे हैं — इसमें हिम्मत लगती है। मैं यहाँ हूँ। 🌟`,
  },
  {
    keywords: ["sleep", "insomnia", "can't sleep", "sleeping too much", "tired", "exhausted", "neend", "thaka", "thaki"],
    response_en: `Sleep issues can really affect everything. Here are some gentle suggestions:

🌙 **Wind-down routine**: Try dimming lights 1 hour before bed. No screens.
🧘 **Body scan**: Lay down and slowly relax each body part from toes to head.
📵 **Digital sunset**: Put your phone away 30 minutes before sleep.
🍵 **Warm drink**: Chamomile tea or warm milk can signal your body it's time to rest.

Good rest is not a luxury — it's essential. Be gentle with yourself. 🌜`,
    response_hi: `नींद की समस्या सब कुछ प्रभावित करती है। कुछ सुझाव:

🌙 **सोने की दिनचर्या**: सोने से 1 घंटे पहले लाइट कम करें। स्क्रीन बंद करें।
🧘 **बॉडी स्कैन**: लेट जाएं और पैरों से सिर तक धीरे-धीरे आराम दें।
📵 **फोन दूर रखें**: सोने से 30 मिनट पहले फोन रख दें।
🍵 **गर्म पेय**: कैमोमाइल चाय या गर्म दूध शरीर को आराम का संकेत देता है।

अच्छी नींद विलासिता नहीं — ज़रूरत है। खुद से नरम रहें। 🌜`,
  },
  {
    keywords: ["angry", "anger", "furious", "rage", "frustrated", "gussa", "naraz"],
    response_en: `Anger is a valid emotion — it often tells us something important about our boundaries.

⏸️ **Pause**: When you notice anger rising, count to 10 slowly before reacting.
💪 **Physical release**: Do push-ups, squeeze a stress ball, or take a brisk walk.
📝 **Write it out**: Pour your feelings onto paper. You don't have to send it to anyone.
🧊 **Cold water**: Splash cold water on your face — it activates your calm-down response.

It's okay to feel angry. What matters is how you channel it. 💙`,
    response_hi: `गुस्सा एक वैध भावना है — यह अक्सर हमारी सीमाओं के बारे में कुछ महत्वपूर्ण बताता है।

⏸️ **रुकें**: गुस्सा आने पर प्रतिक्रिया से पहले 10 तक गिनें।
💪 **शारीरिक निकासी**: पुश-अप करें, स्ट्रेस बॉल दबाएं, या तेज़ चहलकदमी करें।
📝 **लिख डालें**: अपनी भावनाएं कागज़ पर उड़ेलें।
🧊 **ठंडा पानी**: चेहरे पर ठंडा पानी मारें — यह शांत करने वाली प्रतिक्रिया सक्रिय करता है।

गुस्सा होना ठीक है। मायने यह रखता है कि आप इसे कैसे संभालते हैं। 💙`,
  },
  {
    keywords: ["thank", "thanks", "shukriya", "dhanyavaad", "grateful"],
    response_en: `You're so welcome! 😊 I'm always here whenever you want to talk. Remember, taking care of your mental health is a sign of strength, not weakness.

Is there anything else you'd like to discuss? 🌟`,
    response_hi: `बहुत-बहुत शुक्रिया! 😊 मैं हमेशा यहाँ हूँ जब भी आप बात करना चाहें। याद रखें, अपने मानसिक स्वास्थ्य का ध्यान रखना ताकत की निशानी है, कमज़ोरी की नहीं।

क्या कुछ और है जिस पर बात करना चाहेंगे? 🌟`,
  },
  {
    keywords: ["hello", "hi", "hey", "namaste", "kaise ho", "kya haal"],
    response_en: `Hello! 😊 Welcome to your safe space. I'm here to listen and support you.

How are you feeling today? You can share anything — there's no judgment here.

💡 **Tip**: You can tell me about stress, anxiety, sleep issues, or anything on your mind, and I'll do my best to help. 🌿`,
    response_hi: `नमस्ते! 😊 अपने सुरक्षित स्थान में आपका स्वागत है। मैं यहाँ सुनने और सहायता करने के लिए हूँ।

आज आप कैसा महसूस कर रहे हैं? कुछ भी बताइए — यहाँ कोई निर्णय नहीं है।

💡 **सुझाव**: आप तनाव, चिंता, नींद की समस्या, या जो भी मन में हो बता सकते हैं। मैं पूरी कोशिश करूंगा/करूंगी मदद करने की। 🌿`,
  },
  {
    keywords: ["kaisa feel", "kaise feel", "bahut bura", "achha nahi", "theek nahi", "thik nahi", "mood kharab"],
    response_en: `I can see you're going through something difficult. You don't have to face it alone.

Would you like to tell me more about what's bothering you? I'm here to listen. 💙`,
    response_hi: `मैं देख सकता/सकती हूँ कि आप कठिन दौर से गुज़र रहे हैं। आपको अकेले सामना नहीं करना है।

क्या आप बताना चाहेंगे कि क्या परेशान कर रहा है? मैं यहाँ सुनने के लिए हूँ। 💙`,
  },
];

function findRuleMatch(message: string, lang: string): string | null {
  const lower = message.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return lang === "hi" ? rule.response_hi : rule.response_en;
    }
  }
  return null;
}

function isCrisisMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

// ─── Gemini fallback (multilingual) ────────────────────────────────────────
async function callGemini(
  message: string,
  history: { role: string; content: string }[],
  lang: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const langInstruction = lang === "hi"
    ? "The user is communicating in Hindi or Hinglish. You MUST respond in Hindi (Devanagari script) or Hinglish (Hindi written in English). Match the user's language style. If they write in Devanagari, reply in Devanagari. If they write Hinglish, reply in Hinglish."
    : "The user is communicating in English. Respond in English.";

  const systemPrompt = `You are a compassionate mental health support companion named "MindTrack Buddy". You must:

STRICT RULES:
- NEVER diagnose medical or psychiatric conditions
- NEVER prescribe or suggest specific medications
- NEVER provide clinical treatment plans
- NEVER dismiss or minimize the user's feelings
- Always suggest professional help for serious concerns
- If anyone expresses suicidal ideation, IMMEDIATELY provide crisis hotline numbers (988 for US, 9152987821 for India iCall, 1860-2662-345 for Vandrevala Foundation)
- Be empathetic, warm, and validating
- Focus on coping strategies, self-care tips, and emotional support
- Use simple, friendly language
- Keep responses concise (2-3 short paragraphs max)
- Use relevant emojis sparingly for warmth

LANGUAGE INSTRUCTION:
${langInstruction}

You are NOT a therapist. You are a supportive friend who listens and guides.`;

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [{ text: lang === "hi"
        ? "मैं समझ गया/गई। मैं एक सहानुभूतिपूर्ण मानसिक स्वास्थ्य सहयोगी के रूप में सभी नियमों का पालन करूंगा/करूंगी।"
        : "I understand. I will act as a compassionate mental health support companion following all the strict rules."
      }],
    },
    ...history.slice(-6).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API error:", errText);
    throw new Error(`Gemini API failed: ${res.status}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    (lang === "hi"
      ? "मुझे अभी जवाब देने में कठिनाई हो रही है। कृपया जानिए कि मैं आपके लिए यहाँ हूँ। 💙"
      : "I'm having trouble responding right now. Please know that I'm here for you. 💙");

  return text;
}

// ─── API Handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, sessionHistory = [], language: userLang } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Auto-detect language or use the one provided by client
    const detectedLang = detectLanguage(message);
    const lang = userLang || detectedLang;

    // STEP 1: Crisis check (ALWAYS first)
    if (isCrisisMessage(message)) {
      return NextResponse.json(getCrisisResponse(lang));
    }

    // STEP 2: Rule-based check
    const ruleResponse = findRuleMatch(message, lang);
    if (ruleResponse) {
      return NextResponse.json({
        reply: ruleResponse,
        source: "rule",
        isCrisis: false,
        detectedLanguage: lang,
      });
    }

    // STEP 3: Gemini fallback for complex queries (with language context)
    try {
      const geminiReply = await callGemini(message, sessionHistory, lang);
      return NextResponse.json({
        reply: geminiReply,
        source: "gemini",
        isCrisis: false,
        detectedLanguage: lang,
      });
    } catch (err) {
      console.error("Gemini fallback failed:", err);
      const fallback = lang === "hi"
        ? `आपने जो साझा किया उसके लिए धन्यवाद। अभी तकनीकी समस्या हो रही है, लेकिन आपकी भावनाएं महत्वपूर्ण हैं।

कुछ सुझाव:
💨 **गहरी साँस लें** — 4 सेकंड अंदर, 4 रोकें, 4 बाहर
📝 **लिखें** — जर्नलिंग भावनाओं को समझने में मदद करती है
🤝 **किसी से बात करें** — दोस्त, परिवार या काउंसलर

मैं जल्द ठीक हो जाऊंगा/जाऊंगी। आप बहुत अच्छा कर रहे हैं! 💙`
        : `I appreciate you sharing that with me. While I'm having a moment of technical difficulty, I want you to know that your feelings are valid.

Here are some things that might help:
💨 **Take a deep breath** — inhale for 4 seconds, hold for 4, exhale for 4
📝 **Write it out** — journaling can help process complex emotions
🤝 **Talk to someone** — a trusted friend, family member, or counselor

I'll be back to full capacity soon. You're doing great by reaching out. 💙`;

      return NextResponse.json({
        reply: fallback,
        source: "rule",
        isCrisis: false,
        detectedLanguage: lang,
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
