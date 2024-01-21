const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    // get data
    const { dateofBirth = "", about = "", contactNumber, gender } = req.body;

    // get user ID
    const id = req.user.id;

    // validation
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required",
      });
    }

    // find Profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    // update Profile
    profileDetails.dateOfBirth = dateofBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    // return response
    return res.status(200).json({
      success: true,
      message: "Profile Update Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile Updation Problem",
    });
  }
};

// delete account handler function
exports.deleteAccount = async (req, res) => {
  try {
    // get id
    const id = res.user.id;

    // validation
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // delete profile

    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    // TODO: unenroll user form all enrolled courses

    // delete user
    await User.findByIdAndDelete({ _id: id });

    // return response
    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Can't deleted Successfully",
    });
  }
};

// get All User Details handler function

exports.getAllUserDetails = async (req, res) => {
  try {
    // get id

    const id = req.user.id;

    // validatoin and get user details
    const userDetails = await User.findById(id)
      .populate("addtionalDetails")
      .exec();

    // return response

    return res.status(200).json({
      success: true,
      message: "User data Fetched Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
