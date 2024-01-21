const Section = require("../models/Section");
const Course = require("../models/Course");

// create section handler
exports.createSection = async (req, res) => {
  try {
    // data fetch

    const { sectionName, courseId } = req.body;
    // data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }
    // create Section

    const newSection = await Section.create({ sectionName });
    // update course with section ObjectID
    const updatedCourseDetails = await Course.findOneAndUpdate(
      courseId,
      {
        $push: { coursContent: newSection._id },
      },
      { new: true }
    );
    // TODO: use populate to replace section/sub-section both in the updatedCourseDetails

    //return response

    return res.status(200).json({
      success: true,
      message: "Section created Successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Course Creation Process Failed Check it",
    });
  }
};

// upadate Section details handler
exports.updateSection = async (req, res) => {
  try {
    // fetch data input

    const { sectionName, sectionId } = req.body;

    // data validition
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    // update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    // return res
    return res.status(200).json({
      success: true,
      message: "Section Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Course Updation Process Failed Check it",
    });
  }
};

// deleted section handler
exports.deleteSection = async (req, res) => {
  try {
    // get ID - params me id aa rahi hai
    const { sectionId } = req.params;

    // use findByIdandDelete
    await Section.findByIdAndDelete(sectionId);

    // TODO[testing]: do we need to delte the entry from the course schema ??

    // return respone
    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete Section, Please try Again",
      error: error.message,
    });
  }
};
