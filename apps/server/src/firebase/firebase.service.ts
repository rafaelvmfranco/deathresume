import { Inject, Injectable, Logger } from "@nestjs/common";
import { app, firestore } from "firebase-admin";

type CollectionName =
  | "userCollection"
  | "planCollection"
  | "resumeCollection"
  | "secretCollection"
  | "usageCollection"
  | "subcriptionCollection";

type Condition = {
  field: string;
  value: any;
};

type SearchCondition = {
  condition: Condition;
};

type SearchConditions = {
  conditions: Condition[];
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

type Secret = {
  includeSecret?: boolean;
};

@Injectable()
export class FirebaseService {
  db: FirebaseFirestore.Firestore;
  bucket: any;
  userCollection: FirebaseFirestore.CollectionReference;
  planCollection: FirebaseFirestore.CollectionReference;
  resumeCollection: FirebaseFirestore.CollectionReference;
  secretCollection: FirebaseFirestore.CollectionReference;
  usageCollection: FirebaseFirestore.CollectionReference;

  constructor(@Inject("FIREBASE_APP") private firebaseApp: app.App) {
    this.db = firebaseApp.firestore();
    this.bucket = firebaseApp.storage().bucket();
    this.userCollection = this.db.collection("users");
    this.planCollection = this.db.collection("plans");
    this.resumeCollection = this.db.collection("resumes");
    this.secretCollection = this.db.collection("secrets");
    this.usageCollection = this.db.collection("usage");
  }

  async create<T>(
    collection: CollectionName,
    { dto }: { dto: T },
    { includeSecret }: Partial<Secret> = { includeSecret: false },
  ) {
    return await this[collection as keyof FirebaseService].add(dto);
  }

  async findUnique(
    collection: CollectionName,
    { condition }: SearchCondition,
    { select }: Select = { select: [] },
    { includeSecret }: Secret = { includeSecret: false },
  ) {
    const selectionCondition = select && select.length > 0 ? select.join(",") : "*";

    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await this[
      collection as keyof FirebaseService
    ]
      .where(condition.field, "==", condition.value)
      .select(selectionCondition)
      .get();

    return querySnapshot.size > 1
      ? null
      : querySnapshot.docs.map(
          (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => doc.data(),
        )[0];
  }

  async findFirst(
    collection: CollectionName,
    { conditions }: SearchConditions,
    { select }: Select = { select: [] },
  ) {
    const selectionCondition = select && select.length > 0 ? select.join(",") : "*";

    let query: firestore.Query = this[collection as keyof FirebaseService];

    conditions.forEach((condition) => {
      query = query.where(condition.field, "==", condition.value);
    });

    const querySnapshot = await query.select(selectionCondition).limit(1).get();

    return querySnapshot.docs.map(
      (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => doc.data(),
    )[0];
  }

  async findMany(collection: CollectionName, condition?: SearchCondition) {
    let query: firestore.Query = this[collection as keyof FirebaseService];

    if (condition) {
      query = query.where(condition.condition.field, "==", condition.condition.value);
    }

    return (await query.get()).docs.map(
      (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => doc.data(),
    );
  }

  async findManyAndOrder(
    collection: CollectionName,
    { condition }: SearchCondition,
    { order }: OrderBy,
  ) {
    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await this[
      collection as keyof FirebaseService
    ]
      .where(condition.field, "==", condition.value)
      .orderBy(order.field, order.by)
      .get();

    return querySnapshot.docs.map(
      (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => doc.data(),
    );
  }

  async findUniqueOrThrow(
    collection: CollectionName,
    condition: SearchCondition,
    select?: Select,
    includeSecret?: Secret,
  ) {
    const data = await this.findUnique(collection, condition, select, includeSecret);
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

  async updateItem<T>(collection: CollectionName, { condition }: SearchCondition, { dto }: {dto: any}) {
    let updatedItem: T | null = null
    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await this[
      collection as keyof FirebaseService
    ]
      .where(condition.field, "==", condition.value)
      .get();

    querySnapshot.forEach(
      async (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
        const documentRef = this[collection as keyof FirebaseService].doc(doc.id);
        await doc.ref.update(dto);
        updatedItem = await documentRef.get().data();
      },
    );

    return updatedItem;
  }

  async increaseFieldByNumber(
    collection: CollectionName,
    condition: SearchCondition,
    { dto }: { dto: Condition },
  ) {
    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await this[
      collection as keyof FirebaseService
    ]
      .where(dto.field, "==", dto.value)
      .get();

      querySnapshot.forEach(
        async (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
          const currentUsage = doc.data()[dto.field] || 0;
          const newDto = { ...doc.data(), [dto.field]: currentUsage + dto.value };
          await doc.ref.update(newDto);
        },
      );
  }

  async deleteByField(collection: CollectionName, { condition }: SearchCondition) {
    this[collection as keyof FirebaseService]
      .where(condition.field, "==", condition.value)
      .get()
      .then((querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData>) => {
        querySnapshot.forEach(
          async (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
            await doc.ref.delete();
          },
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
