import requests

# Your ImgBB API key (replace with your actual key)
api_key = '533876acdd70b4de97aa581b77d84684'

# The path to your image file (replace with the correct file path)
image_path = './temp/stitched.jpg'

# Open the image file in binary mode
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
        image_url = response_data['data']['url']
        print("Image URL:", image_url)
    else:
        print(f"Error: {response.status_code}, {response.text}")
