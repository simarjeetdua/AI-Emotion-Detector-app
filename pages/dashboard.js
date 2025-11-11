import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Router from 'next/router';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [expressions, setExpressions] = useState(null);
  const [history, setHistory] = useState([]); // emotion history
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Auth check
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) Router.push('/');
      });
  }, []);

  // ✅ Load models
  useEffect(() => {
    async function loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        console.log('✅ FaceAPI models loaded');
        setModelsLoaded(true);
      } catch (err) {
        console.error('Model loading error:', err);
      }
    }
    loadModels();
  }, []);

  // ✅ Start camera & detect
  useEffect(() => {
    if (!modelsLoaded) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setLoading(false);

        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        async function detect() {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          if (detection) {
            const resized = faceapi.resizeResults(detection, displaySize);
            faceapi.draw.drawDetections(canvasRef.current, resized);

            const expr = detection.expressions;
            setExpressions(expr);

            // 🧠 Capture history (newest first)
            const dominant = Object.entries(expr).sort((a, b) => b[1] - a[1])[0];
            const newEntry = {
              time: new Date().toLocaleTimeString(),
              emotion: dominant[0],
              confidence: (dominant[1] * 100).toFixed(1) + '%',
            };

            setHistory((prev) => {
              if (prev.length === 0 || prev[0].emotion !== newEntry.emotion) {
                // 🆕 Add new entries at the TOP (no scroll)
                return [newEntry, ...prev];
              }
              return prev;
            });
          }

          requestAnimationFrame(detect);
        }

        detect();
      } catch (err) {
        console.error('Camera error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Camera Error',
          text: 'Please allow camera access and refresh the page.',
        });
      }
    }

    startCamera();
  }, [modelsLoaded]);

  // ✅ Logout
  async function logout() {
    document.cookie = 'token=; Max-Age=0; path=/';
    await Swal.fire({ title: 'Logged out!', icon: 'info', confirmButtonText: 'OK' });
    Router.push('/');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f4f4f4' }}>
      {/* 🧠 Left Sidebar - Dynamic History */}
      <div
        style={{
          width: '260px',
          background: '#111827',
          color: '#fff',
          padding: '20px',
          overflow: 'hidden', // ❌ no scroll
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2
          style={{
            borderBottom: '1px solid #374151',
            paddingBottom: '10px',
            marginBottom: '10px',
          }}
        >
          Emotion History
        </h2>

        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '8px',
            overflow: 'hidden',
          }}
        >
          {history.length === 0 && (
            <p style={{ color: '#9CA3AF' }}>No history yet</p>
          )}
          {history.slice(0, 6).map((h, i) => (
            <div
              key={i}
              style={{
                background: '#1F2937',
                padding: '8px',
                borderRadius: '8px',
              }}
            >
              <strong>{h.emotion.toUpperCase()}</strong>
              <br />
              <small>{h.time}</small>
              <br />
              <small>Conf: {h.confidence}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>🎭 Real-Time Emotion Detection</h2>
          <button
            onClick={logout}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>

        <p style={{ marginTop: '10px' }}>
          {modelsLoaded ? '✅ Models loaded' : '⏳ Loading AI models...'}
        </p>
        {loading && <p>🎥 Starting camera... please allow access</p>}

        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            marginTop: '20px',
          }}
        >
          <video
            ref={videoRef}
            width="480"
            height="360"
            muted
            playsInline
            style={{
              borderRadius: '10px',
              border: '2px solid #ddd',
            }}
          />
          <canvas
            ref={canvasRef}
            width="480"
            height="360"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </div>

        {/* Detected Emotions */}
        <div
          style={{
            marginTop: '20px',
            textAlign: 'left',
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            width: '480px',
            marginInline: 'auto',
          }}
        >
          <h3>Detected Emotions</h3>
          {!expressions && <p>No face detected yet 👀</p>}
          {expressions &&
            Object.entries(expressions)
              .sort((a, b) => b[1] - a[1])
              .map(([emotion, prob]) => (
                <div
                  key={emotion}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    fontSize: '16px',
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{emotion}</span>
                  <span>{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
