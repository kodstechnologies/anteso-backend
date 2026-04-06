import { CustomMachine } from '../../models/customeMachine.model.js';
import { asyncHandler } from '../../utils/AsyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * @desc    Get all custom machines
 * @route   GET /admin/custom-machines
 * @access  Private-Admin
 */
const getAll = asyncHandler(async (req, res) => {
    const customMachines = await CustomMachine.find().sort({ name: 1 });

    res.status(200).json(
        new ApiResponse(
            200, 
            customMachines, 
            customMachines.length > 0 ? "Custom machines fetched successfully" : "No custom machines found"
        )
    );
});

export default { getAll };
