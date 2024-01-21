const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create SubSection

exports.createSubSection = async (req, res) => {
  try {
    // fetch data from Request Body

    const { sectionId, title, timeDuration, description } = req.body;

    // extract File or Video
    const video = req.files.videoFile;

    // Validation
    if (!sectionid || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }
    // upload video to cloudinary

    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    // create a sub section
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    // update section with this sub section ObjectID
    const updatedSection = await Section.findByIdAndUpdate(
      {
        _id: sectionId,
      },
      {
        $push: {
          subSection: SubSectionDetails._id,
        },
      },
      { new: true }
    );

    // TODO: log updated section here, after adding populate query
    // return response
    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successfully",
      updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// TODO: update SubSection 

// TODO: delete SubSection
