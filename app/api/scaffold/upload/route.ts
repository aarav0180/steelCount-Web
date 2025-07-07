import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Forward the request to the scaffold classifier API
    const response = await fetch(
      "https://scaffold-classifier-app.purpledesert-bb804eea.japaneast.azurecontainerapps.io/upload",
      {
        method: "POST",
        body: formData,
      },
    )

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Upload proxy error:", error)
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
