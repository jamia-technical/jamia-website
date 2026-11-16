import { NextResponse } from 'next/server';
import cloudinary from '../../../utils/cloudinary';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary destroy result:', result);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return NextResponse.json({
        error: 'Failed to delete image from Cloudinary',
        cloudinaryResult: result,
      }, { status: 400 });
    }

    return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message || 'Deletion failed' }, { status: 500 });
  }
}
