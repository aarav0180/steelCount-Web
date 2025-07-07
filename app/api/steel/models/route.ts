import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      "https://steel-count-app-new.salmonstone-3d570dc6.eastus.azurecontainerapps.io/available-models",
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      throw new Error(`Steel models fetch failed with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Steel models proxy error:", error)
    return NextResponse.json(
      { error: "Failed to fetch steel models", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
