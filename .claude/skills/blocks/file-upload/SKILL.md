---
name: file-upload
description: Adds Open SaaS file uploads to AWS S3: upload with progress, a list of your files, download and delete. Use when the person wants people to upload, store, attach or download files, images or documents.
---

# File upload block

**For the person:** people can upload files (images, PDFs, videos, text), see the list of their uploads, download and delete them.

**Secrets and accounts:** an AWS account with an S3 bucket and an IAM user that can read and write it:

| Variable | Value |
| --- | --- |
| `AWS_S3_IAM_ACCESS_KEY`, `AWS_S3_IAM_SECRET_KEY` | The IAM user's access key |
| `AWS_S3_FILES_BUCKET` | The bucket name |
| `AWS_S3_REGION` | The bucket's region, e.g. `eu-central-1` |

The bucket needs a CORS rule that allows `POST` and `GET` from the app's URL (see the Open SaaS file upload guide in its llms.txt). Until the variables are set, the page lists files and shows: "File uploads aren't set up yet. Connect an S3 bucket to turn them on." in place of the upload form. Tell the person that in plain words, list the variables, and say they go in the platform's environment settings. Never ask them to paste a key into chat or a file.

The code comes from Open SaaS at tag `wasp-v0.26-template`. Fetch each file with:

```sh
curl -fsSL "https://raw.githubusercontent.com/wasp-lang/open-saas/wasp-v0.26-template/template/app/<path>" -o "<path>"
```

## 1. Bring in the files

Fetch into `src/file-upload/`, keeping the same paths: `file-upload.wasp.ts`, `FileUploadPage.tsx`, `fileUploading.ts`, `operations.ts`, `s3Utils.ts`, `validation.ts`, `env.ts`.

Set the accepted types and size in `validation.ts` (`ALLOWED_FILE_TYPES`, `MAX_FILE_SIZE_BYTES`) to what the person needs, for example only images.

## 2. Make the keys optional

In Open SaaS the server refuses to start without the keys. Here it must start.

1. In `src/file-upload/env.ts`, make every variable optional: `z.string().optional()`.
2. Create `src/env.ts` (or extend it if it exists) and register it in `main.wasp.ts` with `server: { envValidationSchema: serverEnvValidationSchema }`, importing it as `import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };`:

   ```ts
   import { defineEnvValidationSchema } from "wasp/env";
   import * as z from "zod";
   import { fileUploadEnvSchema } from "./file-upload/env";

   // Wasp validates `process.env` with this schema at server startup.
   // Read the values with `import { env } from "wasp/server"`.
   export const serverEnvValidationSchema = defineEnvValidationSchema(
     z.object({
       ...fileUploadEnvSchema.shape,
     }),
   );
   ```

3. In `s3Utils.ts`, replace the exported `s3Client` constant with a function that checks the settings first, and use it (and the returned bucket) everywhere `s3Client` and `env.AWS_S3_FILES_BUCKET` were used:

   ```ts
   export const FILE_UPLOADS_NOT_SET_UP_MESSAGE =
     "File uploads aren't set up yet. Connect an S3 bucket to turn them on.";

   function getS3Settings() {
     const { AWS_S3_REGION, AWS_S3_IAM_ACCESS_KEY, AWS_S3_IAM_SECRET_KEY, AWS_S3_FILES_BUCKET } = env;
     if (!AWS_S3_REGION || !AWS_S3_IAM_ACCESS_KEY || !AWS_S3_IAM_SECRET_KEY || !AWS_S3_FILES_BUCKET) {
       throw new HttpError(503, FILE_UPLOADS_NOT_SET_UP_MESSAGE);
     }
     const client = new S3Client({
       region: AWS_S3_REGION,
       credentials: { accessKeyId: AWS_S3_IAM_ACCESS_KEY, secretAccessKey: AWS_S3_IAM_SECRET_KEY },
     });
     return { client, bucket: AWS_S3_FILES_BUCKET };
   }

   export function areFileUploadsSetUp(): boolean {
     return Boolean(env.AWS_S3_REGION && env.AWS_S3_IAM_ACCESS_KEY && env.AWS_S3_IAM_SECRET_KEY && env.AWS_S3_FILES_BUCKET);
   }
   ```

   Import `HttpError` from `wasp/server`.
4. Add a query `getFileUploadsStatus` to `operations.ts` that checks `context.user` and returns `{ isSetUp: areFileUploadsSetUp() }`, and declare it in `file-upload.wasp.ts` with `query(getFileUploadsStatus, { entities: [] })`.
5. In `FileUploadPage.tsx`, read it with `useQuery(getFileUploadsStatus)`. When `isSetUp` is false, render an `Alert` from the UI kit with `FILE_UPLOADS_NOT_SET_UP_MESSAGE`'s text in place of the upload form, and keep the file list.

## 3. Adapt the page

- Rewrite the intro ("This is an example file upload page using AWS S3...") for the person, for example "Upload files and find them here later.", and put headings and buttons in sentence case.
- The list needs loading, empty ("No files yet") and error states.

## 4. Schema

Add to `schema.prisma`, and `files File[]` to `User`:

```prisma
model File {
  id                        String          @id @default(uuid())
  createdAt                 DateTime        @default(now())

  user                      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                    String

  name                      String
  type                      String
  s3Key                     String
}
```

The platform generates and applies the migration.

## 5. Spec, dependencies and navigation

- `main.wasp.ts`: `import { fileUploadSpec } from "./src/file-upload/file-upload.wasp";` and add `fileUploadSpec` to `spec: [...]`. It declares `/file-upload` (`FileUploadRoute`) and the file operations.
- `package.json` dependencies: `"@aws-sdk/client-s3": "^3.523.0"`, `"@aws-sdk/s3-presigned-post": "^3.750.0"`, `"@aws-sdk/s3-request-presigner": "^3.523.0"`, `"ky": "^2.0.0"`.
- `src/client/components/NavBar/constants.ts`: add `{ name: "Files", to: routes.FileUploadRoute.to }`.

## 6. Verify

1. `npx tsc -p tsconfig.src.json --noEmit` passes.
2. Without the AWS variables, the server starts and the files page shows the not-set-up message with an empty list.
3. With a bucket, uploading shows progress, the file appears in the list, and download and delete work.
4. Check the page in light and dark mode at desktop and phone widths, with no browser console errors.
