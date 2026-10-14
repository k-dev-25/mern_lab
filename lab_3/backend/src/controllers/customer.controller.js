import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import generateToken from "../utils/generateToken.js";

const cookieOptions = {
  httpOnly: true,
};

async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body || {};
    if (!fullName || !email || !password || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }
    if (await Customer.exists({ email: email.toLowerCase() })) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const customer = await Customer.create({
      fullName,
      email,
      password: await bcrypt.hash(password, 10),
      phone,
    });
    const customerDetails = customer.toObject();
    delete customerDetails.password;
    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: customerDetails,
    });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const customer =
      email && (await Customer.findOne({ email: email.toLowerCase() }));
    if (
      !customer ||
      !password ||
      !(await bcrypt.compare(password, customer.password))
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    res.cookie("token", generateToken(customer._id.toString()), cookieOptions);
    const customerDetails = customer.toObject();
    delete customerDetails.password;
    res.json({
      success: true,
      message: "Login successful",
      customer: customerDetails,
    });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  const customerDetails = req.user.toObject();
  delete customerDetails.password;
  res.json(customerDetails);
}

function logout(req, res) {
  res.clearCookie("token", cookieOptions);
  res.json({ success: true, message: "Logged out successfully" });
}

export { register, login, me, logout };
