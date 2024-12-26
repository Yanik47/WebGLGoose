# WebGooseL

### About the Project

This project was created as part of a university assignment, which required manually creating an image of a bird using triangles in WebGL. The coordinates of the triangle vertices had to be entered manually, which was a time-consuming and inefficient process. The task also required the use of all major WebGL components.

I decided to automate this process and practice using the OpenCV library. I wrote a script that detects polygons in an image, splits them into triangles, and generates vertex coordinates in a format compatible with WebGL. For visualization, I also created a simple JavaScript server that allows viewing the processed image in a browser.

The code solves the given task but has some limitations. I chose not to fix these within the project because university assignments waive my copyright to the solutions. Nevertheless, I use the skills and ideas gained here in my own projects, where I implement improved versions of this program.

---

## How It Works

### 1. **Image Processing**

- **Reading the Image**: The image is loaded using `cv2.imread`.
    
- **Preprocessing**:
    
    - Conversion to grayscale: `cv2.cvtColor`.
        
    - Smoothing to remove noise: `cv2.bilateralFilter`.
        
    - Edge detection: `cv2.Canny`.
        
    - Dilation and erosion to enhance contours: `cv2.dilate`, `cv2.erode`.
        

### 2. **Contour Analysis**

- Contours are extracted using `cv2.findContours`.
    
- Contours are sorted by area using `sorted`.
    
- Contour processing:
    
    - Contours with 3 vertices are treated as triangles.
        
    - Contours with 4 vertices are split into two triangles using the `split_quadrilateral_into_triangles` function.
        

### 3. **Function** `**split_quadrilateral_into_triangles**`

- Splits a quadrilateral into two triangles along diagonal AC.
    

### 4. **Adding Predefined Triangles**

- A list of predefined triangles is added to the processed triangles.
    

### 5. **Generating Output Data**

- **White pixels** are saved in `contours.json`.
    
- **Triangles** are saved in `triangles.json`.
    
- **Lines** (if found) are saved in `lines.json`.
    

### 6. **Displaying Results**

- The binary image, processed contours, and triangles are visualized using `cv2.imshow`.
    

---

## Key Features

- Supports saving data in JSON format for integration with WebGL.
    
- Converts coordinates to the range [-1, 1], compatible with WebGL.
    
- Visualizes processing results: contours, triangles, and lines highlighted in different colors.
    

---

## Issues

- Contour filtering is not ideal, especially for quadrilaterals.
    
- The program struggles with low-quality images (low contrast, noise).
    
- Processing arbitrary polygons is not optimized.
    

---

## Potential Improvements

### Contour Processing

- Use adaptive thresholding (`cv2.adaptiveThreshold`) for better edge detection.
    
- Add algorithms for processing arbitrary polygons, such as Delaunay triangulation.
    

### Noise Reduction

- Apply geodesic morphology to reduce the impact of noise.
    
- Use **geodesic distance transforms** for more accurate contour detection.
    

### Performance

- Optimize the program using GPU acceleration (OpenCV with CUDA support).
    
- Add support for parallel image processing.
    

### Feature Expansion

- Detect and analyze other geometric shapes (circles, ellipses).
    
- Add a graphical user interface (e.g., PyQt or Tkinter) for interactive parameter tuning.
    
- Include export to other formats, such as CSV or XML.
    

---

## Technologies Used

- **OpenCV**: For image processing and contour analysis.
    
- **JavaScript**: A simple server for result visualization.
    
- **JSON**: Data format for storing triangle and other object coordinates.
    

---

## How to Run

1. Install dependencies:
    
    ```
    pip install opencv-python numpy
    ```
    
2. Run the script to process an image:
    
    ```
    python process_image.py
    ```
    
3. Start the visualization server:
    
    ```
    node server.js
    ```
    
4. Open your browser and navigate to `http://localhost:3000`.
    

---

## Conclusion

This project served as excellent practice in the field of computer vision and working with OpenCV. Despite its limitations, it demonstrates how tedious tasks can be automated, transforming complex processes into simple and efficient tools.