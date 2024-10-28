import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { mkdir } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

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
      cb(null, `${uuid()}${extname(file.originalname)}`);
    },
  }),
};
