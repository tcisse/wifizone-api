const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('./errorHandler');
const { ERROR_CODES, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } = require('../config/constants');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        ERROR_CODES.VALIDATION_ERROR,
        'Type de fichier non autorisé. Seulement JPG, JPEG et PNG sont acceptés.',
        400
      ),
      false
    );
  }
};

// File filter for CSV
const csvFileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        ERROR_CODES.VALIDATION_ERROR,
        'Type de fichier non autorisé. Seulement CSV est accepté.',
        400
      ),
      false
    );
  }
};

// Upload configurations
const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const uploadCsv = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// KYC documents upload (3 files: idFront, idBack, selfie)
const uploadKycDocuments = uploadImage.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

// Single image upload
const uploadSingleImage = uploadImage.single('image');

// Single CSV upload
const uploadSingleCsv = uploadCsv.single('file');

module.exports = {
  uploadKycDocuments,
  uploadSingleImage,
  uploadSingleCsv,
  uploadImage,
  uploadCsv,
};
