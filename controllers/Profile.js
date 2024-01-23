const Profile = require("../models/Profile");
const User = require("../models/User");
const path = require("path");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

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
    const id = req.user.id;

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
      userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

function isFileTypeSupported(fileExtension, supportedTypes) {
  return supportedTypes.includes(fileExtension);
}

async function uploadFileToCloudinary(file, folder) {
  const options = { folder };
  const public_id = file.name;
  return await cloudinary.uploader.upload(
    file.tempFilePath,

    {
      public_id: `${}`,
      overwrite: true,
    },
    (error, result) => {
      if (error) {
        console.error("Upload Error: ", error);
      } else {
        console.log("Upload Successfully: ", result);
      }
    }
  );
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    // fetch data from Request

    // const id = req.user.id;

    // const userDetails = await User.findById(id);

    const file = req.files.displayPicture;
    console.log("file is : ", file);

    // find fileExtension
    const parts = file.name.split(".");

    const fileExtension = parts[parts.length - 1];
    console.log("File Types: ", fileExtension);

    // validation
    const supportedTypes = ["jpg", "jpeg", "png"];

    if (!isFileTypeSupported(fileExtension, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: "FileExtension is not supported",
      });
    }

    // File Type Supported

    // upload Cloudinary

    const response = await uploadFileToCloudinary(
      file,
      process.env.FOLDER_NAME
    );
    console.log("***your response*** ", response);

    return res.status(200).json({
      success: true,
      message: "Image Successfully Update",
      // userDetails,
    });
  } catch (error) {
    console.error("Your ProfileImage update error : ", error);
    return res.status(500).json({
      success: false,
      message: "ProfileImage Update Problem Occured",
    });
  }
};
exports.getEnrolledCourses = async (req, res) => {};

exports.localUpload = async (req, res) => {
  try {
    // fetch data from request body

    // console.log("Your Request body is : ",req.files);
    // console.log("Your Request body id is : ",req.user.id);

    const files = req.files;

    // create path

    // console.log("*** path *** ", path);
    const uploadPath = path.join(
      __dirname,
      "..",
      "UploadFiles",
      files.displayPicture.name
    );

    // move file in this path
    files.displayPicture.mv(uploadPath, (error) => {
      if (error) {
        console.log("Your uploadFile error : ", error);
      }
    });

    // return response
    return res.status(200).json({
      success: true,
      message: "Local Machine upload successfully",
    });
  } catch (error) {
    console.log("***LocalUpload Problem*** ", error);
    return res.status(500).json({
      success: false,
      message: "Local machine Upload Problem",
    });
  }
};
