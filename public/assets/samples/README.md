# Sample Images

This directory contains before/after sample images for the homepage showcase.

## Generation

To generate sample images using the Gemini API:

```bash
cd backend
npx tsx scripts/generateSampleImages.ts
```

This will create:
- `before-1.jpg` through `before-6.jpg` - Casual selfie samples
- `after-[template]-1.jpg` through `after-[template]-6.jpg` - Professional headshot samples

## Placeholder Images

Until real samples are generated, the homepage uses placeholder images from via.placeholder.com.

## Image Requirements

- Before images: 800x1000px (casual selfies)
- After images: Template-specific dimensions (e.g., 1024x1024 for LinkedIn)
- Format: JPEG
- Quality: 85-95%
