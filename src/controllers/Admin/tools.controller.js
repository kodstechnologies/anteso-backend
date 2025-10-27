import Tool from "../../models/tools.model.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createToolSchema } from "../../validators/toolValidators.js";
import { generateReadableId } from "../../utils/GenerateReadableId.js";
import Employee from "../../models/technician.model.js";
import Tools from "../../models/tools.model.js";
import { uploadToS3 } from "../../utils/s3Upload.js";

// const create = asyncHandler(async (req, res) => {
//     console.log(" Tool body submitted:", req.body);

//     const { error, value } = createToolSchema.validate(req.body);
//     if (error) {
//         throw new ApiError(400, error.details[0].message);
//     }

//     // Generate toolId manually
//     const toolId = await generateReadableId("Tool", "TL");

//     // Check for duplicates
//     const exists = await Tools.findOne({ toolId });
//     if (exists) {
//         throw new ApiError(409, "Tool with this ID already exists");
//     }

//     // Handle file upload (certificate)
//     let certificateUrl = null;
//     if (req.file) {
//         try {
//             const { url } = await uploadToS3(req.file);
//             certificateUrl = url;
//         } catch (err) {
//             console.error("S3 upload error:", err);
//             throw new ApiError(500, "Failed to upload certificate file");
//         }
//     }

//     const tool = await Tools.create({
//         ...value,
//         toolId,
//         toolStatus: "unassigned", // default value
//         certificate: certificateUrl,
//     });

//     res.status(201).json(new ApiResponse(201, tool, "Tool created successfully"));
// });


const create = asyncHandler(async (req, res) => {
    console.log("Tool body submitted:", req.body);

    // ✅ Validate request body
    const { error, value } = createToolSchema.validate(req.body, { abortEarly: false });
    if (error) {
        throw new ApiError(400, 'Validation Error', error.details.map(e => e.message));
    }

    // ✅ Identify creator
    const tokenUser = req.admin || req.user; // either Admin or User
    const creatorId = tokenUser?.id || tokenUser?._id;
    let creatorModel = "User"; // default

    if (tokenUser?.role === "admin") {
        creatorModel = "Admin";
    }

    if (!creatorId) {
        throw new ApiError(401, "Unauthorized: Creator information missing");
    }

    // ✅ Generate toolId manually (optional, pre-save also handles it)
    const toolId = await generateReadableId("Tool", "TL");

    // ✅ Check for duplicates
    const exists = await Tools.findOne({ toolId });
    if (exists) {
        throw new ApiError(409, "Tool with this ID already exists");
    }

    // ✅ Handle file upload (certificate)
    let certificateUrl = null;
    if (req.file) {
        try {
            const { url } = await uploadToS3(req.file);
            certificateUrl = url;
        } catch (err) {
            console.error("S3 upload error:", err);
            throw new ApiError(500, "Failed to upload certificate file");
        }
    }

    // ✅ Create the tool
    const newTool = await Tools.create({
        ...value,
        toolId,
        toolStatus: "unassigned",
        certificate: certificateUrl,
        createdBy: creatorId,
        createdByModel: creatorModel,
    });

    // ✅ Populate createdBy dynamically
    const populatedTool = await Tools.findById(newTool._id)
        .populate({
            path: 'createdBy',
            select: 'name email phone role technicianType',
        });

    res.status(201).json(new ApiResponse(201, populatedTool, "Tool created successfully"));
});



// const allTools = asyncHandler(async (req, res) => {
//     try {
//         // Fetch all tools sorted by newest first
//         const tools = await Tool.find().sort({ createdAt: -1 });
//         const totalCount = tools.length;

//         res.status(200).json(
//             new ApiResponse(200, {
//                 tools,
//                 totalCount
//             }, "Tools fetched successfully")
//         );
//     } catch (error) {
//         console.error("❌ Error fetching tools:", error);
//         res.status(500).json(
//             new ApiResponse(500, null, "Failed to fetch tools")
//         );
//     }
// });

const allTools = asyncHandler(async (req, res) => {
    try {
        // Fetch all tools and populate 'createdBy'
        const tools = await Tools.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'createdBy',
                select: 'name email role technicianType', // select only required fields
            });

        const totalTools = tools.length;

        return res.status(200).json(
            new ApiResponse(200, {
                tools,
                totalTools
            }, 'Tools fetched successfully')
        );
    } catch (error) {
        console.error("❌ Error fetching tools:", error);
        return res.status(500).json(
            new ApiResponse(500, null, 'Failed to fetch tools')
        );
    }
});


// const updateById = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const { error, value } = createToolSchema.validate(req.body);
//     if (error) {
//         throw new ApiError(400, error.details[0].message);
//     }
//     const updatedTool = await Tool.findByIdAndUpdate(id, value, {
//         new: true, // return updated doc
//         runValidators: true, // apply schema validation
//     });
//     if (!updatedTool) {
//         throw new ApiError(404, "Tool not found");
//     }
//     res.status(200).json(new ApiResponse(200, updatedTool, "Tool updated successfully"));
// });

const updateById = asyncHandler(async (req, res) => {
    try {
        const { toolId } = req.params;
        console.log("🚀 ~ toolId:", toolId)
        const updateData = req.body;
        console.log("🚀 ~ updateData:", updateData)

        if (!toolId) {
            return res.status(400).json({
                success: false,
                message: "Tool ID is required.",
            });
        }

        // find tool by toolId
        const tool = await Tools.findById(toolId);
        console.log("🚀 ~ tool:", tool)
        if (!tool) {
            return res.status(404).json({
                success: false,
                message: "Tool not found.",
            });
        }

        // ✅ Allowed fields to update (added submitDate)
        const allowedFields = [
            "SrNo",
            "nomenclature",
            "manufacturer",
            "manufacture_date",
            "model",
            "calibrationCertificateNo",
            "calibrationValidTill",
            "range",
            "certificate",
            "toolStatus",
            "technician",
            "submitDate", // ✅ Added this line
        ];

        Object.keys(updateData).forEach((key) => {
            if (allowedFields.includes(key)) {
                if (key === 'technician') {
                    tool[key] = updateData[key]; // assuming ObjectId from frontend
                } else {
                    tool[key] = updateData[key];
                }
            }
        });

        await tool.save();

        res.status(200).json({
            success: true,
            message: "Tool updated successfully.",
            data: tool,
        });
    } catch (error) {
        console.error("Error updating tool:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating tool.",
            error: error.message,
        });
    }
});


const deleteById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedTool = await Tool.findByIdAndDelete(id);
    if (!deletedTool) {
        throw new ApiError(404, "Tool not found");
    }
    res.status(200).json(new ApiResponse(200, deletedTool, "Tool deleted successfully"));
});


const getById = asyncHandler(async (req, res) => {
    console.log("hi from controller");

    console.log("tools route hit");

    const { id } = req.params;
    const tool = await Tool.findById(id);
    console.log("🚀 ~ tool:", tool)
    if (!tool) {
        throw new ApiError(404, "Tool not found");
    }
    res.status(200).json(new ApiResponse(200, tool, "Tool fetched successfully"));
});


const createToolByTechnician = asyncHandler(async (req, res) => {
    try {

    } catch (error) {

    }
})


// const getEngineerByTool = asyncHandler(async (req, res) => {
//     const { id } = req.params;

//     // Step 1: Get tool by ID
//     const tool = await Tool.findById(id);
//     if (!tool) {
//         return res.status(404).json({ message: 'Tool not found' });
//     }

//     // Step 2: Find engineer by embedded toolId
//     const engineer = await Employee.findOne({
//         'tools.toolId': tool._id
//     });

//     if (!engineer) {
//         return res.status(404).json({ message: 'Engineer not assigned to this tool' });
//     }

//     // Step 3: Find assignment info (issueDate)
//     const assignedToolData = engineer.tools.find(
//         t => t.toolId.toString() === tool._id.toString()
//     );

//     if (!assignedToolData) {
//         return res.status(404).json({ message: 'Tool assignment not found in engineer data' });
//     }

//     return res.status(200).json({
//         engineer: {
//             _id: engineer._id,
//             name: engineer.name,
//             email: engineer.email,
//             technicianType: engineer.technicianType,
//             designation: engineer.designation,
//             department: engineer.department,
//         },
//         tool: {
//             toolId: tool._id,
//             toolName: tool.nomenclature,
//             serialNumber: tool.SrNo,
//             issueDate: assignedToolData.issueDate,
//             submitDate: tool.createdAt,
//         },
//     });
// });



// const getEngineerByTool = asyncHandler(async (req, res) => {
//     const { id } = req.params;

//     // Step 1: Find tool and populate engineer
//     const tool = await Tools.findById(id).populate("technician");

//     if (!tool) {
//         return res.status(404).json({ message: "Tool not found" });
//     }

//     if (!tool.technician) {
//         return res.status(404).json({ message: "Engineer not assigned to this tool" });
//     }

//     return res.status(200).json({
//         engineer: {
//             _id: tool.technician._id,
//             name: tool.technician.name,
//             email: tool.technician.email,
//             technicianType: tool.technician.technicianType,
//             designation: tool.technician.designation,
//             department: tool.technician.department,
//         },
//         tool: {
//             toolId: tool.toolId,
//             toolName: tool.nomenclature,
//             serialNumber: tool.SrNo,
//             issueDate: tool.createdAt, // or keep from employee if needed
//             submitDate: tool.updatedAt,
//         },
//     });
// });

const getEngineerByTool = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Step 1: Find tool and populate engineer
    const tool = await Tools.findById(id).populate("technician");

    if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
    }

    if (!tool.technician) {
        return res.status(200).json({
            engineer: null,
            tool: {
                toolId: tool.toolId,
                toolName: tool.nomenclature,
                serialNumber: tool.SrNo,
                issueDate: null,
                submitDate: null,
            },
        });
    }

    // Step 2: Find issue/submit date from technician's tools array
    const toolHistory = tool.technician.tools.find(t => t.toolId.toString() === tool._id.toString());

    return res.status(200).json({
        engineer: {
            _id: tool.technician._id,
            name: tool.technician.name,
            email: tool.technician.email,
            technicianType: tool.technician.technicianType,
            designation: tool.technician.designation,
            department: tool.technician.department,
        },
        tool: {
            toolId: tool.toolId,
            toolName: tool.nomenclature,
            serialNumber: tool.SrNo,
            issueDate: toolHistory?.issueDate || null,
            submitDate: toolHistory?.submitDate || null,
        },
    });
});


const getAllTechnicians = asyncHandler(async (req, res) => {
    try {

    } catch (error) {

    }
})

const getAllToolsByTechnicianId = asyncHandler(async (req, res) => {
    try {
        const { technicianId } = req.params;

        if (!technicianId) {
            return res.status(400).json({
                success: false,
                message: "Technician ID is required",
            });
        }

        // Find employee/technician by ID and populate tool details
        const technician = await Employee.findById(technicianId)
            .populate("tools.toolId", "toolId SrNo nomenclature manufacturer model calibrationCertificateNo calibrationValidTill range toolStatus certificate");

        if (!technician) {
            return res.status(404).json({
                success: false,
                message: "Technician not found",
            });
        }

        // Flatten the toolId object into the tool response
        const formattedTools = technician.tools.map(tool => {
            if (tool.toolId && typeof tool.toolId === "object") {
                return {
                    ...tool.toolId.toObject(),
                    issueDate: tool.issueDate
                };
            }
            return tool;
        });

        return res.status(200).json({
            success: true,
            technicianId: technician._id,
            tools: formattedTools,
        });
    } catch (error) {
        console.error("Error fetching tools by technician:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching tools",
            error: error.message,
        });
    }
});



const getToolByTechnicianAndTool = asyncHandler(async (req, res) => {
    try {
        const { technicianId, toolId } = req.params;

        if (!technicianId || !toolId) {
            return res.status(400).json({
                success: false,
                message: "Technician ID and Tool ID are required",
            });
        }

        // Find the technician and populate the tools array
        const technician = await Employee.findById(technicianId)
            .populate(
                "tools.toolId",
                "toolId SrNo nomenclature manufacturer model calibrationCertificateNo calibrationValidTill range toolStatus"
            );

        if (!technician) {
            return res.status(404).json({
                success: false,
                message: "Technician not found",
            });
        }

        // Find the specific tool in technician's tools array
        const toolDoc = technician.tools.find(
            (t) => t.toolId && t.toolId._id.toString() === toolId
        );

        if (!toolDoc) {
            return res.status(404).json({
                success: false,
                message: "Tool not assigned to this technician",
            });
        }

        // Flatten toolId + issueDate
        const formattedTool = {
            ...toolDoc.toolId.toObject(),
            issueDate: toolDoc.issueDate
        };

        return res.status(200).json({
            success: true,
            technicianId: technician._id,
            tool: formattedTool,
        });
    } catch (error) {
        console.error("Error fetching tool by technician and tool:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching tool",
            error: error.message,
        });
    }
});

// const toolHistory = asyncHandler(async (req, res) => {
//     const { toolId } = req.params;

//     if (!toolId) {
//         return res.status(400).json({ success: false, message: "Tool ID is required" });
//     }

//     try {
//         // Find the tool by ID and populate the technician (engineer)
//         const tool = await Tool.findById(toolId).populate({
//             path: "technician", // assuming 'technician' field in Tool schema
//             select: "name email", // select fields you want
//         });

//         if (!tool) {
//             return res.status(404).json({ success: false, message: "Tool not found" });
//         }

//         // Respond with engineer + issue/submit dates
//         res.status(200).json({
//             success: true,
//             engineer: tool.technician || null,
//             issueDate: tool.issueDate || null,
//             submitDate: tool.submitDate || null,
//         });
//     } catch (error) {
//         console.error("❌ Error fetching tool history:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch tool history",
//             error: error.message,
//         });
//     }
// });

// const toolHistory = asyncHandler(async (req, res) => {
//     const { toolId } = req.params;

//     if (!toolId) {
//         return res.status(400).json({ success: false, message: "Tool ID is required" });
//     }

//     try {
//         // Find the tool and populate the technician
//         const tool = await Tools.findById(toolId).populate({
//             path: "technician",
//             select: "name email tools", // get tools array too
//         });

//         if (!tool) {
//             return res.status(404).json({ success: false, message: "Tool not found" });
//         }

//         let issueDate = null;
//         let submitDate = null;

//         if (tool.technician) {
//             // Find the tool inside technician.tools array
//             const techTool = tool.technician.tools.find(t => t.toolId.toString() === tool._id.toString());
//             if (techTool) {
//                 issueDate = techTool.issueDate;
//                 submitDate = techTool.submitDate;
//             }
//         }

//         res.status(200).json({
//             success: true,
//             engineer: tool.technician
//                 ? {
//                     _id: tool.technician._id,
//                     name: tool.technician.name,
//                     email: tool.technician.email,
//                 }
//                 : null,
//             issueDate,
//             submitDate,
//         });
//     } catch (error) {
//         console.error("❌ Error fetching tool history:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch tool history",
//             error: error.message,
//         });
//     }
// });
const toolHistory = asyncHandler(async (req, res) => {
    const { toolId } = req.params;

    if (!toolId) {
        return res.status(400).json({ success: false, message: "Tool ID is required" });
    }

    try {
        // Find tool and populate technician
        const tool = await Tools.findById(toolId).populate({
            path: "technician",
            select: "name email tools", // includes tools array for issue date
        });

        if (!tool) {
            return res.status(404).json({ success: false, message: "Tool not found" });
        }

        let issueDate = null;
        let submitDate = tool.submitDate || null; // ✅ get submitDate directly from tool model

        if (tool.technician) {
            // Find matching tool in technician's tools array
            const techTool = tool.technician.tools.find(
                (t) => t.toolId?.toString() === tool._id.toString()
            );

            if (techTool) {
                issueDate = techTool.issueDate; // ✅ get issueDate from technician
            }
        }

        res.status(200).json({
            success: true,
            engineer: tool.technician
                ? {
                    _id: tool.technician._id,
                    name: tool.technician.name,
                    email: tool.technician.email,
                }
                : null,
            issueDate,
            submitDate,
        });
    } catch (error) {
        console.error("❌ Error fetching tool history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tool history",
            error: error.message,
        });
    }
});
const getUnassignedTools = asyncHandler(async (req, res) => {
    try {
        const unassignedTools = await Tools.find({ toolStatus: 'unassigned' })
            .populate('technician', 'name email') // optional: populate technician details if you need them
            .sort({ createdAt: -1 }); // latest first

        if (!unassignedTools.length) {
            return res.status(200).json({ message: 'No unassigned tools found' });
        }

        res.status(200).json({
            success: true,
            count: unassignedTools.length,
            data: unassignedTools,
        });
    } catch (error) {
        console.error("Error fetching unassigned tools:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch unassigned tools",
            error: error.message,
        });
    }
});

export default { create, allTools, updateById, deleteById, getById, getEngineerByTool, getAllToolsByTechnicianId, getToolByTechnicianAndTool, toolHistory, getUnassignedTools };