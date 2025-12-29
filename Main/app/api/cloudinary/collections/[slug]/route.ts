import { NextResponse } from "next/server"
import { getCollection } from "@/lib/collections"

interface Params {
  params: {
    slug: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const collection = await getCollection(params.slug)
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }
    return NextResponse.json({ collection })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
