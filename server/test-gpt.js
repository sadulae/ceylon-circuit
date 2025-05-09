import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function testGptConnection() {
  try {
    console.log('Testing GPT API connection...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a test assistant. Respond with a simple greeting."
        },
        {
          role: "user",
          content: "Hello, are you working?"
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    console.log('✅ GPT API Connection Successful!');
    console.log('Response:', completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ GPT API Connection Failed:', error.message);
    return false;
  }
} 