const Tag = require("../models/tags");

// create Tag handler function

exports.createTag = async (req, res) => {
  try {
    // fetch data
    const { name, description } = req.body;

    // validation

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // create entry in DB

    const tagDetails = Tag.create({
      name: name,
      description: description,
    });
    console.log(tagDetails);

    // return response
    return res.status(200).json({
      success: true,
      message: "Tag Created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Tag not create Problem",
    });
  }
};

// get All Tags handler function

exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true });

    return res.status(200).json({
      success: true,
      message: "All Tags Access Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "All Tags access Problem",
    });
  }
};
