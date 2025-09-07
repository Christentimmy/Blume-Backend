
// src/utils/generateThumbnail.ts
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobe from 'ffprobe-static';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobe.path);

const generateThumbnail = (videoPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const thumbnailsDir = path.join(process.cwd(), 'uploads', 'thumbnails');

    // Ensure directory exists
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    const thumbnailFilename = `${uuidv4()}.jpg`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: thumbnailsDir,
        filename: thumbnailFilename,
        size: '320x240',
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', reject);
  });
};

export default generateThumbnail;
