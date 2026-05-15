let _cloudinary = null;

function getCloudinary() {
  if (!_cloudinary) {
    _cloudinary = require('cloudinary').v2;
    _cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  return _cloudinary;
}
//чтобы не повторять код, создаем универсальную функцию для загрузки буфера с разными опциями

const uploadBuffer = (buffer, options) => {
  const cloudinary = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
    stream.end(buffer);
  });
};

const uploadAvatar = (buffer, userId) =>
  uploadBuffer(buffer, {
    folder:        'workstudy/avatars',
    public_id:     `user_${userId}`,
    overwrite:     true,
    resource_type: 'image',
    transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
  });

const uploadResume = (buffer, userId) =>
  uploadBuffer(buffer, {
    folder:        'workstudy/resumes',
    public_id:     `resume_${userId}`,
    overwrite:     true,
    resource_type: 'raw',
  });

const uploadLogo = (buffer, identifier) =>
  uploadBuffer(buffer, {
    folder:        'workstudy/logos',
    public_id:     `logo_${identifier}`,
    overwrite:     true,
    resource_type: 'image',
    transformation: [{ width: 256, height: 256, crop: 'pad', background: 'white' }],
  });

module.exports = { uploadAvatar, uploadResume, uploadLogo };
