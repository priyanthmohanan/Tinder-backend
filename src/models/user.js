
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 2,
            maxLength: 15
        },
        lastName: {
            type: String
        },
        emailID: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email address" + value)
                }
            }
        },
        password: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            min: 18
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female", "others"],
                message: `{VALUE} is invalid gender`
            }
        },
        photoUrl: {
            type: String
        },
        about: {
            type: String,
            default: "Javascript developer"
        },
        skills: {
            type: [String],
            validate: {
                validator: (arr) => arr.length <= 3,
                message: "Skills cannot be more than 3",
            },
        }
    },
    {
        timestamps: true
    }
);

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJWT = function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, "secretKey", { expiresIn: "1d" });
    console.log("Token Credentilas", token);
    return token;
};

userSchema.methods.validatePassword = async function (password) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid;
}

//module.exports = mongoose.model("User", userSchema, "user") // user is a collection name
module.exports = mongoose.model("User", userSchema)

