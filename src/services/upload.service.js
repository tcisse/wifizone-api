const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file to Cloudflare R2
 * @param {string} filePath - Local file path
 * @param {string} folder - Folder in bucket (e.g., 'kyc', 'tickets')
 * @returns {string} File URL
 */
const uploadFile = async (filePath, folder = 'uploads') => {
  try {
    const fileContent = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const fileName = `${folder}/${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: fileName,
      Body: fileContent,
      ContentType: getContentType(ext),
    });

    await s3Client.send(command);

    // Clean up local file
    await fs.unlink(filePath);

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    logger.info(`File uploaded to R2: ${fileUrl}`);

    return fileUrl;
  } catch (error) {
    logger.error('Error uploading file to R2:', error);
    throw error;
  }
};

/**
 * Upload multiple files to Cloudflare R2
 * @param {Array} files - Array of file paths
 * @param {string} folder - Folder in bucket
 * @returns {Array} Array of file URLs
 */
const uploadMultipleFiles = async (files, folder = 'uploads') => {
  const uploadPromises = files.map((file) => uploadFile(file, folder));
  return await Promise.all(uploadPromises);
};

/**
 * Delete file from Cloudflare R2
 * @param {string} fileUrl - File URL
 */
const deleteFile = async (fileUrl) => {
  try {
    // Extract key from URL
    const key = fileUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    logger.info(`File deleted from R2: ${fileUrl}`);
  } catch (error) {
    logger.error('Error deleting file from R2:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Cloudflare R2
 * @param {Array} fileUrls - Array of file URLs
 */
const deleteMultipleFiles = async (fileUrls) => {
  const deletePromises = fileUrls.map((url) => deleteFile(url));
  return await Promise.all(deletePromises);
};

/**
 * Get content type from file extension
 * @param {string} ext - File extension
 * @returns {string} Content type
 */
const getContentType = (ext) => {
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.csv': 'text/csv',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
};

/**
 * Upload KYC documents
 * @param {Object} files - Files object from multer
 * @param {string} userId - User ID
 * @returns {Object} Object with document URLs
 */
const uploadKycDocuments = async (files, userId) => {
  const folder = `kyc/${userId}`;
  const documents = {};

  if (files.idFront && files.idFront[0]) {
    documents.idFront = await uploadFile(files.idFront[0].path, folder);
  }

  if (files.idBack && files.idBack[0]) {
    documents.idBack = await uploadFile(files.idBack[0].path, folder);
  }

  if (files.selfie && files.selfie[0]) {
    documents.selfie = await uploadFile(files.selfie[0].path, folder);
  }

  return documents;
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  uploadKycDocuments,
};
