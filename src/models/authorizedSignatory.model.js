import mongoose, { Schema } from 'mongoose';
const authorizedSignatorySchema = new Schema({
   name: {
    type: String,
    required: true,
   },
   signature: {
    type: String,
    required: true,
   },
   
}, { timestamps: true });

const AuthorizedSignatory = mongoose.model('AuthorizedSignatory', authorizedSignatorySchema);
export default AuthorizedSignatory;