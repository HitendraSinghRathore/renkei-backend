const mongoose = require('mongoose');
const { Schema } = mongoose;

const CollaboratorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    access: {
      type: String,
      enum: ['read', 'write'],
      default: 'read',
    },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
     
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
    },
    collaborators: [CollaboratorSchema],
    content: {
      type: Schema.Types.Mixed, 
      default: {},
    },
  },
  {
    timestamps: true, 
  }
);

ProjectSchema.index({ name: 'text' });

ProjectSchema.index({ owner: 1, updatedAt: -1 });

ProjectSchema.index({ 'collaborators.user': 1, updatedAt: -1 });

ProjectSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);