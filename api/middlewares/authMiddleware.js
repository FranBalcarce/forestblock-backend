import jwt from "jsonwebtoken";
import User from "../users/userModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select(
        "-security.password -security.otp -security.otpExpires",
      );

      if (!user) {
        return res.status(401).json({ message: "No autorizado" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Token no válido" });
    }
  } else {
    return res.status(401).json({ message: "No autorizado, no hay token" });
  }
};
