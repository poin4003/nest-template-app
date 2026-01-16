import { diskStorage } from 'multer';
import { join } from 'path';

export const storageConfig = diskStorage({
	destination: (req, file, cb) => {
		cb(null, join(process.cwd(), 'src/uploads'));
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});
