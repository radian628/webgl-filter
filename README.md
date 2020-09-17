# webgl-filter
 Filter images, canvases, etc. using WebGL fragment shaders. [Try the demo here.](https://radian628.github.io/webgl-filter/demo/index.html)

## GLFilter(shader)
 Create a new filter by calling the GLFilter constructor. It accepts a string as an argument, representing a fragment shader that performs the filter operation.

 All fragment shaders created with GLFilter require a vec2 varying named "vTexCoords" (representing the texture coordinates) and a float uniform named "uAmount" (a single dummy parameter for the filter). 

### Example Shaders
Contrast filter:
```js
let contrastFilter = new GLFilter(`
    precision mediump float;

    uniform sampler2D uTexture;
    varying vec2 vTexCoords;

    uniform float uAmount;

    void main(void) {
        vec4 col = texture2D(uTexture, vTexCoords);
        gl_FragColor = vec4((col.rgb - vec3(0.5)) * uAmount + vec3(0.5), col.a);
    }
`);
```
Brightness filter:
```js
let brightnessFilter = new GLFilter(`
    precision mediump float;

    uniform sampler2D uTexture;
    varying vec2 vTexCoords;

    uniform float uAmount;

    void main(void) {
        vec4 col = texture2D(uTexture, vTexCoords);
        gl_FragColor = vec4(col.rgb * uAmount, col.a);
    }
`);
```

## GLFilter.filter(image, amount, callback, [uniforms])
 image: The image to be filtered.  
 amount: Corresponds to the uAmount uniform.  
 callback: Once the filtered image has loaded, it is passed as the first argument to this callback.  
 uniforms: An optional parameter that allows for the addition of extra uniforms. This parameter should be an array of objects, which have the following structure:
 ```js
 {
     uniformType: "2f", //Can be any uniform type (this one is a float vec2).
     uniformName: "uSampleUniformName", //The name of the uniform.
     uniformValue: [2.0, 3.0] //The value(s) to set the uniform to.
 }
 ```