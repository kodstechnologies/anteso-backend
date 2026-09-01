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

    const normalizedBody = { ...req.body };
    const rawApplicableMachines =
        normalizedBody.applicableMachines ?? normalizedBody["applicableMachines[]"];

    if (typeof rawApplicableMachines === "string") {
        normalizedBody.applicableMachines = [rawApplicableMachines];
    } else if (Array.isArray(rawApplicableMachines)) {
        normalizedBody.applicableMachines = rawApplicableMachines;
    }

    // ✅ Validate request body
    const { error, value } = createToolSchema.validate(normalizedBody, { abortEarly: false });
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

// const updateById = asyncHandler(async (req, res) => {
//     try {
//         const { toolId } = req.params;
//         console.log("🚀 ~ toolId:", toolId)
//         const updateData = req.body;
//         console.log("🚀 ~ updateData:", updateData)

//         if (!toolId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Tool ID is required.",
//             });
//         }

//         // find tool by toolId
//         const tool = await Tools.findById(toolId);
//         console.log("🚀 ~ tool:", tool)
//         if (!tool) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Tool not found.",
//             });
//         }

//         // ✅ Allowed fields to update (added submitDate)
//         const allowedFields = [
//             "SrNo",
//             "nomenclature",
//             "manufacturer",
//             "manufacture_date",
//             "model",
//             "calibrationCertificateNo",
//             "calibrationValidTill",
//             "range",
//             "certificate",
//             "toolStatus",
//             "technician",
//             "submitDate", // ✅ Added this line
//         ];

//         Object.keys(updateData).forEach((key) => {
//             if (allowedFields.includes(key)) {
//                 if (key === 'technician') {
//                     tool[key] = updateData[key]; // assuming ObjectId from frontend
//                 } else {
//                     tool[key] = updateData[key];
//                 }
//             }
//         });

//         await tool.save();

//         res.status(200).json({
//             success: true,
//             message: "Tool updated successfully.",
//             data: tool,
//         });
//     } catch (error) {
//         console.error("Error updating tool:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error while updating tool.",
//             error: error.message,
//         });
//     }
// });

const updateById = asyncHandler(async (req, res) => {
    try {
        const { toolId } = req.params;
        const updateData = req.body;

        if (!toolId) {
            return res.status(400).json({
                success: false,
                message: "Tool ID is required.",
            });
        }

        const tool = await Tools.findById(toolId);
        if (!tool) {
            return res.status(404).json({
                success: false,
                message: "Tool not found.",
            });
        }

        const previousTechnicianId = tool.technician?.toString() || null;

        const allowedFields = [
            "SrNo",
            "nomenclature",
            "manufacturer",
            "manufacture_date",
            "model",
            "calibrationCertificateNo",
            "calibrationValidTill",
            "certificate",
            "toolStatus",
            "technician",
            "submitDate",
            "applicableMachines",
        ];

        Object.keys(updateData).forEach((key) => {
            if (allowedFields.includes(key)) {
                tool[key] = updateData[key];
            }
        });

        if (!tool.assignmentHistory) {
            tool.assignmentHistory = [];
        }

        const issueDate = updateData.issueDate ? new Date(updateData.issueDate) : null;
        const submitDate = updateData.submitDate ? new Date(updateData.submitDate) : null;

        const findLastOpenHistoryIndex = () => {
            for (let i = tool.assignmentHistory.length - 1; i >= 0; i--) {
                if (!tool.assignmentHistory[i].submitDate) return i;
            }
            return -1;
        };

        if (updateData.technician) {
            const technicianId = updateData.technician;
            const prevTechnicianId = previousTechnicianId;
            const newTechnicianId = technicianId.toString();
            const resolvedIssueDate = issueDate || new Date();
            const lastOpenIdx = findLastOpenHistoryIndex();

            if (prevTechnicianId === newTechnicianId && lastOpenIdx >= 0) {
                tool.assignmentHistory[lastOpenIdx].issueDate = resolvedIssueDate;
                if (submitDate) {
                    tool.assignmentHistory[lastOpenIdx].submitDate = submitDate;
                    tool.submitDate = submitDate;
                }
            } else {
                if (lastOpenIdx >= 0 && prevTechnicianId !== newTechnicianId && submitDate) {
                    tool.assignmentHistory[lastOpenIdx].submitDate = submitDate;
                }

                tool.assignmentHistory.push({
                    technician: technicianId,
                    issueDate: resolvedIssueDate,
                    submitDate: null,
                });

                tool.submitDate = null;
            }

            tool.toolStatus = 'assigned';
            tool.technician = technicianId;

            await Employee.updateMany(
                { "tools.toolId": tool._id },
                { $pull: { tools: { toolId: tool._id } } }
            );

            await Employee.findByIdAndUpdate(
                technicianId,
                {
                    $addToSet: {
                        tools: {
                            toolId: tool._id,
                            issueDate: resolvedIssueDate,
                            toolName: tool.nomenclature,
                            serialNumber: tool.SrNo,
                        },
                    },
                },
                { new: true }
            );
        } else if (submitDate && tool.technician) {
            const lastOpenIdx = findLastOpenHistoryIndex();
            if (lastOpenIdx >= 0) {
                tool.assignmentHistory[lastOpenIdx].submitDate = submitDate;
            } else {
                tool.assignmentHistory.push({
                    technician: tool.technician,
                    issueDate: issueDate || new Date(),
                    submitDate,
                });
            }
            tool.submitDate = submitDate;
        }

        if (updateData.toolStatus === 'unassigned' && tool.technician) {
            const lastOpenIdx = findLastOpenHistoryIndex();
            if (lastOpenIdx >= 0 && submitDate) {
                tool.assignmentHistory[lastOpenIdx].submitDate = submitDate;
            }

            await Employee.updateOne(
                { _id: tool.technician },
                { $pull: { tools: { toolId: tool._id } } }
            );
            tool.technician = null;
        }

        await tool.save();

        res.status(200).json({
            success: true,
            message: "Tool updated successfully and synced with employee.",
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

    const tool = await Tool.findById(id);
    if (!tool) {
        throw new ApiError(404, "Tool not found");
    }

    // Remove this tool from any engineer who has it assigned
    await Employee.updateMany(
        { "tools.toolId": tool._id },
        { $pull: { tools: { toolId: tool._id } } }
    );

    const deletedTool = await Tool.findByIdAndDelete(id);

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
    const tool = await Tools.findById(id).populate("technician", "name email tools technicianType designation department");

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

    // Step 2: Find issue/submit date from assignment history or technician's tools array
    let issueDate = null;
    let submitDate = tool.submitDate || null;

    if (tool.assignmentHistory?.length) {
        const lastOpen = [...tool.assignmentHistory].reverse().find((entry) => !entry.submitDate);
        const currentEntry = lastOpen || tool.assignmentHistory[tool.assignmentHistory.length - 1];
        issueDate = currentEntry?.issueDate || null;
        submitDate = lastOpen ? null : (currentEntry?.submitDate || null);
    } else if (tool.technician) {
        const toolHistoryEntry = tool.technician.tools?.find(
            (t) => t.toolId.toString() === tool._id.toString()
        );
        issueDate = toolHistoryEntry?.issueDate || null;
    }

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
            issueDate,
            submitDate,
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
            .populate("tools.toolId", "toolId SrNo nomenclature manufacturer model calibrationCertificateNo calibrationValidTill toolStatus certificate");

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
                "toolId SrNo nomenclature manufacturer model calibrationCertificateNo calibrationValidTill toolStatus"
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
        const tool = await Tools.findById(toolId)
            .populate("technician", "name email")
            .populate("assignmentHistory.technician", "name email");

        if (!tool) {
            return res.status(404).json({ success: false, message: "Tool not found" });
        }

        let history = [];

        if (tool.assignmentHistory?.length) {
            history = tool.assignmentHistory.map((entry) => ({
                engineerName: entry.technician?.name || "-",
                engineerId: entry.technician?._id || entry.technician,
                issueDate: entry.issueDate || null,
                submitDate: entry.submitDate || null,
            }));
        } else if (tool.technician) {
            const employee = await Employee.findById(tool.technician).select("name email tools");
            const techTool = employee?.tools?.find(
                (t) => t.toolId?.toString() === tool._id.toString()
            );

            history = [{
                engineerName: employee?.name || tool.technician?.name || "-",
                engineerId: tool.technician._id || tool.technician,
                issueDate: techTool?.issueDate || null,
                submitDate: tool.submitDate || null,
            }];
        }

        const lastOpenEntry = [...history].reverse().find((entry) => !entry.submitDate);
        const currentEntry = lastOpenEntry || (history.length ? history[history.length - 1] : null);

        res.status(200).json({
            success: true,
            engineer: tool.technician
                ? {
                    _id: tool.technician._id,
                    name: tool.technician.name,
                    email: tool.technician.email,
                }
                : null,
            issueDate: currentEntry?.issueDate || null,
            submitDate: lastOpenEntry ? null : (currentEntry?.submitDate || null),
            isSubmitted: lastOpenEntry ? false : Boolean(currentEntry?.submitDate),
            history,
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

const GetExpiringTools = asyncHandler(async (req, res) => {
    try {
        // 1. Get today's date (start of day for accuracy)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Get date after 7 days
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);
        next7Days.setHours(23, 59, 59, 999);

        // 3. Query DB
        const tools = await Tools.find({
            calibrationValidTill: {
                $gte: today,
                $lte: next7Days
            }
        })
            .populate("technician", "name email") // optional
            .sort({ calibrationValidTill: 1 });   // earliest expiry first

        // 4. Response
        return res.status(200).json({
            success: true,
            count: tools.length,
            data: tools
        });

    } catch (error) {
        console.error("Error fetching expiring tools:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch expiring tools"
        });
    }
});



const getUnassignedToolsPerMachine = asyncHandler((req, res) => {
    try {
        
    } catch (error) {
        
    }
})

/**
 * Get assigned tools for a specific engineer filtered by machine type
 * @route GET /api/tools/assigned-tools-by-engineer-machine
 * @query {string} engineerId - ID of the engineer/technician
 * @query {string} machineType - Type of machine (e.g., "Computed Tomography", "Radiography (Fixed)", "C-Arm")
 * @returns {Object} Response containing filtered tools assigned to the engineer for the specified machine type
 * @example
 * GET /api/tools/assigned-tools-by-engineer-machine?engineerId=507f1f77bcf86cd799439011&machineType=Computed%20Tomography
 */
const getAssignedToolsForEngineerByMachine = asyncHandler(async (req, res) => {
    try {
        const { engineerId, machineType } = req.query;

        // Validate required parameters
        if (!engineerId) {
            return res.status(400).json({
                success: false,
                message: "Engineer ID is required"
            });
        }

        if (!machineType) {
            return res.status(400).json({
                success: false,
                message: "Machine type is required"
            });
        }

        // Build query: tools assigned to this engineer with status 'assigned'
        const query = {
            technician: engineerId,
            toolStatus: 'assigned'
        };

        // Add applicableMachines filter if specified
        // Case-insensitive match for machine type
        query.applicableMachines = {
            $elemMatch: {
                $regex: new RegExp(`^${machineType.trim()}$`, 'i')
            }
        };

        // Find tools and populate technician details
        const tools = await Tools.find(query)
            .populate('technician', 'name email phone rpId')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        // Check if calibration is still valid
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const toolsWithStatus = tools.map(tool => {
            const validTill = new Date(tool.calibrationValidTill);
            validTill.setHours(0, 0, 0, 0);
            
            return {
                ...tool.toObject(),
                isCalibrationValid: validTill >= today,
                daysUntilExpiry: Math.ceil((validTill - today) / (1000 * 60 * 60 * 24))
            };
        });

        return res.status(200).json({
            success: true,
            message: "Tools retrieved successfully",
            data: {
                engineerId,
                machineType,
                totalTools: toolsWithStatus.length,
                toolsAssigned: toolsWithStatus
            }
        });

    } catch (error) {
        console.error("Error in getAssignedToolsForEngineerByMachine:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve assigned tools",
            error: error.message
        });
    }
});

export default { create, allTools, updateById, deleteById, getById, getEngineerByTool, getAllToolsByTechnicianId, getToolByTechnicianAndTool, toolHistory, getUnassignedTools, GetExpiringTools, getAssignedToolsForEngineerByMachine };