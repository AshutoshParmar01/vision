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

x1 = max(0, min(x1, width))
x2 = max(0, min(x2, width))
y1 = max(0, min(y1, height))
y2 = max(0, min(y2, height))

crop = image[y1:y2, x1:x2]

cv2.imwrite(output_path, crop)

print(output_path)
