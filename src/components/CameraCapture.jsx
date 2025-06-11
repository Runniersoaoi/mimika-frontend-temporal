// components/CameraCapture.js
import { useRef, useState } from "react";

export default function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState("");

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const capture = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const res = await fetch("https://api-mimika.onrender.com/predict3/", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text(); // Para loggear el mensaje de error del backend
          console.error("Error en backend:", res.status, text);
          setPrediction("Error al procesar");
          return;
        }

        const data = await res.json();
        setPrediction(data.prediction);
      } catch (err) {
        console.error("Error de red:", err);
        setPrediction("Error de red");
      }
    }, "image/jpeg");
  };

  return (
    <div>
      <video ref={videoRef} autoPlay width={640} height={480} />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ display: "none" }}
      />
      <button onClick={startCamera}>Iniciar Cámara</button>
      <button onClick={capture}>Capturar y Predecir</button>
      <p>Predicción: {prediction}</p>
    </div>
  );
}
