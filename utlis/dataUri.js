const DataUriParser = require("datauri/parser.js");
const path  = require("path");

const parser = new DataUriParser();

const GetDataUri = (file) => {
    const extname = path.extname(file.originalname).toString(); 
    return parser.format(extname, file.buffer).content;
}

module.exports = GetDataUri;
