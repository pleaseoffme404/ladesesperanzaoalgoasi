const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Formato de imagen no válido. Solo se permite .jpg o .png'), false);
    }
};

const uploadPerfil = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 2 }
});

module.exports = uploadPerfil.single('imagen_perfil');