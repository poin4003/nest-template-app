import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

function createMulterMock(filePath: string): Express.Multer.File {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const fileStats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const uploadDir = path.dirname(filePath);
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';

  return {
    fieldname: 'file',
    originalname: fileName,
    encoding: '7bit',
    mimetype: mimeType,
    destination: uploadDir,
    filename: fileName,
    path: filePath,
    size: fileStats.size,
    buffer: fs.readFileSync(filePath),
    stream: fs.createReadStream(filePath),
  } as Express.Multer.File;
}

export function getFileFromPath(absolutePath: string): Express.Multer.File {
  return createMulterMock(absolutePath);
}

export function getFileFromName(fileName: string, subFolder: string = ''): Express.Multer.File {
  const uploadDir = path.join(process.cwd(), 'uploads', subFolder);
  const filePath = path.join(uploadDir, fileName);
  return createMulterMock(filePath);
}

export function getSmartFile(inputPathOrName: string): Express.Multer.File {
  if (path.isAbsolute(inputPathOrName)) {
    return getFileFromPath(inputPathOrName);
  }
  
  return getFileFromName(inputPathOrName);
}
