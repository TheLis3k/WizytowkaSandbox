// Replaced by ensureFreshToken() in axiosInstance.ts + the visibilitychange
// listener in AdminLayout. The old setTimeout approach caused a race condition
// with the 401 interceptor because both fired concurrently on an expired token.
export {};
