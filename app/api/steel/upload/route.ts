import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Forward the request to the steel count API
    const response = await fetch(
      "https://steel-count-app-new.salmonstone-3d570dc6.eastus.azurecontainerapps.io/upload-image",
      {
        method: "POST",
        body: formData,
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Steel upload failed with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Steel upload proxy error:", error)
    return NextResponse.json(
      { error: "Steel upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
