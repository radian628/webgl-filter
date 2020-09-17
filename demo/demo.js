let shaderSelector = document.getElementById('shader-selector');
let reference = document.getElementById("reference");
let canvas = document.getElementById("canvas");
let filterIntensity = document.getElementById("filter-intensity");
let filterShader = document.getElementById("filter-shader");

let ctx = canvas.getContext("2d");
let filter;

let filters = {
    brightness: `
precision mediump float;

uniform sampler2D uTexture;
varying vec2 vTexCoords;

uniform float uAmount;

void main(void) {
    vec4 col = texture2D(uTexture, vTexCoords);
    gl_FragColor = vec4(col.rgb * uAmount, col.a);
}
    `,
    contrast: `
precision mediump float;

uniform sampler2D uTexture;
varying vec2 vTexCoords;

uniform float uAmount;

void main(void) {
    vec4 col = texture2D(uTexture, vTexCoords);
    gl_FragColor = vec4((col.rgb - vec3(0.5)) * uAmount + vec3(0.5), col.a);
}
    `,
    invert: `
precision mediump float;

uniform sampler2D uTexture;
varying vec2 vTexCoords;

uniform float uAmount;

void main(void) {
    vec4 col = texture2D(uTexture, vTexCoords);
    gl_FragColor = vec4(vec3(1.0) - col.rgb, col.a);
}
    `
};

function init() {
    Object.keys(filters).forEach(key => {
        let option = document.createElement("option");
        option.innerHTML = key;
        shaderSelector.appendChild(option);
    });
}

function applyFilterAndDraw() {
    filter.filter(reference, Number(filterIntensity.value), function (image) {
        ctx.drawImage(image, 0, 0);
    });
}

function resetFilter() {
    canvas.width = reference.naturalWidth;
    canvas.height = reference.naturalHeight;
    filter = new GLFilter(filterShader.value);
    applyFilterAndDraw();
}

shaderSelector.addEventListener("change", function (e) {
    filterShader.value = filters[shaderSelector.value];
    resetFilter();
});

filterShader.addEventListener("change", function (e) {
    resetFilter();
});

filterIntensity.addEventListener("change", function (e) {
    applyFilterAndDraw();
    document.getElementById("filter-intensity-value").innerText = filterIntensity.value;
});

init();
filterShader.innerHTML = filters[shaderSelector.value];

resetFilter();
reference.onload = resetFilter;