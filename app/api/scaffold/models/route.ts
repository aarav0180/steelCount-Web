import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      "https://scaffold-classifier-app.purpledesert-bb804eea.japaneast.azurecontainerapps.io/classification-models",
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      throw new Error(`Models fetch failed with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Models proxy error:", error)
    return NextResponse.json(
      { error: "Failed to fetch models", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
