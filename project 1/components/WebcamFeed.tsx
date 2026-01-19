import React, { useRef, useEffect, useState, useCallback } from 'react';
import Spinner from './Spinner';
import { Emotion } from '../types';
import { EMOTIONS } from '../constants';
import * as localStorageService from '../services/localStorageService';
import { detectEmotion } from '../services/pythonService';

interface WebcamFeedProps {
  onEmotionDetected: (emotionResult: { emotion: Emotion | 'Undetermined', confidences: Record<Emotion, number> }) => void;
  isActive: boolean;
  setError: (error: string | null) => void;
}

const WebcamFeed: React.FC<WebcamFeedProps> = ({ onEmotionDetected, isActive, setError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const getCameraId = useCallback(() => {
    return localStorageService.get<{ selectedCameraId: string }>('settings', { selectedCameraId: '' }).selectedCameraId;
  }, []);

  const startCamera = useCallback(async () => {
    console.log('Starting camera...');
    setIsCameraLoading(true);
    setCameraError(null);
    setError(null);
    const selectedCameraId = getCameraId();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
        },
        audio: false,
      };

      console.log('Requesting user media...');
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Media stream obtained:', mediaStream);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video srcObject set');
        await videoRef.current.play();
        console.log('Video play completed');
        setVideoReady(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError('Failed to access camera. Please ensure permissions are granted and try a different camera in settings.');
      setError('Camera access error. Check settings and permissions.');
      stopCamera();
    } finally {
      setIsCameraLoading(false);
    }
  }, [getCameraId, setError]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoReady(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    onEmotionDetected({ emotion: 'Undetermined', confidences: Object.fromEntries(EMOTIONS.map(e => [e, 0])) as Record<Emotion, number> });
  }, [stream, onEmotionDetected]);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);


  const captureAndDetect = useCallback(async () => {
    console.log('Capture and detect called');
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
      console.log('Video ready, capturing...');
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log('Canvas size:', canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = imageDataUrl.split(',')[1];
        console.log('Image captured, sending to backend...');

        try {
          // Using Python backend for emotion detection
          const emotionResult = await detectEmotion(base64Data);
          console.log('Emotion result:', emotionResult);
          onEmotionDetected(emotionResult);
          setError(null);
        } catch (err: any) {
          console.error("Emotion detection error:", err);
          setError(`Emotion detection error: ${err.message || 'Unknown error'}.`);
          onEmotionDetected({ emotion: 'Undetermined', confidences: Object.fromEntries(EMOTIONS.map(e => [e, 0])) as Record<Emotion, number> });
        }
      } else {
        console.error('Canvas context not available');
      }
    } else {
      console.log('Video not ready:', videoRef.current?.readyState);
    }
  }, [onEmotionDetected, setError]);

  useEffect(() => {
    if (isActive && videoReady) {
      console.log('Starting emotion detection interval');
      // Start emotion detection at a regular interval (e.g., every 1.5 seconds)
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      detectionIntervalRef.current = window.setInterval(captureAndDetect, 500); // Real-time emotion detection every 500ms

      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }
  }, [isActive, videoReady, captureAndDetect]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4 text-blue-300">Webcam Feed</h2>
      <div className="relative w-full max-w-md h-72 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        {isCameraLoading ? (
          <Spinner />
        ) : cameraError ? (
          <p className="text-red-400 text-center p-4">{cameraError}</p>
        ) : isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedData={() => { console.log('Video loaded'); setVideoReady(true); }}
          ></video>
        ) : (
          <p className="text-gray-400">Camera is off. Click "Start Camera" to begin.</p>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        <span className="font-bold">Privacy Note:</span> Your facial data is processed locally as a snapshot for emotion detection and not stored.
        Snapshots are sent to the Python backend for analysis.
      </p>
    </div>
  );
};

export default WebcamFeed;