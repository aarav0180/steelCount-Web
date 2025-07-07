"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"

// Same hardcoded model translations
const HARDCODED_MODELS = {
  "Scaffold Plank(Wood)": { en: "Scaffold Plank(Wood)", ja: "足場板（木材）" },
  "Scaffold Plank(Steel)": { en: "Scaffold Plank(Steel)", ja: "足場板（鋼材）" },
  Roundpipes: { en: "Roundpipes", ja: "丸パイプ" },
  "plank[Plank SKN, PlankNDN2, Plank NDN1, Plank BKN]": {
    en: "plank[Plank SKN, PlankNDN2, Plank NDN1, Plank BKN]",
    ja: "板材[Plank SKN, PlankNDN2, Plank NDN1, Plank BKN]",
  },
  "Scaffold Plank(Alumi)": { en: "Scaffold Plank(Alumi)", ja: "足場板（アルミ）" },
  "ND Connector": { en: "ND Connector", ja: "NDコネクタ" },
  "ND press": { en: "ND press", ja: "NDプレス" },
  "ND Post": { en: "ND Post", ja: "NDポスト" },
  "Aluminum Stairs": { en: "Aluminum Stairs", ja: "アルミ階段" },
  "Toe Board": { en: "Toe Board", ja: "つま先板" },
  "Rectangle pipes": { en: "Rectangle pipes", ja: "角パイプ" },
}

export default function CountingPage() {
  const [scaffoldFiles, setScaffoldFiles] = useState<any[]>([])
  const [steelFiles, setSteelFiles] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [classificationResults, setClassificationResults] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalImages, setOriginalImages] = useState<any[]>([])
  const router = useRouter()
  const { showToast } = useToast()
  const { t, language } = useLanguage()

  // Function to get translated model name for display
  const getModelDisplayName = (modelId: string) => {
    const modelData = HARDCODED_MODELS[modelId as keyof typeof HARDCODED_MODELS]
    if (modelData) {
      return language === "ja" ? modelData.ja : modelData.en
    }
    return modelId // Fallback to original ID
  }

  useEffect(() => {
    const scaffoldData = localStorage.getItem("scaffoldFiles")
    const steelData = localStorage.getItem("steelFiles")
    const model = localStorage.getItem("selectedCountingModel")
    const classification = localStorage.getItem("classificationResults")
    const images = localStorage.getItem("originalImages")

    if (!scaffoldData || !steelData || !model || !classification) {
      router.push("/")
      return
    }

    setScaffoldFiles(JSON.parse(scaffoldData))
    setSteelFiles(JSON.parse(steelData))
    setSelectedModel(model)
    setClassificationResults(JSON.parse(classification))

    // Load original images for display
    if (images) {
      try {
        setOriginalImages(JSON.parse(images))
      } catch (error) {
        console.error("Failed to parse original images:", error)
      }
    }
  }, [router])

  const handleStartCounting = async () => {
    if (steelFiles.length === 0) {
      showToast({
        title: t("toast.no.images"),
        description: t("toast.no.images.desc"),
        variant: "error",
      })
      return
    }

    setIsProcessing(true)
    try {
      // Extract image_id from steel files
      const steelImageIds = steelFiles.map((file) => file.image_id || file.file_id).filter(Boolean)

      if (steelImageIds.length === 0) {
        throw new Error("No valid image IDs found in steel files")
      }

      console.log("Starting counting with model (English ID):", selectedModel)

      // Call the steel count detection API via our proxy
      const response = await fetch("/api/steel/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_ids: steelImageIds,
          model_choice: selectedModel, // Use original English model ID for API
          brightness: 0,
          contrast: 0,
          gamma: 1.0,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("countingResults", JSON.stringify(data))

        showToast({
          title: t("toast.counting.complete"),
          description: t("toast.counting.complete.desc"),
          variant: "success",
        })

        setTimeout(() => router.push("/results"), 1000)
      } else {
        const errorData = await response.json()
        console.error("Detection API error:", errorData)
        throw new Error(errorData.details || "Detection failed")
      }
    } catch (error: any) {
      console.error("Counting failed:", error)

      // Fallback to mock results for demonstration
      const mockResults = {
        success: true,
        total_images_processed: steelFiles.length,
        total_count: Math.floor(Math.random() * 50) + 10,
        processing_time: Math.random() * 3 + 1,
        model_used: selectedModel,
        results: steelFiles.map((file, index) => ({
          image_id: file.image_id || file.file_id,
          filename: file.filename || `image_${index + 1}.jpg`,
          count: Math.floor(Math.random() * 15) + 2,
          annotated_image_base64: "/placeholder.svg?height=400&width=600",
        })),
      }

      localStorage.setItem("countingResults", JSON.stringify(mockResults))

      showToast({
        title: t("toast.counting.complete.demo"),
        description: t("toast.counting.demo.desc"),
        variant: "error",
      })

      setTimeout(() => router.push("/results"), 1000)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">{t("counting.title")}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("counting.subtitle")}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Classification Results & Images */}
            <div className="lg:col-span-2">
              <Card className="mb-6 border-2 border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">{t("counting.classification.results")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classificationResults.map((result, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="font-medium text-black mb-2">
                          {/* Always show English for comparison */}
                          {result.predicted_class_en || result.predicted_class_jp}
                        </div>
                        <Badge variant="outline" className="text-xs border-gray-300">
                          {result.image_id}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Badge variant="secondary" className="bg-gray-100 text-black border border-gray-300">
                      {steelFiles.length} {t("common.images")}
                    </Badge>
                    {t("counting.ready.counting")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-4">{t("counting.uploaded.ready")}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {steelFiles.map((file, index) => (
                      <div key={file.image_id || index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={file.displayUrl || file.preview || "/placeholder.svg?height=200&width=200"}
                            alt={file.filename || `${t("common.image")} ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                            {file.filename || `${t("common.image")} ${index + 1}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div>
              <Card className="border-2 border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">{t("counting.setup")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">{t("counting.selected.model")}</Label>
                    <div className="mt-1 p-3 bg-gray-100 rounded-lg border border-gray-300">
                      <div className="font-medium text-black">{getModelDisplayName(selectedModel)}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {selectedModel}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>{t("counting.images.ready")}:</span>
                        <span className="font-medium text-black">{steelFiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("counting.model")}:</span>
                        <span className="font-medium text-black">{getModelDisplayName(selectedModel)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("counting.status")}:</span>
                        <span className="font-medium text-black">{t("counting.status.ready")}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartCounting}
                    disabled={isProcessing || steelFiles.length === 0}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {t("counting.processing")}
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {t("counting.start")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => router.push("/model-selection")}
              className="px-6 border-gray-300 hover:bg-gray-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("counting.back.models")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
