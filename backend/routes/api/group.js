const express = require("express");
const router = express.Router();

const { Group, User, GroupImage, sequelize } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");

const validateGroup = [
  check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 60 })
    .withMessage("Name must be 60 characters or less"),
  check("about")
    .exists({ checkFalsy: true })
    .isLength({ min: 50 })
    .withMessage("About must be 50 characters or more"),
  check("type")
    .exists({ checkFalsy: true })
    .isIn(["Online", "In person"])
    .withMessage("Type must be 'Online' or 'In person'"),
  check("private")
    .exists({ checkFalsy: true })
    .isIn([true, false])
    .withMessage("Private must be a boolean"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  handleValidationErrors,
];
// get all groups;
router.get("/", async (req, res, next) => {
  const groups = await Group.findAll({
    include: {
      model: User,
      attributes: [],
    },
    group: "organizerId",
    attributes: [
      "id",
      "organizerId",
      "name",
      "about",
      "type",
      "private",
      "city",
      "state",
      "createdAt",
      "updatedAt",
      [sequelize.fn("COUNT"), "numMembers"],
    ],
  });

  let result = {};
  result.Groups = [];

  for (let i = 0; i < groups.length; i++) {
    let group = groups[i].toJSON();
    let id = group.id;
    console.log(id);
    const image = await GroupImage.findOne({
      where: {
        id,
        preview: true,
      },
    });
    if (!image) {
      group.previewImage = null;
    } else {
      group.previewImage = image.toJSON().url;
    }
    result.Groups.push(group);
  }

  res.json(result);
});

// create a group;
router.post("/", requireAuth, validateGroup, async (req, res, next) => {
  const { name, about, type, private, city, state } = req.body;
  const newGroup = await Group.create({
    organizerId: req.user.id,
    name,
    about,
    type,
    private,
    city,
    state,
  });
  res.json(newGroup);
});

// Add an image to a group based onthe gorup's id
router.post("/:groupId/images", requireAuth, async (req, res, next) => {
  const groupId = req.params.groupId;
  console.log(groupId);
  const { url, preview } = req.body;
  const group = await Group.findByPk(groupId);

  if (!group) {
    // const err = new Error("Group couldn't be found");
    // err.status = 404;
    res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  } else {
    let newImage = await GroupImage.create({
      groupId,
      url,
      preview,
    });

    newImage = newImage.toJSON();
    let result = {};
    result.id = newImage.id;
    result.url = newImage.url;
    result.preview = newImage.preview;

    res.json(result);
  }
});

module.exports = router;
