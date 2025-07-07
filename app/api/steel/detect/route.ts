import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { image_ids, model_choice, brightness, contrast, gamma } = await request.json()

    console.log("Received detection request:", {
      image_ids,
      model_choice,
      brightness,
      contrast,
      gamma,
    })

    // Ensure we have the required fields
    if (!image_ids || !model_choice) {
      return NextResponse.json(
        { error: "Missing required fields: image_ids and model_choice are required" },
        { status: 400 },
      )
    }

    // Create FormData for the steel API (not JSON)
    const formData = new FormData()
    formData.append("image_ids", Array.isArray(image_ids) ? image_ids.join(",") : String(image_ids))
    formData.append("model_choice", String(model_choice))
    formData.append("brightness", String(brightness || 0))
    formData.append("contrast", String(contrast || 0))
    formData.append("gamma", String(gamma || 1.0))

    console.log("Sending FormData to steel API with fields:", {
      image_ids: formData.get("image_ids"),
      model_choice: formData.get("model_choice"),
      brightness: formData.get("brightness"),
      contrast: formData.get("contrast"),
      gamma: formData.get("gamma"),
    })

    const response = await fetch(
      "https://steel-count-app-new.salmonstone-3d570dc6.eastus.azurecontainerapps.io/detect",
      {
        method: "POST",
        body: formData, // Send as FormData, not JSON
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Steel API error:", errorText)
      throw new Error(`Steel detect ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("Steel API response:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Detection proxy error:", error)
    return NextResponse.json(
      {
        error: "Detection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
