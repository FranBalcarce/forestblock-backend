const jwt = require("jsonwebtoken");
const User = require("../users/userModel");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) return res.status(401).json({ message: "No autorizado" });

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token no válido" });
    }
  } else {
    res.status(401).json({ message: "No autorizado, no hay token" });
  }
};
