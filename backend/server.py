from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image
import os
import io
from model import predict_count

app = Flask(__name__)
CORS(app)

def stitch_images(img1, img2):
    height = max(img1.height, img2.height)
    width1 = int(img1.width * (height / img1.height))
    width2 = int(img2.width * (height / img2.height))

    img1_resized = img1.resize((width1, height))
    img2_resized = img2.resize((width2, height))

    new_image = Image.new('RGB', (width1 + width2, height))
    new_image.paste(img1_resized, (0, 0))
    new_image.paste(img2_resized, (width1, 0))

    return new_image

@app.route('/stitch', methods=['POST'])
def handle_stitch():
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({"error": "Both images must be provided"}), 400

    image1 = Image.open(request.files['image1']).convert("RGB")
    image2 = Image.open(request.files['image2']).convert("RGB")

    stitched_img = stitch_images(image1, image2)
    img_io = io.BytesIO()
    stitched_img.save(img_io, format='JPEG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/jpeg')

@app.route('/predict', methods=['POST'])
def handle_predict():
    if 'stitched_image' not in request.files:
        return jsonify({"error": "Stitched image is missing"}), 400

    image = Image.open(request.files['stitched_image']).convert("RGB")
    total, duplicates, originals = predict_count(image)
    return jsonify({"total": int(total), "duplicates": int(duplicates), "originals": int(originals)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
