const bcrypt = require("bcrypt");

const User = require("../models/User");
const OTP = require("../models/OTP");

const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

//sendOTP

exports.sendOTP = async (req, res) => {
  try {
    // fetch email from request ki body

    const { email } = req.body;

    // check if user already exist

    const checkUserPresent = await User.findOne({ email });

    // if user already exist , then return a response

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User Already Registered",
      });
    }

    // generate OTP

    var otp = otpGenerator.generate(6, {
      uppperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP generated: ", otp);

    // check unique otp or not
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        uppperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    // create an entry for OTP
    const otpBody = await OTP.create(otpPayload);

    console.log("Your otpBody is : ", otpBody);

    // return response successful
    res.status(200).json({
      success: true,
      message: "OTP sent Successfully",
      otp,
    });
  } catch (error) {
    console.log("Your OTP error: ", error);
    return res.status(500).json({
      success: false,
      message: "OTP couldn't sent",
    });
  }
};

// signUP

exports.signUP = async (req, res) => {
  try {
    // data fetch from request ki body

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp,
    } = req.body;

    console;
    // validate krlo
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2 password match krlo

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and ConfirmPassword Value does not match, please try again",
      });
    }

    // check user already exist or not
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already Registered",
      });
    }

    // find most recent OTP stored for the user
    const recentOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOTP);

    // validate OTP
    if (recentOTP.length == 0) {
      // OTP not found
      if (recentOTP.length == 0) {
        // OTP not found
        return res.status(400).json({
          success: false,
          message: "OTP found",
        });
      } else if (otp !== recentOTP.otp) {
        // Invalid OTP
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }
    }

    // Hash Password
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password;

    // entry create in DB
    const profileDetails = await Profile.create({
      gender: null,
      dateofBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,

      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // return res
    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
    });
  } catch (error) {
    console.log("**** Your error to SignUP : ", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again",
    });
  }
};

// Login

exports.login = async (req, res) => {
  try {
    // get data from req body
    const { email, password } = req.body;

    // validation data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required, please try again",
      });
    }
    // user check exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please SignUP first",
      });
    }
    // generate JWT, after password matching

    // await bcrypt.compare(password, user.password)
    if (password == user.password) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.password = password; 
      await user.save();
      user.token = token;
     

      // create cookie and send response

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged In Successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, Please try again",
    });
  }
};

//ChangePassword

exports.changePassword = async (req, res) => {
  // get data from req body
  // get oldPassword, newPassword, confirmPassword
  // validation
  // update pwd in DB
  // send mail - Password updated
  // return response
};
