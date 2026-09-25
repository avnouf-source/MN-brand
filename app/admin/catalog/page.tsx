import { prisma } from '@/lib/prisma'
import { ProductCatalogView } from '@/components/admin/ProductCatalogView'
import { OFFICIAL_PERFUME_CATALOG, PerfumeProduct } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  let products: PerfumeProduct[] = []
  try {
    const dbProds = await prisma.product.findMany({
      orderBy: { productCode: 'asc' },
    })

    if (dbProds.length > 0) {
      products = dbProds.map(p => ({
        id: p.id,
        productCode: p.productCode,
        productName: p.productName,
        gender: p.gender as any,
        price50ml: p.price50ml,
        price100ml: p.price100ml,
        inspiredVersion: p.inspiredVersion || undefined,
        topNotes: p.topNotes || '',
        middleNotes: p.middleNotes || '',
        baseNotes: p.baseNotes || '',
        strength: p.strength as any,
        inStock: p.inStock,
      }))
    } else {
      products = OFFICIAL_PERFUME_CATALOG
    }
  } catch (error) {
    console.warn('[CatalogPage] Falling back to official catalog data:', error)
    products = OFFICIAL_PERFUME_CATALOG
  }

  return <ProductCatalogView initialProducts={products} />
}
