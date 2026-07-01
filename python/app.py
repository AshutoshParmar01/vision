import cv2
from insightface.app import FaceAnalysis

print("Loading model...")

face_app = FaceAnalysis()

print("Preparing model...")

face_app.prepare(
    ctx_id=-1,          # CPU for now
    det_size=(640, 640)
)

print("Reading image...")

image = cv2.imread("test.png")

if image is None:
    raise FileNotFoundError("Could not find test.png")

print("Detecting faces...")

faces = face_app.get(image)

print(f"\nFaces detected: {len(faces)}")

for i, face in enumerate(faces):
    print(f"\n========== Face {i + 1} ==========")
    print("Bounding Box:", face.bbox)
    print("Embedding Shape:", face.embedding.shape)
    print(face.embedding)
