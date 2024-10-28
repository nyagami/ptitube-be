import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

export const saveFile = async (name: string, file: Express.Multer.File) => {
  const filename = `${name}-${new Date().getTime()}.png`;
  const dir = join(__dirname, '..', '..', 'static');
  mkdirSync(dir, { recursive: true });
  const filePath = join(__dirname, '..', '..', 'static', 'avatar', filename);
  writeFileSync(filePath, file.buffer, { encoding: 'binary' });
  const staticPath = '/static/avatar/' + filename;
  return staticPath;
};
