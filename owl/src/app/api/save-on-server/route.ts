import fs from 'fs';
import path from 'path';
import { NextApiResponse } from "next";
import extractChunks from 'png-chunks-extract';
import encodeChunks from 'png-chunks-encode';
import PNGtext from 'png-chunk-text';

export async function POST(req: Request,
  res: NextApiResponse<Response>) {
  const body = await req.json();

  const buffer = Buffer.from(body.base_image, 'base64');
  const chunks = extractChunks(buffer);

  const date = new Date();
  const dateFolder = date.toISOString().slice(0, 10); // YYYY-MM-DD

  const infoObj = JSON.parse(body.parameters);
  const seed = infoObj.seed || Date.now();
  const metadata = infoObj.infotexts?.[0] || 'no metadata';

  const textChunk = PNGtext.encode('parameters', metadata);
  chunks.push(textChunk);

  const outputBuffer = Buffer.from(encodeChunks(chunks));

  const outputDir = path.join(process.cwd(), 'public/generated', dateFolder);
  const fileName = `${seed}.png`;
  const filePath = path.join(outputDir, fileName);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(filePath, outputBuffer);

  return new Response(
    JSON.stringify({ path: `/generated/${dateFolder}/${fileName}` }),
    { status: 200 }
  );
}