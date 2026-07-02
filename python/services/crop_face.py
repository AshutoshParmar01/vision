import sys
import cv2

image_path = sys.argv[1]
output_path = sys.argv[2]

x1 = int(float(sys.argv[3]))
y1 = int(float(sys.argv[4]))
x2 = int(float(sys.argv[5]))
y2 = int(float(sys.argv[6]))

image = cv2.imread(image_path)

height, width = image.shape[:2]

# Add padding around face
padding = 40

x1 -= padding
y1 -= padding
x2 += padding
y2 += padding

# Keep crop inside image
x1 = max(0, x1)
y1 = max(0, y1)
x2 = min(width, x2)
y2 = min(height, y2)

crop = image[y1:y2, x1:x2]

# Skip invalid crop
if crop.size == 0:
    raise Exception("Invalid crop")

# Standard avatar size
crop = cv2.resize(crop, (256, 256))

cv2.imwrite(output_path, crop)

print(output_path)
