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

const heroImagePrompt = `A warm, inviting illustration of a friendly professional teacher in a modern, cozy classroom.
The teacher is sitting at a wooden desk with an open laptop showing a cheerful robot mascot assistant on the screen.
The teacher looks happy, inspired, and relieved - as if a weight has been lifted off their shoulders.
Around the desk are neatly organized colorful teaching materials: lesson plans, flashcards, and educational books.
A classic green chalkboard with mathematical equations is visible in the soft-focus background.
The lighting is golden hour warm, streaming through a window. The atmosphere feels productive yet peaceful.
Style: Modern children's book illustration, warm color palette with greens, golds, and cream tones.
The scene conveys: "Teaching just got easier and more joyful."`;

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
