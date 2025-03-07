import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('photo-'))
      .map(([_, value]) => value as File);

    // TODO: Implementeer echte bestandsupload naar cloud storage
    const uploadedUrls = files.map((_, index) => `/dummy-photo-${index}.jpg`);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const observation = await prisma.observation.create({
      data: {
        text: 'Nieuwe waarneming', // TODO: Koppel aan transcriptie
        userId: user!.id,
        photos: {
          create: uploadedUrls.map(url => ({
            url,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, observation });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het uploaden' },
      { status: 500 }
    );
  }
} 