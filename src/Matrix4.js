export class Matrix4 {
    constructor() {

        this.elements = new Float32Array(16);
    }

    static create(vector16) {
        let matrix = new Matrix4();

        for (let i = 0; i < 16; i++) {
            matrix.elements[i] = vector16[i];
        }

        return matrix;
    }

    static identity() {
        let matrix = new Matrix4();
        matrix.elements[0] = 1;
        matrix.elements[5] = 1;
        matrix.elements[10] = 1;
        matrix.elements[15] = 1;
        return matrix;
    }

    static scale(x, y, z) {
        let matrix = new Matrix4();
        matrix.elements[0] = x;
        matrix.elements[5] = y;
        matrix.elements[10] = z;
        matrix.elements[15] = 1;
        return matrix;
    }

    static translate(x, y, z) {
        let matrix = this.identity();
        matrix.elements[12] = x;
        matrix.elements[13] = y;
        matrix.elements[14] = z;
        return matrix;
    }

    static rotateX(degrees) {
        let matrix = this.identity();
        let radians = degrees * (Math.PI / 180);
        matrix.elements[5] = Math.cos(radians);
        matrix.elements[6] = Math.sin(radians);
        matrix.elements[9] = -Math.sin(radians);
        matrix.elements[10] = Math.cos(radians);
        return matrix;
    }

    static rotateY(degrees) {
        let matrix = this.identity();
        let radians = degrees * (Math.PI / 180);
        matrix.elements[0] = Math.cos(radians);
        matrix.elements[2] = Math.sin(radians);
        matrix.elements[8] = -Math.sin(radians);
        matrix.elements[10] = Math.cos(radians);
        return matrix;
    }

    static rotateZ(degrees) {
        let matrix = this.identity();
        let radians = degrees * (Math.PI / 180);
        matrix.elements[0] = Math.cos(radians);
        matrix.elements[1] = Math.sin(radians);
        matrix.elements[4] = -Math.sin(radians);
        matrix.elements[5] = Math.cos(radians);
        return matrix;
    }

    static ortho(left, right, bottom, top, near, far) {
        let matrix = new Matrix4();
        matrix.elements[0] = 2 / (right - left);
        matrix.elements[5] = 2 / (top - bottom);
        matrix.elements[10] = 2 / (near - far);
        matrix.elements[12] = -(right + left) / (right - left);
        matrix.elements[13] = -(top + bottom) / (top - bottom);
        matrix.elements[14] = (near + far) / (near - far);
        matrix.elements[15] = 1;
        return matrix;
    }

    multiplyVector4(vector4) {
        let output = new Float32Array(4);
        for (let i = 0; i < 4; i++) {
            let sum = 0;
            for (let j = 0; j < 4; j++) {
                sum += this.elements[i * 4 + j] * vector4[j];
            }
            output[i] = sum;
        }

        return output;
    }

    multiplyMatrix4(matrix) {
        let output = new Matrix4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let a = 0; a < 4; a++) {
                    sum += this.elements[i + a * 4] * matrix.elements[j * 4 + a];
                }
                output.elements[i + j * 4] = sum;
            }
        }

        return output;
    }

    multiplyMatrix42(that) {
        let matrix = new Matrix4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                matrix.elements[i * 4 + j] = this.elements[j] * that.elements[i * 4] +
                    this.elements[4 + j] * that.elements[1 + i * 4] +
                    this.elements[8 + j] * that.elements[2 + i * 4] +
                    this.elements[12 + j] * that.elements[3 + i * 4];
            }
        }
        return matrix;
    }


    toBuffer() {
        return this.elements;
    }
}