const Profile = require("../models/Profile");
const User = require("../models/User");
const path = require("path");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

exports.updateProfile = async (req, res) => {
  try {
    // get data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    // get user ID
    const id = req.user.id;

    // validation
    if (!contactNumber || !gender || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required",
      });
    }

    // find Profile
    const userDetails = await User.findById(id).populate("additionalDetails");
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    // update Profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    // return response
    return res.status(200).json({
      success: true,
      message: "Profile Update Successfully",
      // userDetails
    });
  } catch (error) {
    console.log("***error is *** ", error);
    return res.status(500).json({
      success: false,
      message: "Profile Updation Problem",
      error,
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
      userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Can't deleted Successfully",
      error: error.message,
    });
  }
};

// get All User Details handler function

exports.getUserDetails = async (req, res) => {
  try {
    // get id

    const id = req.user.id;

    // validatoin and get user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    // return response

    return res.status(200).json({
      success: true,
      message: "User data Fetched Successfully",
      userDetails,
    });
  } catch (error) {
    // console.error("***Get UserDetails Error***", error);
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
  // const options = { folder };
  // const public_id = file.name;
  return await cloudinary.uploader.upload(
    file.tempFilePath,

    {
      public_id: `${folder}/${file.name}`,
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
    // **** Store on Cloudinary ****

    // fetch data from Request

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
    // console.log("***your response*** ", response);

    // **** update profile picture into user ******

    // fetch request data

    const id = req.user.id;

    const userDetails = await User.findByIdAndUpdate(
      id,
      {
        image: response.url,
      },
      { new: true }
    );
    // .then((updatedUser) => {
    //   console.log("User Update Successfully : ", updatedUser);
    // })
    // .catch((error) => {
    //   console.error("User Image Update Error : ", error);
    // });

    return res.status(200).json({
      success: true,
      message: "Image Successfully Update",
      userDetails,
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
