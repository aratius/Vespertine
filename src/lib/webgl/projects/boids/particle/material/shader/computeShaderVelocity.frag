uniform float u_size;
#define NUM_SIDE 60.

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec2 nextUv = vec2(0.);
	if(gl_FragCoord.x == NUM_SIDE) {
		if(gl_FragCoord.y == NUM_SIDE) {
			nextUv = fract(vec2(0., 0.) / NUM_SIDE)*NUM_SIDE / resolution.xy;
		} else {
			nextUv = fract(vec2(0., gl_FragCoord.y + 1.) / NUM_SIDE)*NUM_SIDE / resolution.xy;
		}
	} else {
		nextUv = fract((gl_FragCoord.xy + vec2(1., 0.)) / 60.)*60. / resolution.xy;
	}
	float idParticle = uv.y * resolution.x + uv.x;
	vec4 tmpVel = texture2D( textureVelocity, uv );
	vec3 vel = tmpVel.xyz;
	// 現在位置
	vec4 tmpPos = texture2D( texturePosition, uv );
	vec3 pos = tmpPos.xyz;
	vec3 nextPos = texture2D( texturePosition, nextUv ).xyz;

	// vel += normalize((nextPos - pos) + vec3(1e-4)) * .1;
	// vel += ((nextPos - pos) + vec3(1e-4)) * .01;

	// vel += normalize(-pos + vec3(1e-4)) * .1;  // どっか行っちゃわないように中心向けの力

	vel.xyz *= 0.99;

	if(gl_FragCoord.x == 0. && gl_FragCoord.y == 0.) vel = vec3(0.);

	gl_FragColor = vec4( vel.xyz, 1.0 );
}