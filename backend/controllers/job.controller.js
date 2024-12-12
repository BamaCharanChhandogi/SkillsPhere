import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            requirements, 
            salary, 
            location, 
            jobType, 
            experienceLevel, 
            position, 
            companyId,
            applicationFee 
        } = req.body;
        
        const userId = req.id;

        // Validation
        if (!title || !description || !requirements || !salary || 
            !location || !jobType || !experienceLevel || 
            !position || !companyId) {
            return res.status(400).json({
                message: "All required fields must be provided",
                success: false
            });
        }

        // Create new job
        const job = await Job.create({
            title,
            description,
            requirements: Array.isArray(requirements) ? requirements : requirements.split(",").map(req => req.trim()),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experienceLevel),
            position: Number(position),
            company: companyId,
            created_by: userId,
            applicationFee: Number(applicationFee || 10) // Default to 10 if not provided
        });

        // Populate company details in response
        const populatedJob = await Job.findById(job._id).populate('company');

        return res.status(201).json({
            message: "New job created successfully",
            job: populatedJob,
            success: true
        });
    } catch (error) {
        console.error('Error in postJob:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
