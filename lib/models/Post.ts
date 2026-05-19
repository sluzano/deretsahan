import mongoose, { Schema, Document, Model } from 'mongoose';
import slugify from 'slugify';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
  isFeatured: boolean;
  isTrending: boolean;
  isBreaking: boolean;
  views: number;
  readingTime: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    featuredImage: {
      type: String,
      required: [true, 'Featured image is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },
    scheduledAt: {
      type: Date,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    metaTitle: {
      type: String,
      maxlength: [70, 'Meta title cannot exceed 70 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug and calculate reading time before saving
PostSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + timestamp;
  }
  
  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for efficient queries
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1, status: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isFeatured: 1, status: 1 });
PostSchema.index({ isTrending: 1, status: 1 });
PostSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
