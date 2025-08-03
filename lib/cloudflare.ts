import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"

// Ensure you have these environment variables set in your .env.local file
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  throw new Error("Cloudflare R2 environment variables are not set.")
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadHostelImages(userId: string, images: File[]): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (const image of images) {
    const fileBuffer = await image.arrayBuffer()
    const key = `hostels/${userId}/${randomUUID()}-${image.name}`

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: image.type,
    })

    try {
      await s3.send(command)
      const publicUrl = `${R2_PUBLIC_URL}/${key}`
      uploadedUrls.push(publicUrl)
    } catch (error) {
      console.error(`Error uploading image ${image.name}:`, error)
      throw new Error(`Failed to upload image: ${image.name}`)
    }
  }

  return uploadedUrls
} 