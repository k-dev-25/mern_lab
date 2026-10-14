import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export default async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-secret",
    );
    const customer = await Customer.findById(decoded.id);
    if (!customer)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    req.user = customer;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
