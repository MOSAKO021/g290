import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [stitchedImage, setStitchedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleUpload = (e, setImage) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleStitch = async () => {
    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);

    try {
      const response = await axios.post('http://127.0.0.1:5000/stitch', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response.data);

      // Store the stitched image URL from the response
      setStitchedImage(response.data.image_url);
    } catch (error) {
      console.error('Error stitching images:', error);
    }
  };

  const handlePredict = async () => {
    try {
      // Send the stitched image URL to the predict route
      const predictionResponse = await axios.post('http://127.0.0.1:5000/predict', {
        url: stitchedImage,
      });

      // Set the prediction state
      setPrediction(predictionResponse.data);
    } catch (error) {
      console.error('Error predicting count:', error);
    }
  };

  const handleClear = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="text-2xl font-bold text-center mb-8">Merge and Count</header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col items-center">
          <label className="mb-2 font-bold">Upload Image 1</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e, setImage1)}
            className="border p-2"
          />
        </div>
        <div className="flex flex-col items-center">
          <label className="mb-2 font-bold">Upload Image 2</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e, setImage2)}
            className="border p-2"
          />
        </div>
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={handleStitch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Stitch Images
        </button>
      </div>

      <div className="bg-white shadow rounded p-4 mb-8">
        {stitchedImage && (
          <>
            <h2 className="text-xl font-bold mb-4">Stitched Image</h2>
            <img src={stitchedImage} alt="Stitched" className="mx-auto" />
            <div className="mt-4 text-center">
              <button
                onClick={handleClear}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Clear
              </button>
            </div>
          </>
        )}
      </div>

      <div className="text-center space-x-4 mt-10">
        <button
          onClick={handlePredict}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Predict
        </button>
      </div>

      {prediction && (
        <div className="mt-8 bg-gray-100 p-4 rounded shadow text-center">
          <h2 className="text-xl font-bold">Prediction</h2>
          <p>Total Count: {prediction.total}</p>
          <p>Duplicate Count: {prediction.duplicates}</p>
          <p>Original Count: {prediction.originals}</p>
        </div>
      )}
    </div>
  );
}

export default App;
