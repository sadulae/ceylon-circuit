// Test script for Gemini API
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
  console.log('Starting Gemini API test...');
  console.log('Environment variables loaded. GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  
  try {
    // Initialize the Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    
    console.log('API Key found:', apiKey.substring(0, 4) + '...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini API initialized');
    
    // Get the model - use the latest version
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    console.log('Model loaded: gemini-1.5-pro');
    
    // Generate content
    console.log('Sending test prompt to Gemini API...');
    const result = await model.generateContent("Give me a one-line greeting for Sri Lanka tourism.");
    
    // Get the response
    const response = result.response;
    const text = response.text();
    
    console.log('Response from Gemini API:');
    console.log(text);
    
    console.log('Gemini API test completed successfully!');
  } catch (error) {
    console.error('Error testing Gemini API:', error);
  }
}

// Run the test
testGeminiAPI(); 