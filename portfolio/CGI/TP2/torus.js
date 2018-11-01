var torus_points = [];
var torus_normals = [];
var torus_faces = [];
var torus_edges = [];

var torus_points_buffer;
var torus_normals_buffer;
var torus_faces_buffer;
var torus_edges_buffer;

var torus_LATS=30;
var torus_LONS=20;

function torusInit(gl) {
    torusBuild(torus_LATS, torus_LONS);
    torusUploadData(gl);
}

// Generate points using polar coordinates
function torusBuild(nlat, nlon) 
{
    // phi will be latitude
    // theta will be longitude
 
    var d_phi = 2 * Math.PI / nlat;
    var d_theta = 2 * Math.PI / nlon;
    var radius = 0.4;
    var tube = 0.2;
    
    // Generate middle
    for(var i=0, phi=Math.PI/2-d_phi; i<nlat; i++, phi-=d_phi) {
        for(var j=0, theta=0; j<nlon; j++, theta+=d_theta) {
            var x = (radius + tube * Math.cos(phi)) * Math.cos(theta);
            var y = (radius + tube * Math.cos(phi)) * Math.sin(theta);
            var z = tube*Math.sin(phi);
            var pt = vec3(x,y,z);
            torus_points.push(pt);
            var n = vec3(Math.cos(theta)*Math.cos(phi), Math.sin(theta)*Math.cos(phi), Math.sin(phi));
            torus_normals.push(normalize(n));
        }
    }

    
    // general middle faces
    var offset=0;
    
    for(var i=0; i<nlat-1; i++) {
        for(var j=0; j<nlon-1; j++) {
            var p = offset+i*nlon+j;
            torus_faces.push(p);
            torus_faces.push(p+nlon);
            torus_faces.push(p+nlon+1);
            
            torus_faces.push(p);
            torus_faces.push(p+nlon+1);
            torus_faces.push(p+1);
        }
        var p = offset+i*nlon+nlon-1;
        torus_faces.push(p);
        torus_faces.push(p+nlon);
        torus_faces.push(p+1);

        torus_faces.push(p);
        torus_faces.push(p+1);
        torus_faces.push(p-nlon+1);
    }
    

    /* south pole faces */
    var offset = (nlat-1) * nlon;
    for(var j=0; j<nlon; j++) {
        if(j != nlon-1){
            
            torus_faces.push(offset+j);
            torus_faces.push(j+1);
            torus_faces.push(j);
            torus_faces.push(j+1);
            torus_faces.push(offset+j);
            torus_faces.push(offset+j+1);
        } else {
            torus_faces.push(offset+j);
            torus_faces.push(j);
            torus_faces.push(0);
            
            torus_faces.push(offset+j);
            torus_faces.push(offset);
            torus_faces.push(0);
        }
    }
 
    for(var i=0; i<nlat; i++, p++) {
        for(var j=0; j<nlon;j++, p++) {
            var p = i*nlon + j;
            torus_edges.push(p);   // horizontal line (same latitude)
            if(j!=nlon-1) 
                torus_edges.push(p+1);
            else torus_edges.push(p+1-nlon);
            
            if(i!=nlat-1) {
                torus_edges.push(p);   // vertical line (same longitude)
                torus_edges.push(p+nlon);
            } else {
                torus_edges.push(p);
                torus_edges.push(p-i*nlon);
            }
        }
    }
    
}

function torusUploadData(gl)
{
    torus_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(torus_points), gl.STATIC_DRAW);
    
    torus_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(torus_normals), gl.STATIC_DRAW);
    
    torus_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torus_faces), gl.STATIC_DRAW);
    
    torus_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torus_edges), gl.STATIC_DRAW);
}

function torusDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_edges_buffer);
    gl.drawElements(gl.LINES, torus_edges.length, gl.UNSIGNED_SHORT, 0);
}

function torusDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_faces_buffer);
    gl.drawElements(gl.TRIANGLES, torus_faces.length, gl.UNSIGNED_SHORT, 0);
}
