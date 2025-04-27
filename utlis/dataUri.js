const DataUriParser = require("datauri/parser.js")
const path  = require("path")

const Parser = new DataUriParser()

const GetDataUri = (file) =>{
    const extname = path.extname(file.originalname).toString
    return Parser.format(extname, file.buffer).content
}

module.exports = GetDataUri
