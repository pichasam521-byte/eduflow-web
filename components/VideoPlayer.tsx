'use client'

import { useRef, useState, useEffect } from 'react'

interface VideoPlayerProps {
    src: string
    poster?: string
    controls?: boolean
}

export default function VideoPlayer({ src, poster, controls = true }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Reset state when src changes
    useEffect(() => {
        setIsLoading(true)
        setError(null)
    }, [src])

    const handleLoadedMetadata = () => {
        setIsLoading(false)
    }

    const handleError = () => {
        setIsLoading(false)
        setError('ไม่สามารถโหลดวิดีโอได้')
    }

    const handleWaiting = () => {
        setIsLoading(true)
    }

    const handlePlaying = () => {
        setIsLoading(false)
    }

    // Helper to get YouTube ID (simple regex)
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const youtubeId = getYouTubeId(src)

    if (youtubeId) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
        )
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
            {/* Loading Spinner */}
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-20">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            <video
                ref={videoRef}
                src={src}
                poster={poster}
                controls={controls}
                className="w-full h-full"
                preload="metadata" // Key for performance: Download only metadata initially
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleError}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
            >
                ขออภัย เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
            </video>

            {/* Custom Quality Selector Mockup (For Demo) */}
            {/* Note: Real quality switching requires HLS/DASH manifest (.m3u8) */}
            {/* Quality Selector (Mockup for NFR Demonstration) */}
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                    className="bg-black/60 text-white text-xs py-1 px-2 rounded border border-white/20 backdrop-blur-sm cursor-pointer hover:bg-black/80 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    defaultValue="auto"
                >
                    <option value="auto">Auto (Adaptive)</option>
                    <option value="1080p">1080p HD</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                </select>
            </div>
        </div>
    )
}
