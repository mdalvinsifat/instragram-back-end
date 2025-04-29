const multer = require("multer");

exports.uploads = multer({
    storage: multer.memoryStorage()
});