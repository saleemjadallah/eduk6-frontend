/**
 * Script to generate teacher feature images via Gemini API and save as static assets
 * Run with: node scripts/generate-feature-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://api.orbitlearn.app';

// Updated prompts - more age-appropriate for K-12 (not just young kids)
const featureImages = [
  {
    name: 'teacher-feature-lesson',
    prompt: `A beautifully designed digital lesson plan document displayed on a modern tablet screen.
The document shows a professional educational layout with:
- A header reading "High School Biology: Cell Division"
- Colorful section headers in green and gold
- Organized bullet points for learning objectives
- A timeline showing a 45-minute class structure
- Small scientific diagrams and illustrations
Clean, professional design with warm paper-like background texture. Modern educational aesthetic suitable for teachers of all grade levels K-12.`
  },
  {
    name: 'teacher-feature-quiz',
    prompt: `A modern quiz interface displayed on a tablet screen showing an educational assessment.
The quiz shows:
- A header "Chapter 5 Assessment - World History"
- Multiple choice questions with options A, B, C, D
- A mix of question types visible
- Clean progress indicator showing "Question 7 of 15"
- Some answers marked with green checkmarks
Modern, clean design with sage green accents. Professional educational aesthetic suitable for middle school and high school students.`
  },
  {
    name: 'teacher-feature-flashcards',
    prompt: `A collection of educational flashcards artistically arranged on a clean wooden desk.
The flashcards show:
- Various subjects: vocabulary words, math formulas, historical dates
- Cards in warm colors (gold, orange, cream, sage green)
- One card prominently showing "Mitochondria - The powerhouse of the cell"
- Another showing a Spanish vocabulary word
- Professional typography and clean design
Cozy, organized study aesthetic. Educational materials suitable for students of all ages from elementary to high school.`
  },
  {
    name: 'teacher-feature-infographic',
    prompt: `A stunning educational infographic about the solar system displayed on a digital screen.
The infographic features:
- Beautiful illustrated planets in accurate relative positions
- Informative labels with planet names and key facts
- Clean arrows and connecting lines showing orbital paths
- A color scheme of deep blue, terracotta orange, and gold
- Professional typography with clear hierarchy
Modern data visualization style. Engaging for students from elementary through high school. Print-ready quality design.`
  }
];

async function generateImage(imageConfig) {
  console.log(`\n🎨 Generating: ${imageConfig.name}...`);

  try {
    const response = await fetch(`${API_URL}/api/ai/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imageConfig.prompt,
        style: 'educational',
        cacheKey: `${imageConfig.name}-static`,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.data?.dataUrl) {
      throw new Error('Invalid response from API');
    }

    // Extract base64 data from data URL
    const dataUrl = data.data.dataUrl;
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to assets folder
    const outputPath = path.join(__dirname, `../public/assets/images/landing/${imageConfig.name}.png`);
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Saved: ${imageConfig.name}.png (${(buffer.length / 1024).toFixed(1)} KB)`);
    return true;

  } catch (error) {
    console.error(`❌ Failed: ${imageConfig.name} - ${error.message}`);
    return false;
  }
}

async function generateAllImages() {
  console.log('🚀 Starting feature image generation...');
  console.log(`📦 Generating ${featureImages.length} images\n`);

  let successCount = 0;

  for (const imageConfig of featureImages) {
    const success = await generateImage(imageConfig);
    if (success) successCount++;

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 Done! Generated ${successCount}/${featureImages.length} images`);
  console.log('\nUpdate TeacherFeaturesSection.jsx to use static images:');
  featureImages.forEach(img => {
    console.log(`  - /assets/images/landing/${img.name}.png`);
  });
}

generateAllImages();
