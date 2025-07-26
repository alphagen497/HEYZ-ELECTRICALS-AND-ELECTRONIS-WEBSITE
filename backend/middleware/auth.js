// middleware/auth.js
const jwt = require("jsonwebtoken");

// ✅ Middleware to authenticate token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role? }
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ✅ Middleware to restrict to admin only (if role system is used)
const isAdmin = (req, res, next) => {
  // If you later add `role: "admin"` in your JWT payload during login
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// Optional: general role-based access (if needed in future)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions." });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  authorizeRoles, // optional, for flexibility
};
