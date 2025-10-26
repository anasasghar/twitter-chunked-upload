// Referenced from javascript_database blueprint - updated for new schema
import { 
  uploads, 
  oauthTokens,
  type Upload, 
  type InsertUpload,
  type OAuthToken,
  type InsertOAuthToken
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Upload methods
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  getAllUploads(): Promise<Upload[]>;
  updateUploadStatus(id: string, status: string, mediaId?: string, mediaKey?: string, errorMessage?: string, processingState?: string): Promise<Upload | undefined>;
  
  // OAuth token methods
  createOrUpdateToken(token: InsertOAuthToken): Promise<OAuthToken>;
  getToken(userId: string): Promise<OAuthToken | undefined>;
  deleteToken(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Upload methods
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db
      .insert(uploads)
      .values(insertUpload)
      .returning();
    return upload;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  async getAllUploads(): Promise<Upload[]> {
    return await db.select().from(uploads).orderBy(desc(uploads.createdAt));
  }

  async updateUploadStatus(
    id: string, 
    status: string, 
    mediaId?: string, 
    mediaKey?: string, 
    errorMessage?: string,
    processingState?: string
  ): Promise<Upload | undefined> {
    const updateData: any = { status };
    if (mediaId !== undefined) updateData.mediaId = mediaId;
    if (mediaKey !== undefined) updateData.mediaKey = mediaKey;
    if (errorMessage !== undefined) updateData.errorMessage = errorMessage;
    if (processingState !== undefined) updateData.processingState = processingState;
    if (status === "success") updateData.completedAt = new Date();

    const [upload] = await db
      .update(uploads)
      .set(updateData)
      .where(eq(uploads.id, id))
      .returning();
    return upload || undefined;
  }

  // OAuth token methods
  async createOrUpdateToken(insertToken: InsertOAuthToken): Promise<OAuthToken> {
    const existing = await this.getToken(insertToken.userId);
    
    if (existing) {
      const [token] = await db
        .update(oauthTokens)
        .set(insertToken)
        .where(eq(oauthTokens.userId, insertToken.userId))
        .returning();
      return token;
    } else {
      const [token] = await db
        .insert(oauthTokens)
        .values(insertToken)
        .returning();
      return token;
    }
  }

  async getToken(userId: string): Promise<OAuthToken | undefined> {
    const [token] = await db.select().from(oauthTokens).where(eq(oauthTokens.userId, userId));
    return token || undefined;
  }

  async deleteToken(userId: string): Promise<void> {
    await db.delete(oauthTokens).where(eq(oauthTokens.userId, userId));
  }
}

export const storage = new DatabaseStorage();
