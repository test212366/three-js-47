uniform float time;
uniform float progress;
uniform sampler2D landscape;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;
varying vec3 vBary;

 

float PI = 3.1415926;

vec2 hash22(vec2 p) {
	p = fract(p * vec2(5.3983, 5.4427));
	p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
	return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
}


void main() {
	float width = 2.;
	vec3 d = fwidth(vBary);
	vec3 s = smoothstep(d * (width + 0.5), d * (width - 0.5), vBary);
	float line = max(s.x, max(s.y, s.z));
	if(line < 0.1) discard;
	gl_FragColor = vec4(mix(vec3(1.), vec3(0.), 1. - line), 1.);
	// gl_FragColor = vec4(diffuse,diffuse,diffuse, 1.);
	// gl_FragColor = vec4(eyeVector, 1.);

}