import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OFFICIAL_PERFUME_CATALOG } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const strength = searchParams.get('strength')
    const gender = searchParams.get('gender')
    const query = searchParams.get('q')?.toLowerCase()

    let products = await prisma.product.findMany({
      orderBy: { productCode: 'asc' },
    })

    if (products.length === 0) {
      // Fallback to static catalog if DB is unseeded
      products = OFFICIAL_PERFUME_CATALOG as any
    }

    if (strength && strength !== 'ALL') {
      products = products.filter((p: any) => p.strength?.toUpperCase() === strength.toUpperCase())
    }

    if (gender && gender !== 'ALL') {
      products = products.filter((p: any) => p.gender?.toUpperCase() === gender.toUpperCase())
    }

    if (query) {
      products = products.filter(
        (p: any) =>
          p.productCode?.toLowerCase().includes(query) ||
          p.productName?.toLowerCase().includes(query) ||
          (p.inspiredVersion && p.inspiredVersion.toLowerCase().includes(query)) ||
          (p.topNotes && p.topNotes.toLowerCase().includes(query)) ||
          (p.middleNotes && p.middleNotes.toLowerCase().includes(query)) ||
          (p.baseNotes && p.baseNotes.toLowerCase().includes(query))
      )
    }

    return NextResponse.json(products)
  } catch (error) {
    console.warn('[Products API] Error querying products, returning static catalog:', error)
    return NextResponse.json(OFFICIAL_PERFUME_CATALOG)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productCode,
      productName,
      gender = 'UNISEX',
      price50ml,
      price100ml,
      inspiredVersion,
      topNotes,
      middleNotes,
      baseNotes,
      strength = 'MODERATE',
    } = body

    if (!productCode || !productName || !price50ml || !price100ml) {
      return NextResponse.json({ error: 'Missing required perfume fields' }, { status: 400 })
    }

    const created = await prisma.product.create({
      data: {
        productCode,
        productName: productName.toUpperCase(),
        gender,
        price50ml: parseFloat(price50ml),
        price100ml: parseFloat(price100ml),
        inspiredVersion,
        topNotes,
        middleNotes,
        baseNotes,
        strength,
        inStock: true,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create perfume' }, { status: 500 })
  }
}
