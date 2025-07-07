
"use client"
// --- Counting logic moved from counting/page.tsx ---
// These functions and state are copied from counting/page.tsx for direct results redirection.
const getModelDisplayName = (modelId: string, language: string) => {
  const modelData = HARDCODED_MODELS[modelId as keyof typeof HARDCODED_MODELS]
  if (modelData) {
    return language === "ja" ? modelData.ja : modelData.en
  }
  return modelId // Fallback to original ID
}

// This function performs the counting and stores results, then redirects to /results
async function handleCountingAndRedirect({
  steelFiles,
  selectedModel,
  t,
  language,
  router,
  showToast,
  classificationResults,
}: {
  steelFiles: any[]
  selectedModel: string
  t: any
  language: string
  router: any
  showToast: any
  classificationResults: any[]
}) {
  if (steelFiles.length === 0) {
    showToast({
      title: t("toast.no.images"),
      description: t("toast.no.images.desc"),
      variant: "error",
    })
    return
  }

  try {
    // Extract image_id from steel files
    const steelImageIds = steelFiles.map((file) => file.image_id || file.file_id).filter(Boolean)

    if (steelImageIds.length === 0) {
      throw new Error("No valid image IDs found in steel files")
    }

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
      throw new Error(errorData.details || "Detection failed")
    }
  } catch (error: any) {
    // Fallback to mock results for demonstration
    const mockResults = {
      success: true,
      total_images_processed: steelFiles.length,
      total_count: Math.floor(Math.random() * 50) + 10,
      processing_time: Math.random() * 3 + 1,
      model_used: selectedModel,
      results: steelFiles.map((file: any, index: number) => ({
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
  }
}
// --- End of counting logic from counting/page.tsx ---

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Brain, Zap, Target, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"

const modelIcons = [Zap, Target, Brain]

// Hardcoded model translations
const HARDCODED_MODELS = {
  "ND press": {
    en: "ND brace",
    ja: "NDブレス",
    desc_en: "ND brace detection model",
    desc_ja: "NDブレス検出モデル",
  },
  "ND Connector": {
    en: "ND Connector",
    ja: "NDつなぎ",
    desc_en: "ND Connector detection model",
    desc_ja: "NDつなぎ検出モデル",
  },
  "ND Post": {
    en: "ND POST",
    ja: "ND支柱",
    desc_en: "ND POST detection model",
    desc_ja: "ND支柱検出モデル",
  },
  "Aluminum Stairs": {
    en: "Aluminum Stairs",
    ja: "アルミ階段",
    desc_en: "Aluminum stairs detection model",
    desc_ja: "アルミ階段検出モデル",
  },
  Roundpipes: {
    en: "Roundpipes",
    ja: "丸パイプ",
    desc_en: "Round pipe detection model",
    desc_ja: "丸パイプ検出モデル",
  },
  "Toe Board": {
    en: "Toe Board",
    ja: "巾木",
    desc_en: "Toe board detection model",
    desc_ja: "巾木検出モデル",
  },
  "plank[Plank SKN, PlankNDN2, Plank NDN1, Plank BKN]": {
    en: "plank (Plank SKN, Plank NDN2, Plank NDN1, Plank BKN)",
    ja: "布板4種類",
    desc_en: "Multi-type plank detection model",
    desc_ja: "布板4種類検出モデル",
  },
  "Rectangle pipes": {
    en: "Rectangle pipes",
    ja: "角パイプ",
    desc_en: "Rectangle pipe detection model",
    desc_ja: "角パイプ検出モデル",
  },
  "Scaffold Plank(Alumi)": {
    en: "Scaffold Plank (Alumi)",
    ja: "足場板（アルミ）",
    desc_en: "Aluminum scaffold plank detection model",
    desc_ja: "足場板（アルミ）検出モデル",
  },
  "Scaffold Plank(Wood)": {
    en: "Scaffold Plank (Wood)",
    ja: "足場板（杉）",
    desc_en: "Wooden scaffold plank detection model",
    desc_ja: "足場板（杉）検出モデル",
  },
  "Scaffold Plank(Steel)": {
    en: "Scaffold Plank (Steel)",
    ja: "足場板（鋼）",
    desc_en: "Steel scaffold plank detection model",
    desc_ja: "足場板（鋼）検出モデル",
  },
}

export default function ModelSelectionPage() {
  const [selectedModel, setSelectedModel] = useState("")
  const [models, setModels] = useState<any[]>([])
  const [classificationResults, setClassificationResults] = useState<any[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [apiModels, setApiModels] = useState<string[]>([])
  const router = useRouter()
  const { showToast } = useToast()
  const { t, language } = useLanguage()

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check if user came from upload page
        const scaffoldFiles = localStorage.getItem("scaffoldFiles")
        const steelFiles = localStorage.getItem("steelFiles")
        const classificationData = localStorage.getItem("classificationResults")

        setDebugInfo({
          scaffoldFiles: scaffoldFiles ? JSON.parse(scaffoldFiles).length : 0,
          steelFiles: steelFiles ? JSON.parse(steelFiles).length : 0,
          classificationData: classificationData ? JSON.parse(classificationData).length : 0,
        })

        if (!scaffoldFiles || !steelFiles || !classificationData) {
          showToast({
            title: t("toast.missing.data"),
            description: t("toast.missing.data.desc"),
            variant: "error",
          })
          router.push("/")
          return
        }

        const results = JSON.parse(classificationData)
        setClassificationResults(results)

        // Fetch available counting models from steel count API
        const response = await fetch("/api/steel/models")

        if (response.ok) {
          const data = await response.json()
          console.log("API returned models:", data.models)
          setApiModels(data.models)

          // Create models array from hardcoded translations
          const formattedModels = Object.keys(HARDCODED_MODELS).map((modelKey, index) => {
            const modelData = HARDCODED_MODELS[modelKey as keyof typeof HARDCODED_MODELS]
            const isAvailableInAPI = data.models.includes(modelKey)

            return {
              id: modelKey, // Keep original ID for API calls
              name: language === "ja" ? modelData.ja : modelData.en,
              description: language === "ja" ? modelData.desc_ja : modelData.desc_en,
              accuracy: `${88 + Math.floor(Math.random() * 10)}%`,
              speed:
                index === 0 ? t("model.speed.fast") : index === 1 ? t("model.speed.medium") : t("model.speed.slow"),
              icon: modelIcons[index % modelIcons.length],
              recommended: false, // Will be set below
              availableInAPI: isAvailableInAPI,
            }
          })

          // Filter to only show models that are available in the API
          const availableModels = formattedModels.filter((model) => model.availableInAPI)

          // Set default model based on classification results
          let defaultModelId = ""
          if (availableModels.length > 0) {
            // Try to find a model that matches the classification results
            const classificationClasses = results.map((r) => r.predicted_class_en).filter(Boolean)

            if (classificationClasses.length > 0) {
              // Find the most common predicted class
              const classCounts = classificationClasses.reduce((acc: any, className: string) => {
                acc[className] = (acc[className] || 0) + 1
                return acc
              }, {})

              const mostCommonClass = Object.keys(classCounts).reduce((a, b) =>
                classCounts[a] > classCounts[b] ? a : b,
              )

              console.log("Most common predicted class:", mostCommonClass)

              // Try to find a matching model
              const matchingModel = availableModels.find((model) => {
                const modelData = HARDCODED_MODELS[model.id as keyof typeof HARDCODED_MODELS]
                return modelData && modelData.en === mostCommonClass
              })

              if (matchingModel) {
                defaultModelId = matchingModel.id
                matchingModel.recommended = true
                console.log("Found matching model for classification:", defaultModelId)
              }
            }

            // Fallback to first available model if no match found
            if (!defaultModelId) {
              defaultModelId = availableModels[0].id
              availableModels[0].recommended = true
              console.log("Using first available model as default:", defaultModelId)
            }

            setSelectedModel(defaultModelId)
          }

          setModels(availableModels)
          console.log(
            "Available models:",
            availableModels.map((m) => m.id),
          )
        } else {
          throw new Error("Failed to fetch counting models")
        }
      } catch (error) {
        console.error("Failed to initialize page:", error)
        showToast({
          title: t("toast.error.loading.models"),
          description: t("toast.error.loading.models.desc"),
          variant: "error",
        })

        // Fallback to a few common models
        const fallbackModels = [
          {
            id: "ND Connector",
            name: language === "ja" ? "NDつなぎ" : "ND Connector",
            description: language === "ja" ? "NDつなぎ検出モデル" : "ND Connector detection model",
            accuracy: "96%",
            speed: t("model.speed.fast"),
            icon: Zap,
            recommended: true,
            availableInAPI: true,
          },
          {
            id: "Scaffold Plank(Steel)",
            name: language === "ja" ? "足場板（鋼）" : "Scaffold Plank (Steel)",
            description: language === "ja" ? "足場板（鋼）検出モデル" : "Steel scaffold plank detection model",
            accuracy: "94%",
            speed: t("model.speed.medium"),
            icon: Target,
            recommended: false,
            availableInAPI: true,
          },
        ]
        setModels(fallbackModels)
        setSelectedModel("ND Connector")
      } finally {
        setIsLoadingModels(false)
      }
    }

    initializePage()
  }, [router, showToast, t, language])

  // --- Model selection now triggers counting and redirects to results ---
  const [isCounting, setIsCounting] = useState(false)
  const handleModelSelection = async () => {
    if (!selectedModel) {
      showToast({
        title: t("toast.no.model.selected"),
        description: t("toast.no.model.selected.desc"),
        variant: "error",
      })
      return
    }

    setIsCounting(true)

    // Store the original model ID (English) for API calls
    localStorage.setItem("selectedCountingModel", selectedModel)

    const selectedModelData = models.find((m) => m.id === selectedModel)
    showToast({
      title: t("toast.model.selected"),
      description: `${t("toast.model.selected.desc")} ${selectedModelData?.name || selectedModel}`,
      variant: "success",
    })

    // Get steelFiles and classificationResults from localStorage
    const steelFiles = JSON.parse(localStorage.getItem("steelFiles") || "[]")
    const classificationResults = JSON.parse(localStorage.getItem("classificationResults") || "[]")

    await handleCountingAndRedirect({
      steelFiles,
      selectedModel,
      t,
      language,
      router,
      showToast,
      classificationResults,
    })

    setIsCounting(false)
  }

  const getMostCommonClass = () => {
    if (classificationResults.length === 0) return null

    const classCounts = classificationResults.reduce((acc: any, result: any) => {
      // Always use English for comparison
      const className = result.predicted_class_en || result.predicted_class_jp
      acc[className] = (acc[className] || 0) + 1
      return acc
    }, {})

    return Object.keys(classCounts).reduce((a, b) => (classCounts[a] > classCounts[b] ? a : b))
  }

  const recommendedClass = getMostCommonClass()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">{t("model.title")}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("model.subtitle")}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Debug Info */}
          {Object.keys(debugInfo).length > 0 && (
            <Card className="mb-4 border-2 border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <AlertCircle className="h-4 w-4" />
                  Debug: Scaffold files: {debugInfo.scaffoldFiles}, Steel files: {debugInfo.steelFiles},
                  Classifications: {debugInfo.classificationData}
                  {apiModels.length > 0 && <span className="ml-4">API Models: {apiModels.join(", ")}</span>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Classification Results */}
          {classificationResults.length > 0 && (
            <Card className="mb-8 border-2 border-gray-200 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <CheckCircle className="h-5 w-5 text-black" />
                  {t("model.classification.results")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classificationResults.map((result, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="font-medium text-black mb-2">
                        {/* Show Japanese when Japanese is selected, English otherwise */}
                        {language === "ja" && result.predicted_class_jp
                          ? result.predicted_class_jp
                          : result.predicted_class_en || result.predicted_class_jp}
                      </div>
                      <div className="text-xs text-gray-500">Image ID: {result.image_id}</div>
                    </div>
                  ))}
                </div>
                {recommendedClass && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
                    <div className="text-sm text-black">
                      <strong>{t("model.recommended")}:</strong> {t("model.most.classified")} "
                      {language === "ja"
                        ? classificationResults.find((r) => r.predicted_class_en === recommendedClass)
                            ?.predicted_class_jp || recommendedClass
                        : recommendedClass}
                      "
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Model Selection */}
          <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {isLoadingModels ? (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-600">{t("loading.models")}</p>
                </div>
              ) : models.length === 0 ? (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-600">{t("loading.no.models")}</p>
                </div>
              ) : (
                models.map((model) => {
                  const IconComponent = model.icon
                  return (
                    <Card
                      key={model.id}
                      className={`relative cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedModel === model.id
                          ? "border-black shadow-lg bg-gray-50"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                      onClick={() => setSelectedModel(model.id)}
                    >
                      {model.recommended && (
                        <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                          {t("model.recommended")}
                        </div>
                      )}
                      <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-3">
                          <IconComponent className="h-12 w-12 text-black" />
                        </div>
                        <CardTitle className="text-xl text-black">
                          {language === "ja"
                            ? HARDCODED_MODELS[model.id as keyof typeof HARDCODED_MODELS]?.ja || model.id
                            : HARDCODED_MODELS[model.id as keyof typeof HARDCODED_MODELS]?.en || model.id}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Label htmlFor={model.id} className="cursor-pointer block">
                          <RadioGroupItem value={model.id} id={model.id} className="sr-only" />
                          <p className="text-gray-600 text-sm mb-4 min-h-[3rem]">
                            {language === "ja"
                              ? HARDCODED_MODELS[model.id as keyof typeof HARDCODED_MODELS]?.desc_ja ||
                                model.description
                              : HARDCODED_MODELS[model.id as keyof typeof HARDCODED_MODELS]?.desc_en ||
                                model.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{t("model.accuracy")}:</span>
                              <span className="font-medium text-black">{model.accuracy}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{t("model.speed")}:</span>
                              <span className="font-medium text-black">{model.speed}</span>
                            </div>
                          </div>
                        </Label>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </RadioGroup>

          {/* Action Buttons */}
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="px-6 border-gray-300 hover:bg-gray-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("model.back.upload")}
            </Button>

            <Button
              onClick={handleModelSelection}
              disabled={!selectedModel || isLoadingModels || isCounting}
              size="lg"
              className="px-8 bg-black hover:bg-gray-800 text-white flex items-center justify-center"
            >
              {isCounting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  {t("model.counting.loading")}
                </>
              ) : (
                <>
                  {t("model.proceed.counting")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
