#version 300 es
precision mediump float;


in vec3 a_position;
in vec3 a_color;
in vec3 a_normal;


uniform mat4 global_matrix;
uniform mat4 u_mv_matrix;
uniform mat4 u_mvp_matrix;


struct Material
{
    vec3 ka;
    vec3 ks;
    vec3 kd;
    float ns;
};

struct Light
{
    int type;
    vec3 ambient;
    vec3 id;
    vec3 is;
    vec3 position;
    float k;
};

uniform Material u_mat;
//supports 3 lights
uniform Light u_light[3];
out vec3 v_color;

void main() {
    // Generating Normal Matrix
    mat4 nm = transpose(inverse(u_mv_matrix));
    // Translate vertex's to model view space.
    vec3 vertex = vec3(u_mv_matrix*vec4(a_position, 1.0));
    // Translate normal's to model view space.
    vec3 N = normalize(vec3(nm*vec4(a_normal, 1.0)));
    //multiply color * the illumination model
    vec3 model = vec3(0,0,0);
    //Ambient   
    model = vec3(u_light[0].ambient[0] * u_mat.ka[0], u_light[0].ambient[1] * u_mat.ka[1], u_light[0].ambient[2] * u_mat.ka[2]);
    //illumination model
    for(int i = 0; i < 3; i++)
    {
        if(u_light[i].type == 1)
        {
            vec3 diffuseandspec = vec3(0,0,0);
            //Need to make light in global space. 
            vec3 light_pos = vec3(global_matrix * vec4(u_light[i].position, 1.0));
            vec3 l = normalize(light_pos - vertex);
            vec3 v = normalize(-vertex);
            vec3 r = normalize(-reflect(l, N));
            vec3 diffuse = vec3(u_mat.kd[0] * u_light[i].id[0] * max(0.0, dot(N, l)), u_mat.kd[1] * u_light[i].id[1] * max(0.0, dot(N, l)), u_mat.kd[2] * u_light[i].id[2] * max(0.0, dot(N, l)));
            vec3 specular = vec3(u_mat.ks[0] * u_light[i].is[0] * pow(max(0.0, dot(v, r)), u_mat.ns), u_mat.ks[1] * u_light[i].is[1] * pow(max(0.0, dot(v, r)), u_mat.ns), u_mat.ks[2] * u_light[i].is[2] * pow(max(0.0, dot(v, r)), u_mat.ns));
            float inverseSquare = min(1.0, 1.0/(u_light[i].k * pow(length(light_pos - vertex), 2.0)));
            diffuseandspec = inverseSquare*(diffuse+specular);
            model = model+diffuseandspec;
        }

        if(u_light[i].type == 0)
        {
            vec3 diffuseandspec = vec3(0,0,0);
            //Need to make light in global space. 
            vec3 l = normalize(-u_light[i].position);
            vec3 v = normalize(-vertex);
            vec3 r = normalize(-reflect(l, N));
            vec3 diffuse = vec3(u_mat.kd[0] * u_light[i].id[0] * max(0.0, dot(N, l)), u_mat.kd[1] * u_light[i].id[1] * max(0.0, dot(N, l)), u_mat.kd[2] * u_light[i].id[2] * max(0.0, dot(N, l)));
            vec3 specular = vec3(u_mat.ks[0] * u_light[i].is[0] * pow(max(0.0, dot(v, r)), u_mat.ns), u_mat.ks[1] * u_light[i].is[1] * pow(max(0.0, dot(v, r)), u_mat.ns), u_mat.ks[2] * u_light[i].is[2] * pow(max(0.0, dot(v, r)), u_mat.ns));
            diffuseandspec = (diffuse+specular);
            model = model+diffuseandspec;
        }
    }
    // Multiply color by the illumination model
    v_color = vec3(a_color[0] * model[0], a_color[1] * model[1], a_color[2] * model[2]);
    // Multiply the position by the matrix.
    gl_Position = u_mvp_matrix * vec4(a_position, 1.0);
}
