"use client"

import type React from "react"
import type { ReactElement } from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, ImageIcon, ArrowRight, X, Camera, StopCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"

export default function HomePage(): ReactElement {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  // Add image from camera if present in localStorage
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
    const cameraImage = localStorage.getItem("cameraImage")
    if (cameraImage) {
      fetch(cameraImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })
          setSelectedImages(prev => [...prev, file])
          localStorage.removeItem("cameraImage")
        })
    }
  }, [])
  const router = useRouter()
  const { showToast } = useToast()
  const { t, language } = useLanguage()

  // Enhanced mobile detection
  const checkMobile = useCallback(() => {
    if (typeof window === "undefined") return false

    const userAgent = navigator.userAgent.toLowerCase()
    const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/.test(userAgent)
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
    const isSmallScreen = window.innerWidth <= 768

    const mobileCheck = isMobileUserAgent || (isTouchDevice && isSmallScreen)
    setIsMobile(mobileCheck)
    return mobileCheck
  }, [])

  useEffect(() => {
    checkMobile()
    const handleResize = () => checkMobile()
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [checkMobile])

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages((prev) => [...prev, ...files])
  }

  const removeImage = (idx: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== idx))
    if (currentImageIndex >= selectedImages.length - 1) {
      setCurrentImageIndex(Math.max(0, selectedImages.length - 2))
    }
  }

  // Camera logic removed, now handled in /camera page

  // Accept different response shapes from the upload APIs
  function extractFilesFromResponse(res: any, apiType: "scaffold" | "steel"): any[] {
    if (!res || typeof res !== "object") return []

    if (apiType === "steel") {
      return res.images || []
    } else {
      return res.uploaded_files || res.files || res.uploadedImages || res.uploaded_images || res.images || []
    }
  }

  const handleProceed = async () => {
    if (!selectedImages.length) return
    // Camera logic removed

    setIsWorking(true)
    setUploadProgress(t("progress.preparing"))

    try {
      setUploadProgress(t("progress.storing"))
      const imageDataUrls = await Promise.all(
        selectedImages.map(async (file, index) => {
          return new Promise<{ file: File; dataUrl: string; objectUrl: string }>((resolve) => {
            const reader = new FileReader()
            const objectUrl = URL.createObjectURL(file)
            reader.onload = (e) =>
              resolve({
                file,
                dataUrl: e.target?.result as string,
                objectUrl,
              })
            reader.readAsDataURL(file)
          })
        }),
      )

      const originalImagesData = imageDataUrls.map((item, index) => ({
        id: `original_${index}`,
        name: item.file.name,
        size: item.file.size,
        type: item.file.type,
        dataUrl: item.dataUrl,
        objectUrl: item.objectUrl,
      }))

      localStorage.setItem("originalImages", JSON.stringify(originalImagesData))

      setUploadProgress(t("progress.uploading.scaffold"))
      const scaffoldFormData = new FormData()
      selectedImages.forEach((img) => scaffoldFormData.append("files", img))

      const scaffoldUploadRes = await fetch("/api/scaffold/upload", {
        method: "POST",
        body: scaffoldFormData,
      })

      if (!scaffoldUploadRes.ok) {
        const errorData = await scaffoldUploadRes.json()
        throw new Error(`Scaffold upload failed: ${errorData.details || scaffoldUploadRes.statusText}`)
      }

      const scaffoldUploadData = await scaffoldUploadRes.json()

      setUploadProgress(t("progress.uploading.steel"))
      const steelFormData = new FormData()
      selectedImages.forEach((img) => steelFormData.append("files", img))

      const steelUploadRes = await fetch("/api/steel/upload", {
        method: "POST",
        body: steelFormData,
      })

      if (!steelUploadRes.ok) {
        const errorData = await steelUploadRes.json()
        throw new Error(`Steel upload failed: ${errorData.details || steelUploadRes.statusText}`)
      }

      const steelUploadData = await steelUploadRes.json()

      showToast({
        title: t("toast.upload.successful"),
        description: t("toast.upload.successful.desc"),
        variant: "success",
      })

      setUploadProgress(t("progress.getting.models"))
      const modelsRes = await fetch("/api/scaffold/models")

      if (!modelsRes.ok) {
        const errorData = await modelsRes.json()
        throw new Error(`Failed to fetch models: ${errorData.details || modelsRes.statusText}`)
      }

      const modelsData = await modelsRes.json()
      const defaultModel = modelsData.models?.[0] || "initial_model.keras"

      setUploadProgress(t("progress.classifying"))
      const scaffoldFiles = extractFilesFromResponse(scaffoldUploadData, "scaffold")
      const scaffoldImageIds = scaffoldFiles.map((f: any) => f.file_id).join(",")

      const classifyRes = await fetch("/api/scaffold/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_ids: scaffoldImageIds,
          model_name: defaultModel,
        }),
      })

      if (!classifyRes.ok) {
        const errorData = await classifyRes.json()
        throw new Error(`Classification failed: ${errorData.details || classifyRes.statusText}`)
      }

      const classifyData = await classifyRes.json()

      setUploadProgress(t("progress.saving"))
      const scaffoldFilesArr = extractFilesFromResponse(scaffoldUploadData, "scaffold")
      const steelFilesArr = extractFilesFromResponse(steelUploadData, "steel")
      const classifyArr = Array.isArray(classifyData?.results) ? classifyData.results : []

      const enhancedSteelFiles = steelFilesArr.map((steelFile, index) => ({
        ...steelFile,
        originalImage: originalImagesData[index] || null,
        displayUrl: steelFile.preview || originalImagesData[index]?.dataUrl || "/placeholder.svg",
      }))

      if (scaffoldFilesArr.length === 0 || enhancedSteelFiles.length === 0 || classifyArr.length === 0) {
        showToast({
          title: t("toast.partial.success"),
          description: t("toast.partial.success.desc"),
          variant: "error",
        })
      }

      localStorage.setItem("scaffoldFiles", JSON.stringify(scaffoldFilesArr))
      localStorage.setItem("steelFiles", JSON.stringify(enhancedSteelFiles))
      localStorage.setItem("classificationResults", JSON.stringify(classifyArr))

      showToast({
        title: t("toast.classification.complete"),
        description: t("toast.classification.complete.desc"),
        variant: "success",
      })

      setUploadProgress(t("progress.redirecting"))
      setTimeout(() => {
        router.push("/model-selection")
      }, 2000)
    } catch (error: any) {
      console.error("Process failed:", error)
      setUploadProgress("")
      showToast({
        title: t("toast.process.failed"),
        description: error.message || t("toast.process.failed.desc"),
        variant: "error",
      })
    } finally {
      setIsWorking(false)
    }
  }

  useEffect(() => {
  // Camera cleanup effect removed
  }, [])

  return (

    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              {t("home.badge")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">{t("home.title")}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{t("home.subtitle")}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            {isClient && (
              <Card className="mb-8 border-2 border-gray-200 shadow-lg bg-white">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Upload className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-3">{t("home.upload.title")}</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      {isMobile ? t("home.upload.subtitle.mobile") : t("home.upload.subtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <div>
                        <input
                          id="img-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFilePick}
                          className="hidden"
                        />
                        <label htmlFor="img-upload">
                          <Button
                            asChild
                            className="cursor-pointer bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={isWorking}
                            size="lg"
                          >
                            <span>
                              <ImageIcon className="mr-3 h-5 w-5" />
                              {t("home.choose.images")}
                            </span>
                          </Button>
                        </label>
                      </div>

                      {isMobile && (
                        <Button
                          onClick={() => router.push("/camera")}
                          disabled={isWorking}
                          variant="outline"
                          size="lg"
                          className="px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-gray-300"
                        >
                          <Camera className="mr-3 h-5 w-5" />
                          {t("home.use.camera")}
                        </Button>
                      )}
                    </div>

                    {/* Camera error and permission UI removed, now handled in /camera page */}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Camera View removed, now handled in /camera page */}

            {/* Selected Images */}
            {isClient && selectedImages.length > 0 && (
              <Card className="mb-8 border-2 border-gray-200 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-black">
                      {t("home.selected.images")} ({selectedImages.length})
                    </h3>
                    <div className="bg-gray-100 text-black px-3 py-1 rounded-full text-sm font-medium">
                      {t("home.ready.process")}
                    </div>
                  </div>

                  <div className="relative mb-6">
                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                    <Image
                      src={URL.createObjectURL(selectedImages[currentImageIndex]) || "/placeholder.svg"}
                      alt="preview"
                      width={800}
                      height={450}
                      className="w-full h-full object-contain"
                    />
                  </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-3 right-3 shadow-lg"
                      onClick={() => removeImage(currentImageIndex)}
                      disabled={isWorking}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {selectedImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          disabled={isWorking}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-3 transition-all duration-200 ${
                            i === currentImageIndex
                              ? "border-black shadow-lg scale-105"
                              : "border-gray-200 hover:border-gray-400 hover:shadow-md"
                          } ${isWorking ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <Image
                            src={URL.createObjectURL(img) || "/placeholder.svg"}
                            alt="thumb"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Process Button */}
            {selectedImages.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={handleProceed}
                  disabled={isWorking}
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white px-12 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  {isWorking ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      {uploadProgress || t("home.processing")}
                    </div>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-5 w-5" />
                      {t("home.start.analysis")}
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </>
                  )}
                </Button>
                {isWorking && uploadProgress && (
                  <p className="text-gray-600 mt-4 text-lg font-medium">{uploadProgress}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
