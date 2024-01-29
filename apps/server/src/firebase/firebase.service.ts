import { Inject, Injectable, Logger } from "@nestjs/common";
import { app, firestore } from "firebase-admin";

type CollectionName = "userCollection" | "planCollection" | "resumeCollection" | "secretCollection";

type SearchCondition = {
  condition: {
    field: string;
    value: any;
  };
};

type SearchConditions = {
  conditions: {
    field: string;
    value: any;
  }[];
};

type OrderBy = {
  order: {
    field: string;
    by: "asc" | "desc";
  };
};

type Select = {
  select?: string[];
};

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

  async create(collection: CollectionName, {dto}: any) {
    return await this[collection].add(dto);
  }

  async findUnique(
    collection: CollectionName,
    { condition }: SearchCondition,
    { select }: Partial<Select> = { select: [] },
  ) {
    let result = {};
    const selectionCondition = select && select.length > 0 ? select.join(",") : "*";
    await this[collection]
      .where(condition.field, "==", condition.value)
      .select(selectionCondition)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size > 1) {
          result = {};
          return;
        }
        querySnapshot.forEach((doc: any) => {
          result = doc.data();
        });
      });

    return result;
  }

  async findFirst(
    collection: CollectionName,
    { conditions }: SearchConditions,
    { select }: Partial<Select> = {},
  ) {
    const selectionCondition = select && select.length > 0 ? select.join(",") : "*";

    let query: firestore.Query = this[collection];

    conditions.forEach((condition) => {
      query = query.where(condition.field, "==", condition.value);
    });

    const querySnapshot = await query.select(selectionCondition).limit(1).get();

    return querySnapshot.docs.map((doc) => doc.data());
  }

  async findManyAndOrder(
    collection: CollectionName,
    { condition }: SearchCondition,
    { order }: OrderBy,
  ) {
    return await this[collection]
      .where(condition.field, "==", condition.value)
      .orderBy(order.field, order.by)
      .get();
  }

  async findUniqueOrThrow(collection: CollectionName, condition: SearchCondition, select?: Select) {
    const data = await this.findUnique(collection, condition, select);
    if (!data) {
      throw new Error("Data not found");
    }
    return data;
  }

  async findFirstOrThrow(
    collection: CollectionName,
    conditions: SearchConditions,
    select?: Select,
  ) {
    const data = await this.findFirst(collection, conditions, select);
    if (!data) {
      throw new Error("Data not found");
    }
    return data;
  }

  async updateItem(collection: CollectionName, { condition }: SearchCondition, { dto }: any) {
    return this[collection]
      .where(condition.field, "==", condition.value)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(async (doc: any) => {
          return await doc.ref.update(dto);
        });
      })
      .catch((error: Error) => {
        Logger.log(
          `Error while updating doc with ${condition.field}=${condition.value} in ${collection}`,
          error,
        );
      });
  }

  async deleteByField(collection: CollectionName, { condition }: SearchCondition) {
    return await this[collection]
      .where(condition.field, "==", condition.value)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(async (doc: any) => {
          return await doc.ref.delete();
        });
      })
      .catch((error: Error) => {
        Logger.log(
          `Error while deleting doc with ${condition.field}=${condition.value} in ${collection}`,
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
