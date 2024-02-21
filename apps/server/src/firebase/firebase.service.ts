import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import admin, { firestore } from "firebase-admin";
import { createId } from "@paralleldrive/cuid2";
import { RedisService } from "@songkeys/nestjs-redis";
import { Redis } from "ioredis";
import sharp from "sharp";

import { Config } from "../config/schema";
import {} from "firebase-admin";

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

type ImageUploadType = "pictures" | "previews";
type DocumentUploadType = "resumes";

type UploadType = ImageUploadType | DocumentUploadType;

@Injectable()
export class FirebaseService {
  private readonly db: FirebaseFirestore.Firestore;
  userCollection: FirebaseFirestore.CollectionReference;
  planCollection: FirebaseFirestore.CollectionReference;
  resumeCollection: FirebaseFirestore.CollectionReference;
  secretCollection: FirebaseFirestore.CollectionReference;
  usageCollection: FirebaseFirestore.CollectionReference;

  bucket: any;
  storageBucket: string;
  redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<Config>,
  ) {
    this.db = admin.firestore();
    this.userCollection = this.db.collection("users");
    this.planCollection = this.db.collection("plans");
    this.resumeCollection = this.db.collection("resumes");
    this.secretCollection = this.db.collection("secrets");
    this.usageCollection = this.db.collection("usage");

    this.storageBucket = this.configService.getOrThrow<string>("STORAGE_BUCKET");
    this.bucket = admin.storage().bucket(this.storageBucket);
    this.redis = this.redisService.getClient();
  }

  async create<T>(collection: CollectionName, { dto }: { dto: T }) {
    return await this[collection as keyof FirebaseService].add(dto);
  }

  async findUnique(
    collection: CollectionName,
    { condition }: SearchCondition,
    { select }: Select = { select: [] },
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

  async updateItem<T>(
    collection: CollectionName,
    { condition }: SearchCondition,
    { dto }: { dto: any },
  ) {
    let updatedItem: T | null = null;
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
    { condition }: SearchCondition,
    { dto }: { dto: Condition },
  ) {
    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await this[
      collection as keyof FirebaseService
    ]
      .where(condition.field, "==", condition.value)
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

  async bucketExists() {
    await Promise.all([this.bucket.exists(), this.bucket.getFiles()]);
  }

  async areAllCollectionsAvailable() {
    await Promise.all([
      this.userCollection.get(),
      this.planCollection.get(),
      this.resumeCollection.get(),
      this.secretCollection.get(),
      this.usageCollection.get(),
    ]);
  }

  async uploadObject(
    userId: string,
    type: UploadType,
    buffer: Buffer,
    filename: string = createId(),
  ) {
    const extension = type === "resumes" ? "pdf" : "jpg";
    const filepath = `${userId}/${type}/${filename}.${extension}`;

    const metadata =
      extension === "jpg"
        ? { "Content-Type": "image/jpeg" }
        : {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=${filename}.${extension}`,
          };

    try {
      if (extension === "jpg") {
        // If the uploaded file is an image, use sharp to resize the image to a maximum width/height of 600px
        buffer = await sharp(buffer)
          .resize({ width: 600, height: 600, fit: sharp.fit.outside })
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      const file = await this.bucket.file(filepath);
      await file.save(buffer);
      await file.setMetadata(metadata);

      const signedUrl = await file.getSignedUrl({
        action: "read",
        expires: new Date().getTime() + 24 * 60000,
      });

      return signedUrl[0];
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException("There was an error while uploading the file.");
    }
  }

  async deleteObject(userId: string, type: UploadType, filename: string) {
    const extension = type === "resumes" ? "pdf" : "jpg";
    const path = `${userId}/${type}/${filename}.${extension}`;

    try {
      return await Promise.all([
        this.redis.del(`user:${userId}:storage:${type}:${filename}`),
        this.bucket.delete({
          prefix: path,
        }),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(
        `There was an error while deleting the document at the specified path: ${path}.`,
      );
    }
  }

  async deleteFolder(prefix: string) {
    try {
      return await this.bucket.deleteFolder(prefix);
    } catch (error) {
      throw new InternalServerErrorException(
        `There was an error while deleting the folder at the specified path: ${this.storageBucket}/${prefix}.`,
      );
    }
  }
}
