import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
visitorId: string;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    visitorId: {
      type: String,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique bookmarks per visitor per post
BookmarkSchema.index({ visitorId: 1, post: 1 }, { unique: true });

const Bookmark: Model<IBookmark> =
  mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

export default Bookmark;
