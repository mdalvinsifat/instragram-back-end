const jwt = require("jsonwebtoken");

exports.IsAuthentics = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT);
    req.userId = decoded.userId; // <-- THIS IS IMPORTANT

    next();
  } catch (error) {
    console.error("Error in IsAuthentics middleware:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
