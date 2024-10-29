import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { mkdir } from 'fs';
import { diskStorage } from 'multer';
import { extname as ext } from 'path';
import { v4 as uuid } from 'uuid';

const isImage = (filename?: string, mimetype?: string) => {
  if (!filename || !mimetype) return false;
  const filetypes = /jpg|jpeg|png|webp/;
  return (
    filetypes.test(ext(filename).toLowerCase()) && filetypes.test(mimetype)
  );
};

const isVideo = (filename: string, mimetype: string) => {
  const filetypes = /mp4|mov|avi|mkv/;
  return (
    filetypes.test(ext(filename).toLowerCase()) && filetypes.test(mimetype)
  );
};

export const profileStorageOptions: MulterOptions = {
  storage: diskStorage({
    destination: function (_, file, cb) {
      const dir =
        file.fieldname === 'avatar'
          ? './static/user/avatar'
          : './static/user/cover';
      mkdir(dir, { recursive: true }, () => {
        cb(null, dir);
      });
    },
    filename: (_, file, cb) => {
      cb(null, `${uuid()}${ext(file.originalname)}`);
    },
  }),
  fileFilter: (_, file, cb) => {
    if (isImage(file.originalname, file.mimetype)) {
      return cb(null, true);
    }
    return cb(new BadRequestException('Error: Images only'), false);
  },
};

export const postStorageOptions: MulterOptions = {
  storage: diskStorage({
    destination: function (_, file, cb) {
      const dir =
        file.fieldname === 'video'
          ? './static/user/video'
          : './static/user/thumbnail';
      mkdir(dir, { recursive: true }, () => {
        cb(null, dir);
      });
    },
    filename: (_, file, cb) => {
      cb(null, `${uuid()}${ext(file.originalname)}`);
    },
  }),
  fileFilter: (_, file, cb) => {
    if (file.fieldname === 'video') {
      if (isVideo(file.originalname, file.mimetype)) {
        return cb(null, true);
      }
      return cb(new BadRequestException('Error: wrong video format'), false);
    }
    if (isImage(file.originalname, file.mimetype)) {
      return cb(null, true);
    }
    return cb(new BadRequestException('Error: thumbnail must be image'), false);
  },
};
