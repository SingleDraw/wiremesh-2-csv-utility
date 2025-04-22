import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_svg import FigureCanvasSVG
import io

# Prepare the data from the user's input as a DataFrame
data = {
    "wire dia[mm] std": [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12,
        1.2, 1.5, 1.3, 1.4, 1.8, 2.5, 3.5, 4.5, 5.5, 6.5
    ],
    "opening[mm]": [
        "2.5, 3, 1.5",
        "3.5, 3.8, 4, 4.5, 5, 5.5, 6, 6.5, 7, 8, 10, 15, 16, 20, 11.9, 4.8, 24.5, 26.5",
        "6, 6.3, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 11, 12, 12.5, 15, 25, 40, 23",
        "9, 10, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 15.5, 16, 16.5, 18, 19, 20, 21, 25, 30, 40, 14.5, 27.5, 30.5",
        "13, 14, 15.5, 16, 17, 18, 19, 19.5, 20, 20.5, 21, 22, 24, 25, 27, 32, 40, 50, 14.5, 21.5",
        "17, 18, 20, 20.5, 21, 22, 24, 25, 26, 27, 28, 29, 30, 35, 40, 50, 14.5",
        "24, 26, 30, 32, 34, 35, 36, 37, 40, 63, 28.5",
        "20, 25, 32, 33, 33.5, 35, 37, 38, 40, 42, 45, 50, 55, 57, 60, 70, 80, 48, 47, 83",
        "30, 31, 33.5, 40, 45, 50, 53, 55, 57, 60, 63, 65, 67, 80, 56, 58, 47, 44",
        "33.5, 35, 40, 42, 45, 50, 53, 55, 57, 60, 63, 65, 70, 80, 100, 90, 110, 75, 49, 58, 85, 68, 103, 52, 117, 73, 116",
        "50, 55, 57, 60, 63, 65, 70, 80, 100, 90, 110, 75, 120, 150, 68, 140, 95, 132, 74, 87, 190, 165, 180, 82",
        "1.8, 2, 2.2, 2.5, 2.7, 3, 3.8, 10, 1.5, 3.3, 3.2, 3.4, 1.6, 2.3, 2.8",
        "1.8, 2, 2.5, 2.6, 3, 3.1, 3.5, 3.8, 4, 4.5, 5, 6, 8, 10, 3.3, 5.8, 3.7, 2.3, 2.8",
        "2.7, 3, 2.3",
        "3, 3.6, 1.9, 2.1",
        "3.6, 3.8, 4, 8, 10, 4.7, 5.2, 6.7",
        "5, 5.5, 6, 6.5, 7, 7.5, 8, 9, 9.5, 10, 11.5, 14.3",
        "8, 9, 9.5, 10.5, 11.5, 12.5",
        "13.5, 14, 15, 15.5, 16.5, 18, 18.5, 19, 25, 17.5, 27.5",
        "14, 18, 20, 21, 22, 24, 25, 26, 30, 32, 35, 45, 23, 23.5, 21.5",
        "28, 30, 31, 32, 33, 34.5"
    ]
}

df = pd.DataFrame(data)

# Create a figure and axis
fig, ax = plt.subplots(figsize=(14, 10))
ax.axis('off')  # Turn off the axis

# Create the table
table = ax.table(
    cellText=df.values,
    colLabels=df.columns,
    cellLoc='left',
    loc='center',
)

# Styling the table
table.auto_set_font_size(False)
table.set_fontsize(10)
table.scale(1, 1.5)  # Scale width, height

# Save to SVG
svg_buffer = io.StringIO()
canvas = FigureCanvasSVG(fig)
canvas.print_svg(svg_buffer)
svg_content = svg_buffer.getvalue()

# Show a preview of the SVG content
svg_preview = svg_content[:500]  # Just a preview to confirm it's generated
svg_preview[:500]  # Only show the first 500 characters to confirm


# Save the SVG content to a file
with open("tables/output_table.svg", "w") as f:
    f.write(svg_content)