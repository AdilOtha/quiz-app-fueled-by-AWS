const AWS_JWT_VERIFY = require("aws-jwt-verify");

// Verifier that expects valid access tokens:
const verifier = AWS_JWT_VERIFY.CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_APP_CLIENT_ID,
});

// middleware to verify JWT tokens using aws-jwt-verify
const verifyJwt = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const payload = await verifier.verify(token);
    console.log("Token is valid. Payload:", payload);    
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = verifyJwt;