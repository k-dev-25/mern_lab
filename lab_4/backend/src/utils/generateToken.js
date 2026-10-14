import jwt from "jsonwebtoken";

export default function generateToken(customerId) {
  return jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || "development-secret",
  );
}
