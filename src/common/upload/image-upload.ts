import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;
const UPLOADS_ROOT = join(process.cwd(), 'uploads');

function ensureDirectoryExists(path: string) {
  mkdirSync(path, { recursive: true });
}

function buildFilename(originalname: string) {
  const extension = extname(originalname).toLowerCase();
  return `${randomUUID()}${extension}`;
}

export function buildImageUploadOptions(folder: string): MulterOptions {
  const destination = join(UPLOADS_ROOT, folder);
  ensureDirectoryExists(destination);

  // `multer` is runtime-safe here, but its callback typing is looser than this
  // project's strict ESLint setup, so we isolate that boundary in one place.

  const storage = diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      callback: (error: Error | null, destinationPath: string) => void,
    ) => {
      callback(null, destination);
    },
    filename: (
      _req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      callback(null, buildFilename(file.originalname));
    },
  });

  return {
    storage,
    limits: {
      fileSize: MAX_IMAGE_SIZE_IN_BYTES,
    },
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
        callback(
          new BadRequestException(
            'Only image uploads are allowed (jpeg, png, webp, gif)',
          ),
          false,
        );
        return;
      }

      callback(null, true);
    },
  };
}

export function buildPublicUploadPath(
  folder: string,
  filename: string,
): string {
  return `/uploads/${folder}/${filename}`;
}
