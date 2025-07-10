const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    //console.log("Token received in middleware:", token);

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        
        req.user = { 
            _id: decoded._id || decoded.userId,
            familyId: decoded.familyId,
        };

        next();
    } catch (err) {
        console.error("JWT verification error:", err.message);
        return res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = authMiddleware;
