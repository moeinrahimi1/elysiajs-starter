import sharp from "sharp";
import { minioClient } from "./minio";
import { env } from "@/config";

interface SegmentConfig {
  directory: string;
  model: string;
  convert: boolean;
  fit?: keyof sharp.FitEnum;
  width?: number;
  height?: number;
}

const bucketName = env.BUCKET_NAME || "hafezsho";

function fileFilter(file: File): boolean {
  console.log(file, file.type);
  const baseFormats = ["image/png", "image/jpeg", "video/mp4"];
  const authorizedFormats = [...baseFormats];
  return authorizedFormats.includes(file.type);
}

// Convert function
async function convert(
  file: File,
  key: string,
  w = 512,
  h = 512,
  fit: keyof sharp.FitEnum = "inside"
): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    const splitKey = key.split("/");
    const imageName = splitKey[splitKey.length - 1];
    const directory = key.replace(`/${imageName}`, "");
    const filename = imageName;
    const filenameRAW = filename.split(".")[0];
    const output = `${directory}/${filenameRAW}`;

    const [webpResizedBuffer] = await Promise.all([
      sharp(buffer).resize(w, h, { fit }).webp({ effort: 6 }).toBuffer(),
    ]);

    await Promise.all([
      minioClient.putObject(bucketName, `${output}.webp`, webpResizedBuffer),
    ]);

    return `${process.env.MINIO_ENDPOINT}/${bucketName}/${output}.webp`;
  } catch (e) {
    console.error("Error in convert function:", e);
    throw e;
  }
}

// Segment to directory function
function segmentToDirectory(segment: string): SegmentConfig {
  const segments: { [key: string]: SegmentConfig } = {
    splash: {
      directory: "images/splash",
      model: "splash",
      convert: true,
      fit: "inside",
      width: 512,
      height: 512,
    },

  };
  return segments[segment];
}

export const uploadApi = async (file: File, segment: string) => {
  console.log(file, segment);
  if (!segment) throw new Error("سگمنت مشخص نشده است");

  // const file = body.file as File;
  if (!file || !fileFilter(file)) throw new Error("فرمت فایل مجاز نمیباشد");

  const {
    directory,
    model,
    convert: shouldConvert,
    fit,
    width,
    height,
  } = segmentToDirectory(segment);
  const originalName = file.name;
  const objectName = `${Date.now()}-${originalName.replace(
    /\.[^/.]+$/,
    ""
  )}.webp`;

  const key = `${directory}/${objectName}`;

  const url = await convert(file, key, width, height, fit);
  console.log(url, "url");
  return url;
};

export const setFileName = (url: string) => {
  if (!url) return undefined;
  let file = url.split("/");
  return file[file.length - 1];
};

export const getUrl = (filename: string, segment: string) => {
  if (!filename) return undefined;
  let { directory } = segmentToDirectory(segment);
  return new URL(`${env.CDN_URL}/${env.BUCKET_NAME}/${directory}/${encodeURI(
    filename
  )}`);
};
