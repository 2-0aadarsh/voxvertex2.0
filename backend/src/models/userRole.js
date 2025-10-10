import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workEmail: {
            type: String,
            // required: true,
            validate: {
                validator: function (value) {
                    if (this.role === "Speaker") {
                        return value != null && value.trim() !== "";
                    }
                    return true;
                },
                message: "Work email is required for Speakers",
            },
        },
        // organisationIdImage: {
        //     data: Buffer,
        //     contentType: String, 
        // },
        role: {
            type: String,
            enum: ["Participant", "Expert", "Business", "Freelancer"],
            default: "Participant",
        },
        industry: {
            type: String,
            // enum: ["Technology", "Finance & Banking", "Healthcare & Medicine", "Education", "Business & Management","Engineering","Arts & Entertainment","Law & Legal Studies", "Marketing & Communications", "Marketing & Communications", "Environmental & Sustainability", "Manufacturing & Industry", "Social Sciences & Humanities", "Retail & E-commerce", "Energy & Utilities", "Real Estate & Property Development"],
            default: null
        },
        subField: {
            type: [String],
            default: []
        },
        mobileNo: {
            type: String,
            required: true,
            unique: true,
        },
            urlField:{
    type: [String],
},
    emailVerificationToken: {
    type: String,
    default: null
},
    isVerified: {
    type: Boolean,
    default: false
}
    },
{
    timestamps: true,
    }
);

const UserRole = mongoose.model("UserRole", userRoleSchema);
export default UserRole;