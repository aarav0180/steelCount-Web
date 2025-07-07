"use client"

import * as React from "react"

type Language = "en" | "ja"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Home page
    "home.title": "Steel Count Project",
    "home.subtitle":
      "Upload your scaffold images and let our advanced AI classify and count steel objects with precision and speed.",
    "home.badge": "AI-Powered Steel Detection",
    "home.upload.title": "Upload Your Images",
    "home.upload.subtitle": "Select images from your device",
    "home.upload.subtitle.mobile": "Select images from your device or capture with your camera",
    "home.choose.images": "Choose Images",
    "home.use.camera": "Use Camera",
    "home.stop.camera": "Stop Camera",
    "home.camera.view": "Camera View",
    "home.camera.subtitle": "Position your device to capture scaffold images",
    "home.capture.photo": "Capture Photo",
    "home.selected.images": "Selected Images",
    "home.ready.process": "Ready to process",
    "home.start.analysis": "Start AI Analysis",
    "home.processing": "Processing...",

    // Model Selection
    "model.title": "Select Counting Model",
    "model.subtitle":
      "Based on classification results, choose the counting model that best fits your detected objects.",
    "model.classification.results": "Classification Results",
    "model.recommended": "Recommended",
    "model.most.classified": "Most images were classified as",
    "model.loading": "Loading counting models...",
    "model.back.upload": "Back to Upload",
    "model.proceed.counting": "Proceed to Counting",
    "model.accuracy": "Accuracy",
    "model.speed": "Speed",
    "model.speed.fast": "Fast",
    "model.speed.medium": "Medium",
    "model.speed.slow": "Slow",

    // Model names
    "model.nd.connector": "ND Connector",
    "model.nd.connector.desc": "Advanced ND Connector detection model for counting objects",
    "model.yolo.v8": "YOLO v8",
    "model.yolo.v8.desc": "Fast object detection model",
    "model.resnet": "ResNet",
    "model.resnet.desc": "Deep learning model for accurate detection",

    // Counting page
    "counting.title": "Object Counting",
    "counting.subtitle": "Ready to count objects in your classified images using the selected model.",
    "counting.classification.results": "Classification Results",
    "counting.ready.counting": "Ready for Counting",
    "counting.uploaded.ready": "Images have been uploaded to both APIs and are ready for counting.",
    "counting.setup": "Counting Setup",
    "counting.selected.model": "Selected Model",
    "counting.images.ready": "Images ready",
    "counting.model": "Model",
    "counting.status": "Status",
    "counting.status.ready": "Ready",
    "counting.start": "Start Counting",
    "counting.processing": "Processing...",
    "counting.back.models": "Back to Models",

    // Results page
    "results.title": "Detection Results",
    "results.analysis.complete": "Analysis complete",
    "results.images.processed": "images processed",
    "results.export": "Export Results",
    "results.new.analysis": "New Analysis",
    "results.total.objects": "Total Objects",
    "results.images.analyzed": "Images Analyzed",
    "results.total.time": "Total Time",
    "results.image.comparison": "Image Comparison",
    "results.side.by.side": "Side by Side",
    "results.original": "Original",
    "results.detected": "Detected",
    "results.original.image": "Original Image",
    "results.detected.objects": "Detected Objects",
    "results.found": "found",
    "results.detection.details": "Detection Details",
    "results.objects.found": "Objects Found",
    "results.processing.time": "Processing Time",
    "results.object.breakdown": "Object Breakdown",
    "results.back.counting": "Back to Counting",
    "results.loading": "Loading results...",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.image": "Image",
    "common.images": "images",
    "common.live.camera": "Live Camera",
    "common.photos": "photos",

    // Toast messages
    "toast.missing.data": "Missing Data",
    "toast.missing.data.desc": "Please upload and classify images first",
    "toast.error.loading.models": "Error Loading Models",
    "toast.error.loading.models.desc": "Using fallback models",
    "toast.no.model.selected": "No Model Selected",
    "toast.no.model.selected.desc": "Please select a model before proceeding",
    "toast.model.selected": "Model Selected",
    "toast.model.selected.desc": "Proceeding with",
    "toast.camera.failed": "Camera Access Failed",
    "toast.photo.captured": "Photo Captured!",
    "toast.photo.captured.desc": "Image added to your selection",
    "toast.capture.failed": "Capture Failed",
    "toast.capture.failed.desc": "Camera not ready. Please wait for the video to load.",
    "toast.upload.successful": "Upload Successful!",
    "toast.upload.successful.desc": "Images uploaded to both APIs successfully",
    "toast.partial.success": "Partial Success",
    "toast.partial.success.desc": "Some APIs returned an unexpected format. Continuing with best-effort data.",
    "toast.classification.complete": "Classification Complete!",
    "toast.classification.complete.desc": "Images uploaded to both APIs and classified successfully",
    "toast.process.failed": "Process Failed",
    "toast.process.failed.desc": "Please check your connection and try again",
    "toast.no.images": "No Images",
    "toast.no.images.desc": "No images found for steel count API",
    "toast.counting.complete": "Counting Complete!",
    "toast.counting.complete.desc": "Found {count} in {images} images",
    "toast.counting.complete.demo": "Counting Complete! (Demo Mode)",
    "toast.counting.demo.desc": "API Error: {error}. Using mock data.",

    // Loading and progress texts
    "loading.models": "Loading counting models...",
    "loading.no.models": "No models available from API",
    "progress.preparing": "Preparing images...",
    "progress.storing": "Storing original images...",
    "progress.uploading.scaffold": "Uploading to scaffold API...",
    "progress.uploading.steel": "Uploading to steel API...",
    "progress.getting.models": "Getting classification models...",
    "progress.classifying": "Classifying images...",
    "progress.saving": "Saving results...",
    "progress.redirecting": "Redirecting...",
  },
  ja: {
    // Home page
    "home.title": "鉄骨カウントプロジェクト",
    "home.subtitle": "足場画像をアップロードし、高度なAIで鉄骨オブジェクトを精密かつ高速に分類・カウントします。",
    "home.badge": "AIカウントシステム",
    "home.upload.title": "画像をアップロード",
    "home.upload.subtitle": "デバイスから画像を選択してください",
    "home.upload.subtitle.mobile": "デバイスから画像を選択するか、カメラで撮影してください",
    "home.choose.images": "画像を選択",
    "home.use.camera": "カメラを使用",
    "home.stop.camera": "カメラを停止",
    "home.camera.view": "カメラビュー",
    "home.camera.subtitle": "足場画像を撮影するためにデバイスを配置してください",
    "home.capture.photo": "写真を撮影",
    "home.selected.images": "選択された画像",
    "home.ready.process": "処理準備完了",
    "home.start.analysis": "AI分析を開始",
    "home.processing": "処理中...",

    // Model Selection
    "model.title": "カウントモデルを選択",
    "model.subtitle": "分類結果に基づいて、検出されたオブジェクトに最適なカウントモデルを選択してください。",
    "model.classification.results": "分類結果",
    "model.recommended": "推奨",
    "model.most.classified": "ほとんどの画像が次のように分類されました",
    "model.loading": "カウントモデルを読み込み中...",
    "model.back.upload": "アップロードに戻る",
    "model.proceed.counting": "カウントに進む",
    "model.accuracy": "精度",
    "model.speed": "速度",
    "model.speed.fast": "高速",
    "model.speed.medium": "中速",
    "model.speed.slow": "低速",

    // Model names
    "model.nd.connector": "NDコネクタ",
    "model.nd.connector.desc": "オブジェクトカウント用の高度なNDコネクタ検出モデル",
    "model.yolo.v8": "YOLO v8",
    "model.yolo.v8.desc": "高速オブジェクト検出モデル",
    "model.resnet": "ResNet",
    "model.resnet.desc": "正確な検出のための深層学習モデル",

    // Counting page
    "counting.title": "オブジェクトカウント",
    "counting.subtitle": "選択されたモデルを使用して、分類された画像内のオブジェクトをカウントする準備ができました。",
    "counting.classification.results": "分類結果",
    "counting.ready.counting": "カウント準備完了",
    "counting.uploaded.ready": "画像は両方のAPIにアップロードされ、カウントの準備ができています。",
    "counting.setup": "カウント設定",
    "counting.selected.model": "選択されたモデル",
    "counting.images.ready": "準備完了画像数",
    "counting.model": "モデル",
    "counting.status": "ステータス",
    "counting.status.ready": "準備完了",
    "counting.start": "カウント開始",
    "counting.processing": "処理中...",
    "counting.back.models": "モデル選択に戻る",

    // Results page
    "results.title": "検出結果",
    "results.analysis.complete": "分析完了",
    "results.images.processed": "枚の画像が処理されました",
    "results.export": "結果をエクスポート",
    "results.new.analysis": "新しい分析",
    "results.total.objects": "総オブジェクト数",
    "results.images.analyzed": "分析された画像数",
    "results.total.time": "総処理時間",
    "results.image.comparison": "画像比較",
    "results.side.by.side": "並べて表示",
    "results.original": "元画像",
    "results.detected": "検出済み",
    "results.original.image": "元画像",
    "results.detected.objects": "検出されたオブジェクト",
    "results.found": "個発見",
    "results.detection.details": "検出詳細",
    "results.objects.found": "発見されたオブジェクト数",
    "results.processing.time": "処理時間",
    "results.object.breakdown": "オブジェクト内訳",
    "results.back.counting": "カウントページに戻る",
    "results.loading": "結果を読み込み中...",

    // Common
    "common.loading": "読み込み中...",
    "common.error": "エラー",
    "common.success": "成功",
    "common.image": "画像",
    "common.images": "枚の画像",
    "common.live.camera": "ライブカメラ",
    "common.photos": "枚の写真",

    // Toast messages
    "toast.missing.data": "データが見つかりません",
    "toast.missing.data.desc": "最初に画像をアップロードして分類してください",
    "toast.error.loading.models": "モデル読み込みエラー",
    "toast.error.loading.models.desc": "フォールバックモデルを使用します",
    "toast.no.model.selected": "モデルが選択されていません",
    "toast.no.model.selected.desc": "続行する前にモデルを選択してください",
    "toast.model.selected": "モデルが選択されました",
    "toast.model.selected.desc": "で続行します",
    "toast.camera.failed": "カメラアクセス失敗",
    "toast.photo.captured": "写真が撮影されました！",
    "toast.photo.captured.desc": "画像が選択に追加されました",
    "toast.capture.failed": "撮影失敗",
    "toast.capture.failed.desc": "カメラの準備ができていません。ビデオの読み込みをお待ちください。",
    "toast.upload.successful": "アップロード成功！",
    "toast.upload.successful.desc": "両方のAPIに画像が正常にアップロードされました",
    "toast.partial.success": "部分的成功",
    "toast.partial.success.desc": "一部のAPIが予期しない形式を返しました。ベストエフォートデータで続行します。",
    "toast.classification.complete": "分類完了！",
    "toast.classification.complete.desc": "両方のAPIに画像がアップロードされ、分類が正常に完了しました",
    "toast.process.failed": "処理失敗",
    "toast.process.failed.desc": "接続を確認して再試行してください",
    "toast.no.images": "画像がありません",
    "toast.no.images.desc": "鉄骨カウントAPI用の画像が見つかりません",
    "toast.counting.complete": "カウント完了！",
    "toast.counting.complete.desc": "{images}枚の画像で{count}個を発見しました",
    "toast.counting.complete.demo": "カウント完了！（デモモード）",
    "toast.counting.demo.desc": "APIエラー: {error}。モックデータを使用します。",

    // Loading and progress texts
    "loading.models": "カウントモデルを読み込み中...",
    "loading.no.models": "APIから利用可能なモデルがありません",
    "progress.preparing": "画像を準備中...",
    "progress.storing": "元画像を保存中...",
    "progress.uploading.scaffold": "足場APIにアップロード中...",
    "progress.uploading.steel": "鉄骨APIにアップロード中...",
    "progress.getting.models": "分類モデルを取得中...",
    "progress.classifying": "画像を分類中...",
    "progress.saving": "結果を保存中...",
    "progress.redirecting": "リダイレクト中...",
  },
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>("ja")

  // Load saved language on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ja")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language when it changes
  const handleSetLanguage = React.useCallback((lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("preferred-language", lang)
  }, [])

  const t = React.useCallback(
    (key: string): string => {
      return translations[language][key as keyof (typeof translations)[typeof language]] || key
    },
    [language],
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
