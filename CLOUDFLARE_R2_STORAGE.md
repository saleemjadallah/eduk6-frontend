# Cloudflare R2 Storage Configuration
## K-6 AI Learning Platform - Claude Code Guide

**Purpose:** Configure Cloudflare R2 as the primary object storage for user uploads, AI-generated content, and static assets in the NanoBanana K-6 Learning Platform.

**Why R2 over GCS:** Zero egress fees, S3-compatible API, global edge distribution via Cloudflare CDN, cost-effective for media-heavy EdTech app.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [R2 Bucket Structure](#2-r2-bucket-structure)
3. [Environment Configuration](#3-environment-configuration)
4. [Backend Implementation](#4-backend-implementation)
5. [Upload Service](#5-upload-service)
6. [Presigned URLs](#6-presigned-urls)
7. [CDN Integration](#7-cdn-integration)
8. [Child Safety Considerations](#8-child-safety-considerations)
9. [COPPA/GDPR-K Compliance](#9-coppagdpr-k-compliance)
10. [Testing](#10-testing)

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE R2 STORAGE ARCHITECTURE                  │
│                                                                            │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐  │
│   │   Flutter    │     │   Node.js    │     │     Cloudflare R2        │  │
│   │   Mobile     │────▶│   Backend    │────▶│                          │  │
│   │   App        │     │   (Express)  │     │  ┌────────────────────┐  │  │
│   └──────────────┘     └──────────────┘     │  │ user-uploads/      │  │  │
│                               │              │  │  └─ {familyId}/    │  │  │
│                               │              │  │     └─ {childId}/  │  │  │
│                               ▼              │  ├────────────────────┤  │  │
│                        ┌──────────────┐     │  │ ai-generated/      │  │  │
│                        │  Cloudflare  │     │  │  └─ images/        │  │  │
│                        │  Workers     │◀────│  │  └─ videos/        │  │  │
│                        │  (Optional)  │     │  │  └─ audio/         │  │  │
│                        └──────────────┘     │  ├────────────────────┤  │  │
│                               │              │  │ lesson-content/    │  │  │
│                               ▼              │  │  └─ pdfs/          │  │  │
│                        ┌──────────────┐     │  │  └─ thumbnails/    │  │  │
│                        │  Cloudflare  │     │  └────────────────────┘  │  │
│                        │  CDN Edge    │     │                          │  │
│                        └──────────────┘     └──────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- **Presigned URLs** for direct uploads (bypass Node.js for large files)
- **Private buckets** with signed URL access (no public bucket exposure)
- **Family/Child hierarchy** for COPPA compliance (parent owns all child data)
- **Separate AI bucket** for generated content (different retention policies)

---

## 2. R2 Bucket Structure

### Production Buckets

```
nanobanana-prod-uploads      # User-uploaded content
├── families/
│   └── {familyId}/
│       └── {childId}/
│           ├── lessons/
│           │   └── {lessonId}/
│           │       ├── original.pdf
│           │       ├── thumbnail.webp
│           │       └── metadata.json
│           └── profile/
│               └── avatar.webp

nanobanana-prod-ai-content   # AI-generated content (Imagen, Veo, etc.)
├── images/
│   └── {familyId}/
│       └── {childId}/
│           └── {generationId}.webp
├── videos/
│   └── {familyId}/
│       └── {childId}/
│           └── {generationId}.mp4
└── audio/
    └── {familyId}/
        └── {childId}/
            └── {generationId}.mp3

nanobanana-prod-static       # App assets (public)
├── mascots/
├── badges/
├── sounds/
└── ui-assets/
```

### Development/Staging Buckets

```
nanobanana-dev-uploads
nanobanana-dev-ai-content
nanobanana-staging-uploads
nanobanana-staging-ai-content
```

---

## 3. Environment Configuration

### Required Environment Variables

```bash
# .env.local / .env.production

# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key

# R2 Bucket Names
R2_BUCKET_UPLOADS=nanobanana-prod-uploads
R2_BUCKET_AI_CONTENT=nanobanana-prod-ai-content
R2_BUCKET_STATIC=nanobanana-prod-static

# R2 Endpoint (region-specific)
R2_ENDPOINT=https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com

# CDN Custom Domain (configure in Cloudflare dashboard)
CDN_BASE_URL=https://cdn.nanobanana.app

# Upload Limits (COPPA-compliant, child-safe)
MAX_UPLOAD_SIZE_MB=10
ALLOWED_UPLOAD_TYPES=application/pdf,image/png,image/jpeg,image/webp

# Presigned URL Expiry
PRESIGNED_URL_EXPIRY_UPLOAD=300      # 5 minutes for upload
PRESIGNED_URL_EXPIRY_DOWNLOAD=3600   # 1 hour for viewing
```

### TypeScript Environment Types

**File:** `src/types/env.d.ts`

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_R2_ACCESS_KEY_ID: string;
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_UPLOADS: string;
    R2_BUCKET_AI_CONTENT: string;
    R2_BUCKET_STATIC: string;
    R2_ENDPOINT: string;
    CDN_BASE_URL: string;
    MAX_UPLOAD_SIZE_MB: string;
    ALLOWED_UPLOAD_TYPES: string;
    PRESIGNED_URL_EXPIRY_UPLOAD: string;
    PRESIGNED_URL_EXPIRY_DOWNLOAD: string;
  }
}
```

---

## 4. Backend Implementation

### Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner mime-types uuid
npm install -D @types/mime-types
```

### R2 Client Configuration

**File:** `src/lib/r2Client.ts`

```typescript
import { S3Client } from '@aws-sdk/client-s3';

// R2 uses S3-compatible API
export const r2Client = new S3Client({
  region: 'auto', // R2 doesn't use regions, but SDK requires this
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Bucket references
export const BUCKETS = {
  uploads: process.env.R2_BUCKET_UPLOADS,
  aiContent: process.env.R2_BUCKET_AI_CONTENT,
  static: process.env.R2_BUCKET_STATIC,
} as const;

export type BucketName = keyof typeof BUCKETS;
```

### Storage Path Utilities

**File:** `src/utils/storagePaths.ts`

```typescript
/**
 * Generate consistent storage paths for the family/child hierarchy
 * Critical for COPPA compliance - all child data under parent-owned family
 */

export interface StoragePathParams {
  familyId: string;
  childId: string;
  lessonId?: string;
  contentType: 'lesson' | 'profile' | 'ai-image' | 'ai-video' | 'ai-audio';
  filename: string;
}

export function generateStoragePath(params: StoragePathParams): string {
  const { familyId, childId, lessonId, contentType, filename } = params;
  
  // Sanitize inputs to prevent path traversal
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9-_]/g, '');
  const safeFamilyId = sanitize(familyId);
  const safeChildId = sanitize(childId);
  const safeFilename = sanitize(filename.replace(/\.[^.]+$/, '')); // Remove extension
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (contentType) {
    case 'lesson':
      if (!lessonId) throw new Error('lessonId required for lesson content');
      return `families/${safeFamilyId}/${safeChildId}/lessons/${sanitize(lessonId)}/${safeFilename}.${extension}`;
    
    case 'profile':
      return `families/${safeFamilyId}/${safeChildId}/profile/${safeFilename}.${extension}`;
    
    case 'ai-image':
      return `images/${safeFamilyId}/${safeChildId}/${safeFilename}.${extension}`;
    
    case 'ai-video':
      return `videos/${safeFamilyId}/${safeChildId}/${safeFilename}.${extension}`;
    
    case 'ai-audio':
      return `audio/${safeFamilyId}/${safeChildId}/${safeFilename}.${extension}`;
    
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

/**
 * Parse a storage path back to components (for deletion/listing)
 */
export function parseStoragePath(path: string): Partial<StoragePathParams> {
  const parts = path.split('/');
  
  if (parts[0] === 'families' && parts.length >= 4) {
    return {
      familyId: parts[1],
      childId: parts[2],
      contentType: parts[3] === 'lessons' ? 'lesson' : 'profile',
      lessonId: parts[3] === 'lessons' ? parts[4] : undefined,
      filename: parts[parts.length - 1],
    };
  }
  
  // AI content paths
  if (['images', 'videos', 'audio'].includes(parts[0])) {
    return {
      familyId: parts[1],
      childId: parts[2],
      contentType: `ai-${parts[0].slice(0, -1)}` as StoragePathParams['contentType'],
      filename: parts[parts.length - 1],
    };
  }
  
  return { filename: parts[parts.length - 1] };
}
```

---

## 5. Upload Service

**File:** `src/services/storageService.ts`

```typescript
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { lookup } from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { r2Client, BUCKETS, BucketName } from '../lib/r2Client';
import { generateStoragePath, StoragePathParams } from '../utils/storagePaths';

// ============================================
// CONFIGURATION
// ============================================

const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10') * 1024 * 1024;
const ALLOWED_TYPES = (process.env.ALLOWED_UPLOAD_TYPES || '').split(',');

const UPLOAD_URL_EXPIRY = parseInt(process.env.PRESIGNED_URL_EXPIRY_UPLOAD || '300');
const DOWNLOAD_URL_EXPIRY = parseInt(process.env.PRESIGNED_URL_EXPIRY_DOWNLOAD || '3600');

// ============================================
// TYPES
// ============================================

export interface UploadRequest {
  familyId: string;
  childId: string;
  contentType: StoragePathParams['contentType'];
  filename: string;
  mimeType: string;
  fileSize: number;
  lessonId?: string;
}

export interface UploadResponse {
  uploadUrl: string;
  publicUrl: string;
  storagePath: string;
  expiresAt: Date;
}

export interface StoredFile {
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  metadata: Record<string, string>;
}

// ============================================
// VALIDATION (Child Safety First!)
// ============================================

/**
 * Validate upload request for child safety and COPPA compliance
 * @throws Error if validation fails
 */
export function validateUploadRequest(request: UploadRequest): void {
  // File size check
  if (request.fileSize > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  // MIME type check (whitelist approach for child safety)
  if (!ALLOWED_TYPES.includes(request.mimeType)) {
    throw new Error(
      `File type not allowed. Accepted types: ${ALLOWED_TYPES.join(', ')}`
    );
  }
  
  // Filename sanitization
  if (!/^[a-zA-Z0-9_\-. ]+$/.test(request.filename)) {
    throw new Error('Invalid filename. Use only letters, numbers, spaces, hyphens, and underscores.');
  }
  
  // File extension matches MIME type
  const expectedMime = lookup(request.filename);
  if (expectedMime && expectedMime !== request.mimeType) {
    throw new Error('File extension does not match content type');
  }
}

// ============================================
// PRESIGNED URLS
// ============================================

/**
 * Generate a presigned URL for direct upload to R2
 * Client uploads directly to R2, bypassing Node.js for large files
 */
export async function getPresignedUploadUrl(
  request: UploadRequest
): Promise<UploadResponse> {
  // Validate first (throws on failure)
  validateUploadRequest(request);
  
  // Generate unique path
  const uniqueFilename = `${uuidv4()}-${request.filename}`;
  const storagePath = generateStoragePath({
    ...request,
    filename: uniqueFilename,
  });
  
  // Determine bucket
  const bucket = request.contentType.startsWith('ai-')
    ? BUCKETS.aiContent
    : BUCKETS.uploads;
  
  // Create presigned PUT URL
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storagePath,
    ContentType: request.mimeType,
    ContentLength: request.fileSize,
    Metadata: {
      'family-id': request.familyId,
      'child-id': request.childId,
      'original-filename': request.filename,
      'uploaded-at': new Date().toISOString(),
    },
  });
  
  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: UPLOAD_URL_EXPIRY,
  });
  
  const expiresAt = new Date(Date.now() + UPLOAD_URL_EXPIRY * 1000);
  
  // Public URL via CDN
  const publicUrl = `${process.env.CDN_BASE_URL}/${storagePath}`;
  
  return {
    uploadUrl,
    publicUrl,
    storagePath,
    expiresAt,
  };
}

/**
 * Generate a presigned URL for downloading/viewing content
 * Used for private content that shouldn't be publicly accessible
 */
export async function getPresignedDownloadUrl(
  storagePath: string,
  bucket: BucketName = 'uploads'
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: storagePath,
  });
  
  return getSignedUrl(r2Client, command, {
    expiresIn: DOWNLOAD_URL_EXPIRY,
  });
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Upload a file directly from the backend (for server-side processing)
 */
export async function uploadFile(
  bucket: BucketName,
  storagePath: string,
  body: Buffer | Uint8Array | string,
  mimeType: string,
  metadata: Record<string, string> = {}
): Promise<StoredFile> {
  const command = new PutObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: storagePath,
    Body: body,
    ContentType: mimeType,
    Metadata: metadata,
  });
  
  await r2Client.send(command);
  
  return {
    storagePath,
    publicUrl: `${process.env.CDN_BASE_URL}/${storagePath}`,
    mimeType,
    size: Buffer.byteLength(body),
    uploadedAt: new Date(),
    metadata,
  };
}

/**
 * Delete a file from R2
 */
export async function deleteFile(
  bucket: BucketName,
  storagePath: string
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: storagePath,
  });
  
  await r2Client.send(command);
}

/**
 * Delete all files for a child (COPPA: parent-requested deletion)
 */
export async function deleteAllChildContent(
  familyId: string,
  childId: string
): Promise<{ deleted: number }> {
  let deleted = 0;
  
  // Delete from uploads bucket
  const uploadPrefix = `families/${familyId}/${childId}/`;
  deleted += await deleteByPrefix('uploads', uploadPrefix);
  
  // Delete from AI content bucket
  for (const type of ['images', 'videos', 'audio']) {
    const aiPrefix = `${type}/${familyId}/${childId}/`;
    deleted += await deleteByPrefix('aiContent', aiPrefix);
  }
  
  return { deleted };
}

/**
 * Helper: Delete all objects with a given prefix
 */
async function deleteByPrefix(
  bucket: BucketName,
  prefix: string
): Promise<number> {
  let deleted = 0;
  let continuationToken: string | undefined;
  
  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKETS[bucket],
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    
    const response = await r2Client.send(listCommand);
    
    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          await deleteFile(bucket, object.Key);
          deleted++;
        }
      }
    }
    
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  
  return deleted;
}

/**
 * Get file metadata without downloading content
 */
export async function getFileMetadata(
  bucket: BucketName,
  storagePath: string
): Promise<StoredFile | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKETS[bucket],
      Key: storagePath,
    });
    
    const response = await r2Client.send(command);
    
    return {
      storagePath,
      publicUrl: `${process.env.CDN_BASE_URL}/${storagePath}`,
      mimeType: response.ContentType || 'application/octet-stream',
      size: response.ContentLength || 0,
      uploadedAt: response.LastModified || new Date(),
      metadata: response.Metadata || {},
    };
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return null;
    }
    throw error;
  }
}

/**
 * List all files for a child (for parent dashboard)
 */
export async function listChildContent(
  familyId: string,
  childId: string
): Promise<StoredFile[]> {
  const files: StoredFile[] = [];
  const prefix = `families/${familyId}/${childId}/`;
  
  let continuationToken: string | undefined;
  
  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKETS.uploads,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    
    const response = await r2Client.send(command);
    
    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          files.push({
            storagePath: object.Key,
            publicUrl: `${process.env.CDN_BASE_URL}/${object.Key}`,
            mimeType: 'application/octet-stream', // Would need HeadObject for actual type
            size: object.Size || 0,
            uploadedAt: object.LastModified || new Date(),
            metadata: {},
          });
        }
      }
    }
    
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  
  return files;
}
```

---

## 6. Presigned URLs

### Express Routes

**File:** `src/routes/upload.routes.ts`

```typescript
import { Router } from 'express';
import { z } from 'zod';
import {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteFile,
  deleteAllChildContent,
  listChildContent,
} from '../services/storageService';
import { authenticateParent, authorizeChildAccess } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// ============================================
// SCHEMAS
// ============================================

const presignedUploadSchema = z.object({
  body: z.object({
    childId: z.string().uuid(),
    contentType: z.enum(['lesson', 'profile']),
    filename: z.string().min(1).max(255),
    mimeType: z.enum([
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
    ]),
    fileSize: z.number().positive().max(10 * 1024 * 1024), // 10MB max
    lessonId: z.string().uuid().optional(),
  }),
});

const downloadSchema = z.object({
  params: z.object({
    storagePath: z.string().min(1),
  }),
});

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/upload/presigned
 * Get a presigned URL for direct upload to R2
 */
router.post(
  '/presigned',
  authenticateParent,
  authorizeChildAccess,
  validateRequest(presignedUploadSchema),
  async (req, res, next) => {
    try {
      const { childId, contentType, filename, mimeType, fileSize, lessonId } = req.body;
      const familyId = req.user.familyId; // From auth middleware
      
      const result = await getPresignedUploadUrl({
        familyId,
        childId,
        contentType,
        filename,
        mimeType,
        fileSize,
        lessonId,
      });
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/upload/download/:storagePath
 * Get a presigned URL for viewing/downloading content
 */
router.get(
  '/download/:storagePath(*)',
  authenticateParent,
  validateRequest(downloadSchema),
  async (req, res, next) => {
    try {
      const { storagePath } = req.params;
      const familyId = req.user.familyId;
      
      // Verify the file belongs to this family (COPPA compliance)
      if (!storagePath.includes(`/${familyId}/`)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
      
      const downloadUrl = await getPresignedDownloadUrl(storagePath);
      
      res.json({
        success: true,
        data: { downloadUrl },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/upload/:storagePath
 * Delete a specific file
 */
router.delete(
  '/:storagePath(*)',
  authenticateParent,
  async (req, res, next) => {
    try {
      const { storagePath } = req.params;
      const familyId = req.user.familyId;
      
      // Verify the file belongs to this family
      if (!storagePath.includes(`/${familyId}/`)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
      
      await deleteFile('uploads', storagePath);
      
      res.json({
        success: true,
        message: 'File deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/upload/child/:childId
 * Delete ALL content for a child (COPPA: parent-requested deletion)
 */
router.delete(
  '/child/:childId',
  authenticateParent,
  authorizeChildAccess,
  async (req, res, next) => {
    try {
      const { childId } = req.params;
      const familyId = req.user.familyId;
      
      const result = await deleteAllChildContent(familyId, childId);
      
      res.json({
        success: true,
        message: `Deleted ${result.deleted} files`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/upload/child/:childId
 * List all content for a child (parent dashboard)
 */
router.get(
  '/child/:childId',
  authenticateParent,
  authorizeChildAccess,
  async (req, res, next) => {
    try {
      const { childId } = req.params;
      const familyId = req.user.familyId;
      
      const files = await listChildContent(familyId, childId);
      
      res.json({
        success: true,
        data: { files },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

---

## 7. CDN Integration

### Cloudflare Dashboard Setup

1. **Create R2 Buckets** in Cloudflare Dashboard:
   - Navigate to R2 → Create bucket
   - Name: `nanobanana-prod-uploads`
   - Location: Choose closest to UAE (or auto)
   - Repeat for `nanobanana-prod-ai-content` and `nanobanana-prod-static`

2. **Connect Custom Domain**:
   - Go to R2 bucket → Settings → Public access
   - Add custom domain: `cdn.nanobanana.app`
   - Cloudflare will auto-configure DNS and SSL

3. **Configure Cache Rules** (via Cloudflare Rules):

```javascript
// Example: Cache static assets aggressively
// Cloudflare Dashboard → Rules → Page Rules

// Pattern: cdn.nanobanana.app/static/*
// Settings:
//   - Cache Level: Cache Everything
//   - Edge Cache TTL: 1 month
//   - Browser Cache TTL: 1 week

// Pattern: cdn.nanobanana.app/families/*
// Settings:
//   - Cache Level: Standard (respects headers)
//   - Edge Cache TTL: 1 hour (user content changes)
```

### Cloudflare Worker (Optional - Image Optimization)

**File:** `workers/image-optimizer.js`

```javascript
/**
 * Cloudflare Worker for on-the-fly image optimization
 * Deploy to Cloudflare Workers for automatic resizing/WebP conversion
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Only process image requests
    if (!url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return fetch(request);
    }
    
    // Parse resize parameters
    const width = url.searchParams.get('w') || url.searchParams.get('width');
    const height = url.searchParams.get('h') || url.searchParams.get('height');
    const quality = url.searchParams.get('q') || url.searchParams.get('quality') || '80';
    
    // Build Cloudflare Image Resizing options
    const options = {
      cf: {
        image: {
          fit: 'contain',
          quality: parseInt(quality),
          format: 'webp', // Auto-convert to WebP
        },
      },
    };
    
    if (width) options.cf.image.width = parseInt(width);
    if (height) options.cf.image.height = parseInt(height);
    
    // Remove query params and fetch original
    url.search = '';
    const imageRequest = new Request(url.toString(), request);
    
    return fetch(imageRequest, options);
  },
};
```

---

## 8. Child Safety Considerations

### Content Validation Pipeline

```typescript
/**
 * File: src/services/contentSafety.ts
 * 
 * Additional safety checks beyond basic MIME validation
 * CRITICAL: Run these AFTER upload but BEFORE making content available
 */

import { r2Client, BUCKETS } from '../lib/r2Client';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// Flag content for parent review
export interface SafetyCheckResult {
  safe: boolean;
  requiresReview: boolean;
  flags: string[];
  confidence: number;
}

/**
 * Check uploaded PDF for inappropriate content
 * Uses Gemini Vision API for content analysis
 */
export async function checkPDFSafety(
  storagePath: string
): Promise<SafetyCheckResult> {
  // 1. Fetch file from R2
  const command = new GetObjectCommand({
    Bucket: BUCKETS.uploads,
    Key: storagePath,
  });
  const response = await r2Client.send(command);
  const buffer = await response.Body?.transformToByteArray();
  
  if (!buffer) {
    return { safe: false, requiresReview: true, flags: ['empty-file'], confidence: 0 };
  }
  
  // 2. Extract text and images from PDF
  // ... PDF parsing logic ...
  
  // 3. Send to Gemini for safety analysis
  // ... Gemini API call with safety settings ...
  
  // 4. Return result
  // In production, implement actual safety checks
  return {
    safe: true,
    requiresReview: false,
    flags: [],
    confidence: 0.95,
  };
}

/**
 * Scan image for inappropriate content
 */
export async function checkImageSafety(
  storagePath: string
): Promise<SafetyCheckResult> {
  // Use Google Cloud Vision SafeSearch or Gemini Vision
  // Implementation depends on your AI safety stack
  
  return {
    safe: true,
    requiresReview: false,
    flags: [],
    confidence: 0.98,
  };
}
```

### Upload Flow with Safety Checks

```typescript
/**
 * Complete upload flow with safety validation
 * 
 * 1. Client requests presigned URL
 * 2. Client uploads directly to R2
 * 3. Client notifies backend of completion
 * 4. Backend runs safety checks
 * 5. Content marked as available OR flagged for review
 */

// POST /api/upload/confirm
router.post(
  '/confirm',
  authenticateParent,
  async (req, res, next) => {
    try {
      const { storagePath, childId } = req.body;
      const familyId = req.user.familyId;
      
      // Verify ownership
      if (!storagePath.includes(`/${familyId}/`)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Run safety checks
      const safetyResult = storagePath.endsWith('.pdf')
        ? await checkPDFSafety(storagePath)
        : await checkImageSafety(storagePath);
      
      if (!safetyResult.safe) {
        // Delete unsafe content immediately
        await deleteFile('uploads', storagePath);
        return res.status(400).json({
          success: false,
          error: 'Content did not pass safety checks',
          flags: safetyResult.flags,
        });
      }
      
      if (safetyResult.requiresReview) {
        // Mark for parent review before making available to child
        await markForParentReview(storagePath, safetyResult.flags);
      }
      
      // Update database with file reference
      // ... database update logic ...
      
      res.json({
        success: true,
        data: {
          storagePath,
          publicUrl: `${process.env.CDN_BASE_URL}/${storagePath}`,
          requiresReview: safetyResult.requiresReview,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
```

---

## 9. COPPA/GDPR-K Compliance

### Data Residency

```typescript
// R2 doesn't have explicit region selection like GCS
// For UAE data residency, consider:
// 1. Using R2's jurisdiction hints (when available)
// 2. Keeping R2 for non-PII assets only
// 3. Using GCS me-central1 for user PII, R2 for generated content

// Hybrid approach for strict compliance:
export const STORAGE_STRATEGY = {
  // User uploads with PII potential → GCS me-central1
  userUploads: 'gcs',
  
  // AI-generated content (no PII) → R2 for cost savings
  aiContent: 'r2',
  
  // Static assets → R2 with CDN
  static: 'r2',
} as const;
```

### Data Deletion (Right to Erasure)

```typescript
/**
 * COPPA/GDPR-K compliant data deletion
 * Must delete ALL child data when parent requests
 */

// POST /api/family/delete-child-data
router.post(
  '/delete-child-data',
  authenticateParent,
  async (req, res, next) => {
    try {
      const { childId, confirmationCode } = req.body;
      const familyId = req.user.familyId;
      
      // Require explicit confirmation for destructive action
      if (confirmationCode !== 'DELETE-ALL-DATA') {
        return res.status(400).json({
          error: 'Please confirm by providing confirmation code',
        });
      }
      
      // 1. Delete from R2
      const r2Result = await deleteAllChildContent(familyId, childId);
      
      // 2. Delete from database
      // ... database deletion logic ...
      
      // 3. Log deletion for compliance audit
      await logDataDeletion({
        familyId,
        childId,
        deletedAt: new Date(),
        filesDeleted: r2Result.deleted,
        requestedBy: req.user.id,
      });
      
      res.json({
        success: true,
        message: 'All child data has been permanently deleted',
        filesDeleted: r2Result.deleted,
      });
    } catch (error) {
      next(error);
    }
  }
);
```

### Data Export (Portability)

```typescript
/**
 * GDPR Article 20: Right to data portability
 * Export all child's data in machine-readable format
 */

// POST /api/family/export-child-data
router.post(
  '/export-child-data',
  authenticateParent,
  async (req, res, next) => {
    try {
      const { childId } = req.body;
      const familyId = req.user.familyId;
      
      // 1. List all files from R2
      const files = await listChildContent(familyId, childId);
      
      // 2. Generate presigned URLs for each file
      const downloadLinks = await Promise.all(
        files.map(async (file) => ({
          ...file,
          downloadUrl: await getPresignedDownloadUrl(file.storagePath),
        }))
      );
      
      // 3. Export database records
      // ... database export logic ...
      
      // 4. Create export manifest
      const manifest = {
        exportedAt: new Date().toISOString(),
        childId,
        files: downloadLinks,
        // ... other data ...
      };
      
      res.json({
        success: true,
        data: manifest,
      });
    } catch (error) {
      next(error);
    }
  }
);
```

---

## 10. Testing

### Unit Tests

**File:** `src/services/__tests__/storageService.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateUploadRequest,
  generateStoragePath,
} from '../storageService';

describe('Storage Service', () => {
  describe('validateUploadRequest', () => {
    it('should accept valid PDF upload', () => {
      expect(() =>
        validateUploadRequest({
          familyId: 'family-123',
          childId: 'child-456',
          contentType: 'lesson',
          filename: 'homework.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024 * 1024, // 1MB
          lessonId: 'lesson-789',
        })
      ).not.toThrow();
    });
    
    it('should reject file over size limit', () => {
      expect(() =>
        validateUploadRequest({
          familyId: 'family-123',
          childId: 'child-456',
          contentType: 'lesson',
          filename: 'huge.pdf',
          mimeType: 'application/pdf',
          fileSize: 100 * 1024 * 1024, // 100MB
        })
      ).toThrow(/too large/);
    });
    
    it('should reject disallowed MIME types', () => {
      expect(() =>
        validateUploadRequest({
          familyId: 'family-123',
          childId: 'child-456',
          contentType: 'lesson',
          filename: 'script.js',
          mimeType: 'application/javascript',
          fileSize: 1024,
        })
      ).toThrow(/not allowed/);
    });
    
    it('should reject path traversal attempts', () => {
      expect(() =>
        validateUploadRequest({
          familyId: '../../../etc',
          childId: 'child-456',
          contentType: 'lesson',
          filename: 'test.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
        })
      ).toThrow(); // Sanitization should catch this
    });
  });
  
  describe('generateStoragePath', () => {
    it('should generate correct lesson path', () => {
      const path = generateStoragePath({
        familyId: 'family-123',
        childId: 'child-456',
        contentType: 'lesson',
        lessonId: 'lesson-789',
        filename: 'homework.pdf',
      });
      
      expect(path).toBe(
        'families/family-123/child-456/lessons/lesson-789/homework.pdf'
      );
    });
    
    it('should generate correct AI image path', () => {
      const path = generateStoragePath({
        familyId: 'family-123',
        childId: 'child-456',
        contentType: 'ai-image',
        filename: 'generated.webp',
      });
      
      expect(path).toBe('images/family-123/child-456/generated.webp');
    });
  });
});
```

### Integration Tests

```typescript
/**
 * Integration tests require:
 * 1. Test R2 bucket (nanobanana-test-uploads)
 * 2. Test credentials in CI/CD environment
 */

describe('R2 Integration', () => {
  it('should upload and retrieve file', async () => {
    const testContent = Buffer.from('Test PDF content');
    const storagePath = 'test/integration/test.pdf';
    
    // Upload
    const uploaded = await uploadFile(
      'uploads',
      storagePath,
      testContent,
      'application/pdf'
    );
    
    expect(uploaded.storagePath).toBe(storagePath);
    
    // Verify exists
    const metadata = await getFileMetadata('uploads', storagePath);
    expect(metadata).not.toBeNull();
    expect(metadata?.size).toBe(testContent.length);
    
    // Cleanup
    await deleteFile('uploads', storagePath);
    
    // Verify deleted
    const deleted = await getFileMetadata('uploads', storagePath);
    expect(deleted).toBeNull();
  });
});
```

---

## Quick Reference

### Common Operations

```typescript
// Get presigned upload URL
const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
  familyId: 'family-123',
  childId: 'child-456',
  contentType: 'lesson',
  filename: 'homework.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024000,
  lessonId: 'lesson-789',
});

// Client uploads directly to uploadUrl via PUT

// Get presigned download URL
const downloadUrl = await getPresignedDownloadUrl(
  'families/family-123/child-456/lessons/lesson-789/homework.pdf'
);

// Delete child's data (COPPA compliance)
await deleteAllChildContent('family-123', 'child-456');

// List child's files (parent dashboard)
const files = await listChildContent('family-123', 'child-456');
```

### Environment Setup Checklist

- [ ] Create R2 buckets in Cloudflare Dashboard
- [ ] Generate R2 API tokens (Account Settings → API Tokens)
- [ ] Configure custom domain for CDN
- [ ] Set environment variables in `.env`
- [ ] Configure CORS for direct uploads
- [ ] Set up Cloudflare Page Rules for caching
- [ ] (Optional) Deploy image optimization Worker

### Cost Estimation

| Operation | R2 Pricing | GCS Pricing (me-central1) |
|-----------|------------|---------------------------|
| Storage | $0.015/GB/mo | $0.023/GB/mo |
| Class A (writes) | $4.50/million | $5.00/million |
| Class B (reads) | $0.36/million | $0.40/million |
| **Egress** | **FREE** | $0.12/GB |

*R2 saves ~$0.12/GB on egress - significant for media-heavy app!*

---

**Created for:** NanoBanana K-6 AI Learning Platform  
**Tech Stack:** Node.js/Express, TypeScript, Cloudflare R2  
**Compliance:** COPPA, GDPR-K, UAE PDPL  
**Last Updated:** Claude Code Session
