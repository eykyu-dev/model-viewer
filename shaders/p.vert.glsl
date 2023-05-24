#version 300 es

in vec3 a_color;
in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_mvp_matrix;
uniform mat4 u_mv_matrix;

out vec3 v_color;
out vec3 vertex;
out vec3 N;

void main(){
    v_color = a_color;
    mat4 nm = transpose(inverse(u_mv_matrix));
    // Translate vertex's to model view space.
    vertex = vec3(u_mv_matrix*vec4(a_position, 1.0));
    // Translate normal's to model view space.
    N = normalize(vec3(nm*vec4(a_normal, 1.0)));
    gl_Position = u_mvp_matrix * vec4(a_position, 1.0);
}