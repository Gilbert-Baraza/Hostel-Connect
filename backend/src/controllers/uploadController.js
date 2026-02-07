const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.uploadHostelImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'hostel-connect/hostels';

    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadBufferToCloudinary(file.buffer, {
          folder,
          resource_type: 'image'
        })
      )
    );

    const images = uploads.map((item) => ({
      url: item.secure_url,
      publicId: item.public_id,
      width: item.width,
      height: item.height,
      format: item.format,
      bytes: item.bytes
    }));

    return res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: { images }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
};
