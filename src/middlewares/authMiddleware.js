const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/user");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenUtils");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken) {
    // if no token provided, return 401
    return res.status(401).json({ msg: "No token provided" });
  }
  try {
    const decoded = jwt.verify(accessToken, config.get("jwtAuthSecret"));
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ msg: "Refresh token missing" });
      }
      try {
        const decodedUser = jwt.verify(
          refreshToken,
          config.get("jwtRefreshSecret")
        );
        const user = await User.findById(decodedUser.id);
        if (!user || user.refreshToken.token !== refreshToken) {
          return res.status(401).json({ msg: "Invalid refresh token" });
        }
        if (new Date() > user.refreshToken.expiresAt) {
          return res.status(401).json({ msg: "Refresh token expired" });
        }
        const newAccessToken = generateAccessToken(user);

        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        };
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 6 * 60 * 60 * 1000,
        });
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        req.user = jwt.verify(newAccessToken, config.get("jwt_access_secret"));
        next();
      } catch (err) {
        console.log("Error occured when verifying refresh token %o", err);
        return res
          .status(401)
          .json({ msg: "Invalid or expired refresh token" });
      }
    } else {
      console.log("Error occured when verifying token %o", err);
      return res.status(403).json({ msg: "Forbidden access" });
    }
  }
}

module.exports = authMiddleware;
