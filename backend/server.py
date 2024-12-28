import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import requests
from model import predict_count

# Initialize Flask app
app = Flask(__name__)

# CORS setup to allow only frontend
CORS(app, origins=["http://localhost:5173"])

# Your ImgBB API key (replace with your actual key)
api_key = ''

# Function to stitch two images horizontally with 1:1 height ratio
def stitch_images(img1, img2):
    # Resize images to have the same height while maintaining aspect ratio
    height = max(img1.height, img2.height)  # Choose the larger height for both images
    
    # Resize img1
    width1 = int(img1.width * (height / img1.height))
    img1_resized = img1.resize((width1, height))
    
    # Resize img2
    width2 = int(img2.width * (height / img2.height))
    img2_resized = img2.resize((width2, height))
    
    # Create a new image with width as the sum of both widths, and height as the fixed height
    new_width = width1 + width2
    new_image = Image.new('RGB', (new_width, height))
    
    # Paste the resized images onto the new image
    new_image.paste(img1_resized, (0, 0))  # Paste img1 at the left
    new_image.paste(img2_resized, (width1, 0))  # Paste img2 at the right
    
    return new_image

# Function to upload the image to ImgBB and return the image URL
def upload_to_imgbb(image_path):
    with open(image_path, 'rb') as image_file:
        # Define the endpoint and the payload
        url = 'https://api.imgbb.com/1/upload'
        payload = {
            'key': api_key
        }
        files = {
            'image': image_file
        }

        # Send the POST request to ImgBB API
        response = requests.post(url, data=payload, files=files)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the JSON response and extract the image URL
            response_data = response.json()
            return response_data['data']['url']
        else:
            return None
        

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "server working"}), 200


@app.route('/stitch', methods=['POST', 'OPTIONS'])
def handle_stitch():
    # For preflight (OPTIONS) requests
    if request.method == 'OPTIONS':
        return '', 200

    # Check if both image files are provided
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({"error": "Both images must be provided"}), 400
    
    image1 = request.files['image1']
    image2 = request.files['image2']

    try:
        # Open images
        img1 = Image.open(image1).convert("RGB")
        img2 = Image.open(image2).convert("RGB")

        # Stitch images horizontally with the adjusted function
        stitched_img = stitch_images(img1, img2)

        # Save the stitched image to a temporary file
        temp_path = os.path.join('temp', 'stitched.jpg')
        os.makedirs('temp', exist_ok=True)
        stitched_img.save(temp_path)

        # Upload the stitched image to ImgBB
        image_url = upload_to_imgbb(temp_path)

        # If the upload was successful, return the image URL
        if image_url:
            return jsonify({
                "message": "Stitching and upload successful",
                "image_url": image_url
            }), 200
        else:
            return jsonify({"error": "Failed to upload image to ImgBB"}), 500

    except Exception as e:
        return jsonify({"error": f"Stitching failed: {str(e)}"}), 500

@app.route('/predict', methods=['POST', 'OPTIONS'])
def handle_predict():
    if request.method == 'OPTIONS':
        return '', 200
    
    # Check if the 'url' key is in the request body
    if 'url' not in request.json:
        return jsonify({"error": "No URL provided"}), 400
    
    url = request.json['url']
    
    # Validate the URL (basic check)
    if not url:
        return jsonify({"error": "Provided URL is invalid"}), 400

    # Perform prediction
    try:
        result = predict_count(url)
        total, duplicates, originals = result
        return jsonify({"total": int(total), "duplicates": int(duplicates), "originals": int(originals)}), 200
        
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# Main entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
