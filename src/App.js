import React, { useEffect, useRef, useState } from 'react';
import { runObjectDetection } from './controller/ImageAnalyser';

const App = () => {

  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = isRecording ? stream : null;
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };
    initWebcam();
  }, [isRecording]);

  useEffect(() => {
    const getPredictions = async () => {
      const incomingPredictinos = await runObjectDetection(capturedImage);
      console.log("Predictions: ", incomingPredictinos);
      setPredictions(incomingPredictinos);
    }

    if (capturedImage) {
      getPredictions();
    }
  }, [capturedImage]);

  const takePicture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/jpeg');
    setCapturedImage(image);
    setIsRecording(false);
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setIsRecording(true);
  };


  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: '1', backgroundColor: 'black' }}>
        <div style={{ width: '100%', position: 'relative' }}>
          
          <div style={{ flex: '1', backgroundColor: 'black', position: 'relative' }}>
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%' }} />
            ) : (
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%' }}></video>
            )}
            <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
              {capturedImage ? (
                <button onClick={retakePicture}>Retake</button>
              ) : (
                <button onClick={takePicture}>Take Picture</button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div style={{ flex: '1', padding: '20px', backgroundColor: '#fff', overflowY: 'auto' }}>
        <div style={{ height: '100%', border: '1px solid #ccc', padding: '10px' }}>
          {predictions.map((message, index) => (
            <div key={index}>
              <p>{message.className}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

export default App;
