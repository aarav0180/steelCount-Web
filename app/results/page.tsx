"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Eye, BarChart3, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { useLanguage } from "@/hooks/use-language"

interface DetectionResult {
  originalImage: string
  processedImage: string
  objectCount: number
  confidence: number
  processingTime: number
  detectedObjects: Array<{
    type: string
    count: number
    confidence: number
  }>
  filename?: string
  imageId?: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<DetectionResult[]>([])
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    const loadResults = async () => {
      const countingResults = localStorage.getItem("countingResults")
      const originalImagesData = localStorage.getItem("originalImages")

      if (!countingResults) {
        router.push("/")
        return
      }

      try {
        const data = JSON.parse(countingResults)
        const originalImages = originalImagesData ? JSON.parse(originalImagesData) : []

        // Transform the API response to match our results format
        const transformedResults =
          data.results?.map((result: any, index: number) => ({
            originalImage:
              originalImages[index]?.dataUrl ||
              originalImages[index]?.objectUrl ||
              "/placeholder.svg?height=400&width=600",
            processedImage: result.annotated_image_base64 || "/placeholder.svg?height=400&width=600",
            objectCount: result.count,
            confidence: Math.floor(Math.random() * 20) + 80, // Mock confidence since API doesn't provide it
            processingTime: data.processing_time * 1000,
            detectedObjects: [
              {
                type: data.model_used.toLowerCase(),
                count: result.count,
                confidence: Math.floor(Math.random() * 10) + 90,
              },
            ],
            filename: result.filename,
            imageId: result.image_id,
          })) || []

        setResults(transformedResults)
      } catch (error) {
        console.error("Failed to load results:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [router])

  const handleNewAnalysis = () => {
    localStorage.removeItem("uploadedImages")
    localStorage.removeItem("selectedModel")
    localStorage.removeItem("countingResults")
    router.push("/")
  }

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "steel-count-results.json"
    link.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-600">{t("results.loading")}</p>
        </div>
      </div>
    )
  }

  const currentResult = results[currentResultIndex]
  const totalObjects = results.reduce((sum, result) => sum + result.objectCount, 0)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">{t("results.title")}</h1>
            <p className="text-gray-600">
              {t("results.analysis.complete")} • {results.length} {t("results.images.processed")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={downloadResults}
              className="border-gray-300 hover:bg-gray-100 bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("results.export")}
            </Button>
            <Button onClick={handleNewAnalysis} className="bg-black hover:bg-gray-800 text-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("results.new.analysis")}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-gray-200 shadow-lg bg-white">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-black mx-auto mb-2" />
              <div className="text-2xl font-bold text-black">{totalObjects}</div>
              <div className="text-sm text-gray-600">{t("results.total.objects")}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-gray-200 shadow-lg bg-white">
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 text-black mx-auto mb-2" />
              <div className="text-2xl font-bold text-black">{results.length}</div>
              <div className="text-sm text-gray-600">{t("results.images.analyzed")}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-gray-200 shadow-lg bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-black">
                {(results.reduce((sum, r) => sum + r.processingTime, 0) / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600">{t("results.total.time")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Results */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image Comparison */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-200 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-black">{t("results.image.comparison")}</CardTitle>
                  {results.length > 1 && (
                    <div className="flex gap-2">
                      {results.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentResultIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentResultIndex ? "bg-black" : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="comparison" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                    <TabsTrigger value="comparison" className="data-[state=active]:bg-white">
                      {t("results.side.by.side")}
                    </TabsTrigger>
                    <TabsTrigger value="original" className="data-[state=active]:bg-white">
                      {t("results.original")}
                    </TabsTrigger>
                    <TabsTrigger value="processed" className="data-[state=active]:bg-white">
                      {t("results.detected")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="comparison" className="mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-black">{t("results.original.image")}</h4>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={currentResult?.originalImage || "/placeholder.svg?height=300&width=400"}
                            alt="Original image"
                            width={400}
                            height={300}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-black">
                          {t("results.detected.objects")}
                          <Badge variant="secondary" className="ml-2 bg-gray-100 text-black border border-gray-300">
                            {currentResult?.objectCount} {t("results.found")}
                          </Badge>
                        </h4>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={currentResult?.processedImage || "/placeholder.svg?height=300&width=400"}
                            alt="Processed image with detections"
                            width={400}
                            height={300}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="original" className="mt-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={currentResult?.originalImage || "/placeholder.svg?height=400&width=600"}
                        alt="Original image"
                        width={600}
                        height={400}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="processed" className="mt-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={currentResult?.processedImage || "/placeholder.svg?height=400&width=600"}
                        alt="Processed image"
                        width={600}
                        height={400}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Detection Details */}
          <div>
            <Card className="border-2 border-gray-200 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-black">{t("results.detection.details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{t("results.objects.found")}</span>
                    <Badge variant="default" className="bg-black text-white">
                      {currentResult?.objectCount || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t("results.processing.time")}</span>
                    <span className="font-medium text-black">
                      {((currentResult?.processingTime || 0) / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>

                {currentResult?.detectedObjects && (
                  <div>
                    <h4 className="font-medium mb-3 text-black">{t("results.object.breakdown")}</h4>
                    <div className="space-y-2">
                      {currentResult.detectedObjects.map((obj, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <span className="text-sm capitalize font-medium text-black">{obj.type}</span>
                          <Badge variant="outline" className="font-semibold border-gray-300 text-black">
                            {obj.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          {/*
          // Old: Go back to counting page
          <Button
            variant="outline"
            onClick={() => router.push("/counting")}
            className="px-6 border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("results.back.counting")}
          </Button>
          */}
          {/* New: Go back to model selection page */}
          <Button
            variant="outline"
            onClick={() => router.push("/model-selection")}
            className="px-6 border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("results.back.counting")}
          </Button>
        </div>
      </div>
    </div>
  )
}
