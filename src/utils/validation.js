const validator = require("validator");

const validateSignUpData = (req) => {

    const { firstName, lastName, emailID, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("Enter a valid name")
    }
    if (!validator.isEmail(emailID) && emailID) {
        throw new Error("Enter a valid Email Id")
    }
    if (!validator.isStrongPassword(password) && password) {
        throw new Error("Enter a strong password")
    }
}

const validatePassword = (req) => {

    const { password } = req.body;

    if (!validator.isStrongPassword(password) && password) {
        throw new Error("Enter a strong password")
    }
}

module.exports = { validateSignUpData, validatePassword };