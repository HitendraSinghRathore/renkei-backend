const { body } = require("express-validator");

const signupRules = function () {
  return [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    body("phone")
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage("Please provide a valid phone number"),
  ];
};

const loginRules = function () {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};
const profileUpdateRules = function () {
  return [
    body("id").trim().notEmpty().withMessage("User id is required"),
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("phone")
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage("Please provide a valid phone number"),
  ];
};

const projectFetchRules = function () {
  return [
    query("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Project name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Project name must be between 2 and 50 characters"),

    query("status")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Project status is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Project status must be between 2 and 50 characters"),

    query("page")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Page number is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Page number must be between 2 and 50 characters"),

    query("limit")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Limit is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Limit must be between 2 and 50 characters"),
  ];
};
const projectCreateRules = function () {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Project name must be between 2 and 50 characters"),

    body("content")
      .notEmpty()
      .withMessage("Project content is required")
      .custom((value) => {
        let parsed;
        try {
          parsed = JSON.parse(value);
        } catch (err) {
          throw new Error("Project content must be a valid JSON");
        }
        const requiredFields = ["elements", "appState", "scrollToContent"];
        requiredFields.forEach((field) => {
          if (!(field in parsed)) {
            throw new Error(`Project content must include '${field}' field`);
          }
        });
        if (!Array.isArray(parsed.elements)) {
          throw new Error("'elements' field must be an array");
        }

        return true;
      }),
  ];
};

module.exports = {
  signupRules,
  loginRules,
  profileUpdateRules,
  projectFetchRules,
  projectCreateRules,
};
