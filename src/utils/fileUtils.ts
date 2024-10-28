export const resolveFileServePath = (file: Express.Multer.File) => {
  return file.destination.slice(1) + '/' + file.filename;
};
