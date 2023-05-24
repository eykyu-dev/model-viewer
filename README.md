# Web-Based 3D Model Viewer

This is a web-based 3D model viewer that allows you to import OBJ files and render them on a 3D plane using GLSL and WebGL.

## Features

- Import OBJ files: You can upload your own OBJ files or choose from a predefined set of models.
- 3D Rendering: The viewer uses WebGL to render the models in real-time on a 3D plane.
- GLSL Shaders: Custom GLSL shaders are applied to enhance the visual appearance of the models.
- Zoom and Rotate: You can interact with the models by zooming in and out or rotating them to view from different angles.
- Lighting and Material Control: Adjust the lighting and material properties of the models to achieve desired visual effects.

## Requirements

To run the web-based 3D model viewer, you need the following:

- WebGL compatible browser (Google Chrome, Mozilla Firefox, or similar)
- A stable internet connection

## Getting Started

1. Clone the repository:

git clone https://github.com/your-username/3d-model-viewer.git

2. Open the `index.html` file in your web browser.

## Usage

1. Upon opening the web-based viewer, you will see the 3D plane with a default model loaded.

2. To import your own OBJ file, click on the "Import" button and choose the file from your local system.

3. To interact with the model, use the following controls:
- Mouse drag: Rotate the model
- Scroll wheel: Zoom in and out
- Right-click drag: Pan the view

4. Customize the rendering by adjusting the lighting and material properties using the provided controls.

5. To switch between different predefined models, use the model selection dropdown.

6. Explore the viewer and enjoy visualizing your 3D models!

## Customization

You can customize the viewer to fit your specific needs:

- Shaders: Modify the GLSL shaders in the source code to change the visual effects applied to the models.
- UI: Adjust the user interface elements or layout in the `index.html` file to match your desired design.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please open an issue or submit a pull request on the GitHub repository.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

This viewer was developed using WebGL and GLSL.
