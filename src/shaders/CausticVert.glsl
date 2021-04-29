@import ./PerlinNoise;
varying vec2 vUv;
uniform float timeMsec;
varying vec3 vWorldPos;
varying vec3 vViewDir;
uniform float alphaVal;
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vUv = uv;

  vWorldPos = worldPosition.xyz;
  vWorldPos.x += 20.0;
  vWorldPos.z += 20.0;

  vec4 mvPosition = viewMatrix * worldPosition;
  vViewDir = normalize(cameraPosition.xyz - worldPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
