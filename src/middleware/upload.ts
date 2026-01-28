import multer from 'multer';

const storage = multer.memoryStorage(); // Guardamos en memoria RAM temporalmente

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (Criterio de Aceptación)
  },
  fileFilter: (req, file, cb) => {
    // Validación de tipo (Criterio de Aceptación)
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Solo se aceptan archivos PDF.'));
    }
  },
});