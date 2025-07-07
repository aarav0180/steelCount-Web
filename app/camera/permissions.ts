export async function ensureCameraPermission(language: string): Promise<boolean> {
  if (!navigator.permissions || !navigator.mediaDevices) return true // fallback: try anyway
  try {
    // Check for camera permission
    const result = await navigator.permissions.query({ name: "camera" as PermissionName })
    if (result.state === "granted") return true
    if (result.state === "prompt") {
      // Try to get permission by requesting camera
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        return true
      } catch {
        return false
      }
    }
    if (result.state === "denied") {
      alert(language === "ja"
        ? "カメラのアクセスが拒否されています。ブラウザの設定からカメラの許可をしてください。"
        : "Camera access is denied. Please allow camera access in your browser settings.")
      return false
    }
    return false
  } catch {
    // If permissions API not available, fallback to try
    return true
  }
}
