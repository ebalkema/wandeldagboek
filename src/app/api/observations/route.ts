import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const observations = await prisma.observation.findMany({
      where: { userId: user!.id },
      include: { photos: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(observations);
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van de waarnemingen' },
      { status: 500 }
    );
  }
} 