const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'DUMMY' });
console.log(typeof ai.models.generateContent);
