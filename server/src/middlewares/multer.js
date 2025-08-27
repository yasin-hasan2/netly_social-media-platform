import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

export default upload;
// This middleware uses multer to handle file uploads in memory.
// It can be used in routes to handle file uploads, such as profile pictures or other media.
