# import sys
# import json
# import cv2


# def scan_image(image_path):
#     try:
#         # 1. Load image
#         img = cv2.imread(image_path)

#         if img is None:
#             print(json.dumps({
#                 "error": "Could not read image"
#             }))
#             return

#         # 2. Create OpenCV barcode detector
#         detector = cv2.barcode.BarcodeDetector()

#         # 3. Detect and decode barcodes
#         ok, decoded_info, decoded_type, points = detector.detectAndDecodeMulti(img)

#         shelf_code = None
#         product_barcode = None
#         all_detected = []

#         if ok:
#             for data, barcode_type in zip(decoded_info, decoded_type):
#                 if not data:
#                     continue

#                 all_detected.append({
#                     "data": data,
#                     "type": barcode_type
#                 })

#                 # Sort barcode by your warehouse rules
#                 if data.startswith("LOC-"):
#                     shelf_code = data
#                 else:
#                     product_barcode = data

#         # 4. Return JSON for Node.js
#         result = {
#             "detectedShelfCode": shelf_code,
#             "detectedBarcode": product_barcode,
#             "allDetected": all_detected
#         }

#         print(json.dumps(result))

#     except Exception as e:
#         print(json.dumps({
#             "error": str(e)
#         }))


# if __name__ == "__main__":

#     # Node.js must provide an image path
#     if len(sys.argv) < 2:
#         print(json.dumps({
#             "error": "No image path provided"
#         }))
#         sys.exit(1)

#     image_path = sys.argv[1]

#     scan_image(image_path)


import json
import cv2
import os

# Find barcode.png in the same folder as this Python file
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_PATH = os.path.join(SCRIPT_DIR, "barcode.png")


def scan_image(image_path):
    try:
        img = cv2.imread(image_path)

        if img is None:
            print(json.dumps({
                "error": f"Could not read image: {image_path}"
            }))
            return

        detector = cv2.barcode.BarcodeDetector()

        ok, decoded_info, decoded_type, points = detector.detectAndDecodeMulti(img)

        shelf_code = None
        product_barcode = None
        all_detected = []

        if ok:
            for data, barcode_type in zip(decoded_info, decoded_type):
                if not data:
                    continue

                all_detected.append({
                    "data": data,
                    "type": barcode_type
                })

                if data.startswith("LOC-"):
                    shelf_code = data
                else:
                    product_barcode = data

        result = {
            "detectedShelfCode": shelf_code,
            "detectedBarcode": product_barcode,
            "allDetected": all_detected
        }

        print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }, indent=2))


scan_image(IMAGE_PATH)