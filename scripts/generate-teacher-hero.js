/**
 * Script to generate teacher hero image via Gemini API and save as static asset
 * Run with: node scripts/generate-teacher-hero.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://api.orbitlearn.app';

const heroImagePrompt = `A warm, inviting illustration of a professional teacher in a modern classroom setting.
The teacher is sitting at a clean desk with an open laptop showing a friendly AI assistant interface on the screen.
The teacher looks confident, inspired, and productive - ready to create engaging lessons.
On the desk are neatly organized teaching materials: a tablet showing lesson plans, colorful notebooks, and a cup of coffee.
A whiteboard with educational diagrams (math formulas, science concepts) is visible in the background.
The lighting is warm and professional. The atmosphere conveys efficiency and modern education.
Style: Modern professional illustration, warm color palette with greens, golds, and cream tones.
Suitable for K-12 education - the scene should feel professional and applicable to teachers of all grade levels.
The scene conveys: "Teaching just got easier and more efficient."`;

async function generateAndSaveImage() {
  console.log('🎨 Generating teacher hero image via Gemini...\n');
  console.log('Prompt:', heroImagePrompt.substring(0, 100) + '...\n');

  try {
    const response = await fetch(`${API_URL}/api/ai/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: heroImagePrompt,
        style: 'educational',
        cacheKey: 'teacher-hero-static',
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.data?.dataUrl) {
      throw new Error('Invalid response from API');
    }

    console.log('✅ Image generated successfully!\n');

    // Extract base64 data from data URL
    const dataUrl = data.data.dataUrl;
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to assets folder
    const outputPath = path.join(__dirname, '../public/assets/images/landing/teacher-hero.png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`💾 Image saved to: ${outputPath}`);
    console.log(`📦 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
    console.log('\n🎉 Done! Update TeacherHeroSection.jsx to use:');
    console.log('   src="/assets/images/landing/teacher-hero.png"');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAndSaveImage();
