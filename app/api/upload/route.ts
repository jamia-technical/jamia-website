import { NextResponse } from 'next/server';
import cloudinary from '../../../utils/cloudinary';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (imageFile.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Image file must be 5MB or smaller' }, { status: 413 });
    }

    // Convert the File object to a Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload via stream to Cloudinary directly from memory
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'jmn' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      message: 'Upload successful',
      image: result.secure_url,  
      imgid: result.public_id,   
    }, { status: 200 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
