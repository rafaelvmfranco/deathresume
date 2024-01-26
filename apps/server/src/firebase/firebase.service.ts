import { Inject, Injectable, Logger } from "@nestjs/common";
import { app } from "firebase-admin";

type CollectionName = "userCollection" | "planCollection" | "resumeCollection" | "secretCollection";

@Injectable()
export class FirebaseService {
  
  db: FirebaseFirestore.Firestore;
  bucket: any;
  userCollection: FirebaseFirestore.CollectionReference;
  planCollection: FirebaseFirestore.CollectionReference;
  resumeCollection: FirebaseFirestore.CollectionReference;
  secretCollection: FirebaseFirestore.CollectionReference;

  constructor(@Inject("FIREBASE_APP") private firebaseApp: app.App) {
    this.db = firebaseApp.firestore();
    this.bucket = firebaseApp.storage().bucket();
    this.userCollection = this.db.collection("users");
    this.planCollection = this.db.collection("plans");
    this.resumeCollection = this.db.collection("resumes");
    this.secretCollection = this.db.collection("secrets");
  }

  async create(collection: CollectionName, dto: any) {
    return await this[collection].add(dto);
  }

  async findByField(collection: CollectionName, dto: Record<string, string>) {
    return await this[collection].where(dto.field, "==", dto.value).get();
  }

  async updateItemByField(
    collection: CollectionName,
    updateData: {
      field: string;
      value: string;
    },
    dto: any,
  ) {
    return this[collection]
      .where(updateData.field, "==", updateData.value)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(async (doc: any) => {
          return await doc.ref.update(dto);
        });
      })
      .catch((error: Error) => {
        Logger.log(
          `Error while updating doc with ${updateData.field}=${updateData.value} in ${collection}`,
          error,
        );
      });
  }

  async deleteByField(collection: CollectionName, dto: Record<string, string>) {
    return await this[collection]
      .where(dto.field, "==", dto.value)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(async (doc: any) => {
          return await doc.ref.delete();
        });
      })
      .catch((error: Error) => {
        Logger.log(
          `Error while deleting doc with ${dto.field}=${dto.value} in ${collection}`,
          error,
        );
      });
  }

  async uploadToBucket(userId: string, filepath: string, buffer: Buffer, itemId: string) {
    const filename = `${userId}/${filepath}/${itemId}.pdf`;
    await this.bucket.upload(filename).save(buffer);
  }

  async deleteFileFromBucket(userId: string, filepath: string, id: string) {}

  deleteBucketFolderById(id: string) {
    return this.bucket.deleteFolder(id);
  }
  
  async doesBucketExist() {
    await this.bucket.exists();
  }

  async areAllCollectionsAvailable() {
    await Promise.all([
      this.userCollection.get(),
      this.planCollection.get(),
      this.resumeCollection.get(),
      this.secretCollection.get(),
    ]);
  }
  
  async uploadObject(userId: string, arg1: string, buffer: Buffer, userId1: string) {
      throw new Error("Method not implemented.");
  }
}
