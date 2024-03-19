import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import admin, { firestore } from "firebase-admin";
import { getDownloadURL } from "firebase-admin/storage";

import { createId } from "@paralleldrive/cuid2";
import { RedisService } from "@songkeys/nestjs-redis";
import { Redis } from "ioredis";
import sharp from "sharp";

import { Config } from "../config/schema";
import { ChangeFieldAction } from "@reactive-resume/dto";

type CollectionName =
  | "userCollection"
  | "planCollection"
  | "resumeCollection"
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

type ConditionsKeys = "user" | "slug" | "visibility";

type MultipleConditions = {
  conditions: {
    [K in ConditionsKeys]: Condition;
  };
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
  usageCollection: FirebaseFirestore.CollectionReference;
  subcriptionCollection: FirebaseFirestore.CollectionReference;

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
    this.usageCollection = this.db.collection("usage");
    this.subcriptionCollection = this.db.collection("subcriptions");

    this.storageBucket = this.configService.getOrThrow<string>("STORAGE_BUCKET");
    this.bucket = admin.storage().bucket(this.storageBucket);
    this.redis = this.redisService.getClient();
  }

  async create(collection: CollectionName, { dto }: { dto: any }, docId?: string) {
    const docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> =
    await this[collection as keyof FirebaseService].doc(docId || createId());
    await docRef.set(dto, { merge: true });
    const docSnapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> =
    await docRef.get();
    return { id: docRef.id, ...docSnapshot.data() };
  }

  async findUnique(
    collection: CollectionName,
    { condition }: SearchCondition,
    { select }: Select = { select: [] },
  ) {
    return condition.field == "id"
      ? this.findUniqueById(collection, condition.value, select)
      : this.findUniqueByField(collection, { condition }, select);
  }

  async findUniqueById(collection: CollectionName, docId: string, select?: string[]) {
    const docRef = await this[collection as keyof FirebaseService].doc(docId);

    const query = docRef;

    if (select && select?.length > 0) {
      query.select(...select);
      Logger.log("select case");
    }

    const doc = await docRef.get();
    Logger.log("doc.data()", JSON.stringify(doc.data()));
    return { id: docId, ...doc.data() };
  }

  async findUniqueByField(
    collection: CollectionName,
    { condition }: SearchCondition,
    select?: string[],
  ) {
    const query: firestore.Query = await this[collection as keyof FirebaseService].where(
      condition.field,
      "==",
      condition.value,
    );

    if (select && select?.length > 0) {
      query.select(...select);
    }

    const querySnapshot = await query.get();

    return querySnapshot.size < 1
      ? null
      : querySnapshot.docs.map(
          (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
          }),
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

  async findDocId(collection: CollectionName, { condition }: SearchCondition) {
    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await this[
      collection as keyof FirebaseService
    ]
      .where(condition.field, "==", condition.value)
      .get();

    const id = querySnapshot.docs.map(
      (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => doc.id,
    )[0];

    return id;
  }

  async findUniqueResumeByMultipleConditions({ conditions }: MultipleConditions) {
    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> =
      await this.resumeCollection
        .where(conditions.user.field, "==", conditions.user.value)
        .where(conditions.slug.field, "==", conditions.slug.value)
        .where(conditions.visibility.field, "==", conditions.visibility.value)
        .get();

    return querySnapshot.size > 1
      ? null
      : querySnapshot.docs.map(
          (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => doc.data(),
        )[0];
  }
  
  async findUniqueOrThrow(collection: CollectionName, condition: SearchCondition, select?: Select) {
    const data = await this.findUnique(collection, condition, select);
    if (!data) {
      throw new Error("Data not found");
    }
    return data;
  }

  async findFirstResumeOrThrow(conditions: MultipleConditions) {
    const data = await this.findUniqueResumeByMultipleConditions(conditions);
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

  async updateItem(
    collection: CollectionName,
    { condition }: SearchCondition,
    { dto }: { dto: any },
  ) {
    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await this[
      collection as keyof FirebaseService
    ]
      .where(condition.field, "==", condition.value)
      .get();

    const doc = querySnapshot.docs[0];
    await doc.ref.set(dto, { merge: true });
    return { id: doc.id, ...doc.data() };
  }

  async changeFieldByNumber(
    collection: CollectionName,
    { condition }: SearchCondition,
    { dto }: { dto: Condition },
    action: ChangeFieldAction,
  ) {
    const querySnapshot: firestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await this[
      collection as keyof FirebaseService
    ]
      .where(condition.field, "==", condition.value)
      .get();

    querySnapshot.forEach(
      async (doc: firestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
        const currentUsage = doc.data()[dto.field] || 0;

        const newDto =
          action === "increment"
            ? { ...doc.data(), [dto.field]: currentUsage + dto.value }
            : { ...doc.data(), [dto.field]: currentUsage - dto.value };
        await doc.ref.set(newDto, { merge: true });
      },
    );
  }

  async deleteByField(collection: CollectionName, { condition }: SearchCondition) {
    return this[collection as keyof FirebaseService]
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

  async deleteByDocId(collection: CollectionName, docId: string) {
    const docRef = await this[collection as keyof FirebaseService].doc(docId);
    const doc = (await docRef.get()).data();
    await docRef.delete();
    return { id: docId, doc };
  }

  async bucketExists() {
    await Promise.all([this.bucket.exists(), this.bucket.getFiles()]);
  }

  async areAllCollectionsAvailable() {
    await Promise.all([
      this.userCollection.get(),
      this.planCollection.get(),
      this.resumeCollection.get(),
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

      const fileRef = await this.bucket.file(filepath);
      await fileRef.save(buffer);
      await fileRef.setMetadata(metadata);

      const downloadURL = await getDownloadURL(fileRef);

      return downloadURL;
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
        this.deleteFile(path),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(
        `There was an error ${error} while deleting the document at the specified path: ${path}.}`,
      );
    }
  }

  async deleteFile(path: string) {
    const file = this.bucket.file(path);

    try {
      const exists = await file.exists();
      if (exists[0]) await file.delete();
    } catch (error) {
      throw new Error(`File at path ${path} is not deleted, error: ${error}.`);
    }
  }

  async deleteFolder(prefix: string) {
    try {
      const [files] = await this.bucket.getFiles({
        prefix,
      });

      await Promise.all(files.map((file: any) => file.delete()));
    } catch (error) {
      throw new InternalServerErrorException(
        `There was an error ${error} while deleting the folder at the specified path: ${this.storageBucket}/${prefix}.`,
      );
    }
  }
}
