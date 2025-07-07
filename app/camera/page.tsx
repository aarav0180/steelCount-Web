"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { ensureCameraPermission } from "./permissions"
import { useRouter } from "next/navigation"
import { Camera, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import React from "react"

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [permissionState, setPermissionState] = useState<"granted"|"prompt"|"denied"|"unknown">("unknown")
  const { showToast } = useToast()
  const { t, language } = useLanguage()
  const router = useRouter()


  // Always just ask for camera access when user clicks the button
  const handleStartCamera = async () => {
    setCameraError("")
    setIsCameraLoading(true)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          language === "ja" ? "このデバイスではカメラがサポートされていません" : "Camera not supported on this device"
        )
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      if (!videoRef.current) throw new Error("Video element not available")
      videoRef.current.srcObject = stream
      setIsCameraActive(true)
      setCameraError("")
    } catch (error: any) {
      setCameraError(error.message)
      showToast({
        title: language === "ja" ? "カメラアクセス失敗" : "Camera Access Failed",
        description: error.message,
        variant: "error",
      })
      setIsCameraActive(false)
    } finally {
      setIsCameraLoading(false)
    }
  }

  const startCamera = useCallback(async () => {
    setCameraError("")
    setIsCameraLoading(true)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          language === "ja" ? "このデバイスではカメラがサポートされていません" : "Camera not supported on this device"
        )
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      if (!videoRef.current) throw new Error("Video element not available")
      videoRef.current.srcObject = stream
      setIsCameraActive(true)
      setCameraError("")
    } catch (error: any) {
      setCameraError(error.message)
      showToast({
        title: language === "ja" ? "カメラアクセス失敗" : "Camera Access Failed",
        description: error.message,
        variant: "error",
      })
      setIsCameraActive(false)
    } finally {
      setIsCameraLoading(false)
    }
  }, [language, showToast])

  // Remove auto permission check logic

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setIsCameraLoading(false)
    setCameraError("")
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })
            // Save to localStorage as base64 for simplicity
            const reader = new FileReader()
            reader.onload = (e) => {
              localStorage.setItem("cameraImage", e.target?.result as string)
              stopCamera()
              router.push("/")
            }
            reader.readAsDataURL(file)
          }
        }, "image/jpeg", 0.9)
      }
    } else {
      showToast({
        title: t("toast.capture.failed"),
        description: t("toast.capture.failed.desc"),
        variant: "error",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-4">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold mb-2">{language === "ja" ? "カメラ" : "Camera"}</h2>
          <p className="text-gray-600">{language === "ja" ? "写真を撮影してください" : "Take a photo"}</p>
        </div>
        <div className="relative mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video bg-black rounded-xl shadow-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        {!isCameraActive && (
          <div className="mb-4 text-center">
            <Button
              onClick={handleStartCamera}
              disabled={isCameraLoading}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl"
            >
              {language === "ja" ? "カメラを有効にする" : "Enable Camera"}
            </Button>
          </div>
        )}
        {permissionState === "denied" && (
          <div className="text-red-600 mb-2 text-center">
            {language === "ja"
              ? "カメラのアクセスが拒否されています。ブラウザの設定からカメラの許可をしてください。"
              : "Camera access is denied. Please allow camera access in your browser settings."}
          </div>
        )}
        {cameraError && <div className="text-red-600 mb-2 text-center">{cameraError}</div>}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={capturePhoto}
            disabled={!isCameraActive || isCameraLoading}
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl"
          >
            <Camera className="mr-3 h-5 w-5" />
            {language === "ja" ? "写真を撮影" : "Capture Photo"}
          </Button>
          <Button
            onClick={() => {
              stopCamera()
              router.push("/")
            }}
            variant="outline"
            className="px-8 py-3 text-lg font-medium"
          >
            <StopCircle className="mr-3 h-5 w-5" />
            {language === "ja" ? "キャンセル" : "Cancel"}
          </Button>
        </div>
      </div>
    </div>
  )
}
