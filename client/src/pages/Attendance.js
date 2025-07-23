import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import img1 from '../assets/img4.jpeg';

const Attendance = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [sampleImages, setSampleImages] = useState([]);
  const [showSampleImages, setShowSampleImages] = useState(false);
  const videoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cctvUrl, setCctvUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [predictedCount, setPredictedCount] = useState(null);
  const [uploadedImages1, setUploadedImages1] = useState([]);
  const navigate = useNavigate();

  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedImages1((prevImages) => [...prevImages, ...files]);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => [...prevImages, ...imagePreviews]);
    setPredictedCount(null);
  };

  const user = { name: 'John Doe', role: 'Teacher' };

  const handleUploadDirectory = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length) {
      const imagePreviews = files.map((file) => URL.createObjectURL(file));
      setUploadedImages((prevImages) => [...prevImages, ...imagePreviews]);
    } else {
      alert('No files selected.');
    }
  };

  const Home = () => {
    navigate('/');
  };

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraOn(true);
    } catch (err) {
      alert('Error accessing camera: ' + err.message);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photo = canvas.toDataURL('image/png');
    setUploadedImages((prevImages) => [...prevImages, photo]);

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());

    setIsCameraOn(false);
    video.srcObject = null;
  };

  const handleDeleteImage = (index) => {
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setUploadedImages1((prevImages) => prevImages.filter((_, i) => i !== index));
    setPredictedCount(null);
  };

  const handlesubmitImage = async (index) => {
    setIsLoading(true);
    setPredictedCount(null);

    try {
      const imageBlob = uploadedImages1[index];
      if (!imageBlob) throw new Error('No image found at the specified index.');

      const formData = new FormData();
      formData.append('image', imageBlob, `image_${index + 1}.jpg`);

      const backendResponse = await axios.post(
        `${process.env.REACT_APP_HF_SPACE_URL || 'https://mosako-test-space.hf.space'}/predict`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log('Backend Response:', backendResponse.data);
      setPredictedCount(backendResponse.data.predicted_count);

    } catch (error) {
      console.error('Error submitting image:', error.response ? error.response.data : error.message);
      alert('Failed to submit the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleImages = () => {
    const exampleImages = [img1];
    setSampleImages(exampleImages);
    setShowSampleImages(true);
  };

  const toggleSampleImages = () => {
    setShowSampleImages(!showSampleImages);
  };

  const handleCCTVUrl = async () => {
    if (!cctvUrl) {
      alert('Please enter a valid CCTV URL.');
      return;
    }
    try {
      const response = await axios.get(cctvUrl, {
        responseType: 'blob',
        headers: { 'Accept': 'image/*' },
        crossdomain: true,
      });

      const contentType = response.headers['content-type'] || 'image/jpeg';
      if (!contentType.startsWith('image/')) {
        throw new Error('The URL did not return an image.');
      }

      const imagePreview = URL.createObjectURL(response.data);
      const files = [new File([response.data], 'image.jpg', { type: contentType })];

      setUploadedImages((prevImages) => [...prevImages, imagePreview]);
      setUploadedImages1((prevImages) => [...prevImages, ...files]);
      setCctvUrl('');

    } catch (error) {
      console.error('Error fetching image:', error);
      let errorMessage = 'Error fetching image: ';
      errorMessage += error.code === 'ERR_NETWORK'
        ? 'Network error. The CCTV URL may not support CORS or may be unreachable.'
        : (error.response?.statusText || error.message);
      alert(errorMessage);
    }
  };

  const handleDownload = () => {
    const content = `
    <h2>Nethra - Prediction Report</h2>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left;">Image Name</th>
          <th style="padding: 10px; text-align: left;">Timestamp</th>
          <th style="padding: 10px; text-align: left;">Original Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px;">Image.jpg</td>
          <td style="padding: 10px;">${new Date().toLocaleString()}</td>
          <td style="padding: 10px;">${predictedCount}</td>
        </tr>
      </tbody>
    </table>
  `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prediction_report.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md flex items-center">
        <div className="relative w-20 h-20 bg-gray-600 rounded-lg flex items-center justify-center">
          <div className="absolute w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <div className="absolute w-6 h-6 bg-white rounded-full animate-move-pupil"></div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md flex items-center">
        <div className="mr-4">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-gray-400">{user.role}</p>
        </div>
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">{user.name[0]}</span>
        </div>
      </div>
      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Object Detection Demonstration</h2>
          <p className="text-gray-300 mb-6">
            This tool demonstrates object detection capabilities. Upload an image, select a directory or fetch an image from a CCTV URL.
          </p>

          <div className="flex gap-4 mb-6">
            <label className="hover:text-green-400 bg-green-600 border-green-600 hover:shadow font-bold hover:shadow-green-400 text-white px-4 py-2 rounded hover:bg-transparent border hover:border-green-600 cursor-pointer">
              Upload Image
              <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
            </label>
            <label className="hover:text-blue-400 bg-blue-600 border-blue-600 hover:shadow font-bold hover:shadow-blue-400 text-white px-4 py-2 rounded hover:bg-transparent border hover:border-blue-600 cursor-pointer">
              Upload Directory
              <input type="file" accept="image/*" multiple webkitdirectory="true" onChange={handleUploadDirectory} className="hidden" />
            </label>
          </div>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded bg-gray-700 text-white"
              placeholder="Enter CCTV URL..."
              value={cctvUrl}
              onChange={(e) => setCctvUrl(e.target.value)}
            />
            <button
              className="hover:text-orange-400 bg-orange-600 border-orange-600 hover:shadow font-bold hover:shadow-orange-400 text-white px-4 py-2 rounded hover:bg-transparent border hover:border-orange-600 cursor-pointer"
              onClick={handleCCTVUrl}
            >
              Fetch Image
            </button>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="text-center">
                    <img src={image} alt={`Uploaded Preview ${index + 1}`} className="w-full rounded-lg" />
                    <div className="flex gap-4 mt-2">
                      {isLoading ? (
                        <div className="hover:text-blue-400 flex items-center justify-center mx-auto bg-blue-400 border-blue-600 hover:shadow font-bold hover:shadow-blue-400 text-white px-4 py-2 rounded hover:bg-transparent border hover:border-blue-600 cursor-pointer">
                          Submitting
                        </div>
                      ) : (
                        <>
                          <button
                            className="hover:text-red-400 bg-red-600 border-red-600 hover:shadow font-bold hover:shadow-red-400 text-white px-4 py-2 rounded hover:bg-transparent border hover:border-red-600 cursor-pointer"
                            onClick={() => handleDeleteImage(index)}
                          >
                            Delete
                          </button>
                          <button
                            className="hover:text-blue-400 bg-blue-600 border-blue-600 hover:shadow font-bold hover:shadow-blue-400 text-white px-4 py-2 rounded hover:bg-transparent border hover:border-blue-600 cursor-pointer"
                            onClick={() => handlesubmitImage(index)}
                          >
                            Submit
                          </button>
                        </>
                      )}
                    </div>
                    {predictedCount !== null && !isLoading && (
                      <div className="mt-4 text-center">
                        <p className="text-xl font-semibold text-green-500">
                          Predicted Count: {Math.round(predictedCount)}
                        </p>
                        <button
                          onClick={handleDownload}
                          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                        >
                          Download Predictions
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border border-dashed border-gray-500 rounded">
                View photos here...
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          {showSampleImages && (
            <div className="grid grid-cols-4 gap-4">
              {sampleImages.map((image, index) => (
                <img key={index} src={image} alt={`Example ${index + 1}`} className="rounded-lg" />
              ))}
            </div>
          )}
          <button
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 mt-4 text-white rounded"
            onClick={showSampleImages ? toggleSampleImages : handleLoadSampleImages}
          >
            {showSampleImages ? 'Hide Images' : 'Load Sample Inputs'}
          </button>
        </div>

        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => navigate('/doublepic')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Double Pic
          </button>
        </div>
        <div className="fixed bottom-4 left-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-4 rounded-lg"
            onClick={Home}
          >
            Go to Home Page
          </button>
        </div>
      </main>
    </div>
  );
};

export default Attendance;