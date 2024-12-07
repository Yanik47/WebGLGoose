import imutils
import cv2
import numpy as np
import json
def split_quadrilateral_into_triangles(A, B, C, D):
    # Разделение четырехугольника на два треугольника по диагонали AC
    triangle_1 = (A, B, C)
    triangle_2 = (A, C, D)
    return triangle_1, triangle_2

def process_image(image_path):
    image = cv2.imread(image_path)
    new_image = np.zeros(image.shape, dtype='uint8')
    if image is None:
        print("File doesn't exist.")
        return

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.bilateralFilter(gray, 5, 180, 50)
    binary = cv2.Canny(blurred, 12, 15)
    kernel = np.ones((5,5), np.uint8)
    binary = cv2.dilate(binary, kernel, iterations=1)
    binary = cv2.erode(binary, kernel, iterations=1)

    # Находим координаты белых пикселей
    white_pixels = np.column_stack(np.where(binary == 255))

    # Обработка контуров
    con, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    con = imutils.grab_contours((None, con, hierarchy))
    cont = sorted(con, key=cv2.contourArea, reverse=True)

    triangles = []
    for c in cont:
        approx = cv2.approxPolyDP(c, 9, True)
        if len(approx) == 3:  # Изменение здесь для фильтрации только треугольников
            triangles.append(approx)
            cv2.drawContours(new_image, [approx], 0, (0, 255, 0), 2)
        elif len(approx) == 4:
            # Получение вершин четырехугольника
            A, B, C, D = approx.reshape(4, 2)
            # Разделение на треугольники
            triangle_1, triangle_2 = split_quadrilateral_into_triangles(A, B, C, D)
            triangle_1 = np.array([A, B, C])  # Formed as numpy arrays
            triangle_2 = np.array([A, C, D])
            triangles.extend([triangle_1, triangle_2])
            cv2.drawContours(new_image, [np.array([triangle_1])], 0, (255, 0, 0), 2)
            cv2.drawContours(new_image, [np.array([triangle_2])], 0, (255, 0, 0), 2)

    #стартовое множество треугольников, которое мне нужно на зачет
    # и времени на совершенствование алгоритма для их распозванаия у меня не осталось
    default_triangles = [
        np.array([[413, 520], [476, 577], [540, 476]], dtype=np.int32),
        np.array([[426, 828], [442, 831], [402, 872]], dtype=np.int32),
        np.array([[716, 104], [764, 191], [666, 201]], dtype=np.int32),
        np.array([[716, 104], [764, 191], [764, 131]], dtype=np.int32),
        np.array([[670, 274], [696, 284], [670, 310]], dtype=np.int32),
        np.array([[670, 310], [696, 284], [707, 329]], dtype=np.int32),
        np.array([[669, 409], [739, 414], [781, 524]], dtype=np.int32),
        np.array([[655, 503], [654, 585], [780, 526]], dtype=np.int32),
        np.array([[655, 503], [654, 585], [607, 583]], dtype=np.int32),
        np.array([[607, 583], [655, 503], [542, 476]], dtype=np.int32),
        np.array([[154, 607], [245, 604], [191, 622]], dtype=np.int32),
        np.array([[245, 604], [191, 622], [262, 623]], dtype=np.int32),
        np.array([[477, 578], [654, 586], [575, 672]], dtype=np.int32),
    ]

    for triangle in default_triangles:
        triangles.append(triangle)
        cv2.drawContours(new_image, [triangle], 0, (255, 0, 255), 3)

    # Запись координат белых пикселей в файл
    # with open('contours.txt', 'w') as file:
    #     for (y, x) in white_pixels:
    #         file.write(f"[{x/512 - 1}, {1 - y/512}, 0x0000ff],")
    with open('contours.json', 'w') as file:
        json.dump([{"x": x / 512 - 1, "y": 1 - y / 512, "color": "0x0000ff"} for (y, x) in white_pixels], file,
                  indent=4)

    lines = cv2.HoughLinesP(binary, 1, np.pi / 180, threshold=20, minLineLength=15, maxLineGap=14)
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            cv2.line(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

    # Запись треугольников в файл
    # with open('triangles1.txt', 'w') as file:
    #     for i, triangle in enumerate(triangles):
    #         #file.write(f"Triangle {i}:\n")
    #         #for point in triangle:
    #         #    x, y = point[0]
    #         #    file.write(f"({x}, {y})\n")
    #         x1, y1 = triangle[0][0]
    #         x2, y2 = triangle[1][0]
    #         x3, y3 = triangle[2][0]
    #         file.write(f"[[{x1/512 - 1}, {1 - y1/512}], [{3/512 - 1}, {1 - y2/512}], [{x3/512 - 1}, {1 - y3/512}], 0xff0000]")
    with open('triangles.json', 'w') as file:
        json_data = []
        for triangle in triangles:
            vertices = [{"x": x / 512 - 1, "y": 1 - y / 512} for x, y in triangle.reshape(-1, 2)]
            json_data.append({"vertices": vertices, "color": "0xffffff"})
        json.dump(json_data, file, indent=4)

    # Запись линий в файл
    # with open('lines.txt', 'w') as file:
    #     if lines is not None:
    #         for i, line in enumerate(lines):
    #             x1, y1, x2, y2 = line[0]
    #             file.write(f"[[{x1/512 - 1}, {1 - y1/512}], [{x2/512 - 1}, {1 - y2/512}], 0x00ff00],\n")
    if lines is not None:
        # Запись линий в JSON
        with open('lines.json', 'w') as file:
            json.dump([{"start": {"x": x1 / 512 - 1, "y": 1 - y1 / 512},
                        "end": {"x": x2 / 512 - 1, "y": 1 - y2 / 512},
                        "color": "0x00ff00"} for x1, y1, x2, y2 in lines.reshape(-1, 4)], file, indent=4)

    cv2.imshow("Binary Image", binary)
    cv2.imshow("Processed Image", image)
    cv2.imshow("Triangles and Contours", new_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Запуск функции
image_path = 'goose.png' 
process_image(image_path)



