import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { image_ids, model_name } = await request.json()

    // Create form data for the classification API
    const formData = new FormData()
    formData.append("image_ids", image_ids)
    formData.append("model_name", model_name)

    const response = await fetch(
      "https://scaffold-classifier-app.purpledesert-bb804eea.japaneast.azurecontainerapps.io/classify",
      {
        method: "POST",
        body: formData,
      },
    )

    if (!response.ok) {
      throw new Error(`Classification failed with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Classification proxy error:", error)
    return NextResponse.json(
      { error: "Classification failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
