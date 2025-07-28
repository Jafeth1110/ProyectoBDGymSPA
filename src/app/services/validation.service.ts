import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  // Validaciones para Usuario
  validateNombre(nombre: string): { valid: boolean; message?: string } {
    if (!nombre || nombre.trim() === '') {
      return { valid: false, message: 'El nombre es requerido' };
    }
    
    // Solo letras y espacios
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(nombre)) {
      return { valid: false, message: 'El nombre solo puede contener letras y espacios' };
    }
    
    return { valid: true };
  }

  validateApellido(apellido: string): { valid: boolean; message?: string } {
    if (!apellido || apellido.trim() === '') {
      return { valid: false, message: 'El apellido es requerido' };
    }
    
    // Solo letras y espacios
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(apellido)) {
      return { valid: false, message: 'El apellido solo puede contener letras y espacios' };
    }
    
    return { valid: true };
  }

  validateCedula(cedula: string): { valid: boolean; message?: string } {
    if (!cedula || cedula.trim() === '') {
      return { valid: false, message: 'La cédula es requerida' };
    }
    
    // Solo números, 8-12 dígitos
    const cedulaRegex = /^\d{8,12}$/;
    if (!cedulaRegex.test(cedula)) {
      return { valid: false, message: 'La cédula debe tener entre 8 y 12 dígitos' };
    }
    
    return { valid: true };
  }

  validateEmail(email: string): { valid: boolean; message?: string } {
    if (!email || email.trim() === '') {
      return { valid: false, message: 'El email es requerido' };
    }
    
    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'El formato del email no es válido' };
    }
    
    return { valid: true };
  }

  validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.trim() === '') {
      return { valid: false, message: 'La contraseña es requerida' };
    }
    
    // Alfanumérico, mínimo 6 caracteres
    const passwordRegex = /^[a-zA-Z0-9]{6,}$/;
    if (!passwordRegex.test(password)) {
      return { valid: false, message: 'La contraseña debe ser alfanumérica con mínimo 6 caracteres' };
    }
    
    return { valid: true };
  }

  validateIdRol(idRol: number): { valid: boolean; message?: string } {
    if (!idRol || ![1, 2, 3].includes(idRol)) {
      return { valid: false, message: 'El rol debe ser 1 (admin), 2 (cliente) o 3 (entrenador)' };
    }
    
    return { valid: true };
  }

  // Validaciones para Teléfonos
  validateTelefono(telefono: string): { valid: boolean; message?: string } {
    if (!telefono || telefono.trim() === '') {
      return { valid: false, message: 'El teléfono es requerido' };
    }
    
    // Solo números, 8-12 dígitos
    const telefonoRegex = /^\d{8,12}$/;
    if (!telefonoRegex.test(telefono)) {
      return { valid: false, message: 'El teléfono debe tener entre 8 y 12 dígitos numéricos' };
    }
    
    return { valid: true };
  }

  validateTipoTelefono(tipoTel: string): { valid: boolean; message?: string } {
    const tiposValidos = ['celular', 'casa', 'trabajo'];
    
    if (!tipoTel || !tiposValidos.includes(tipoTel)) {
      return { valid: false, message: 'El tipo de teléfono debe ser: celular, casa o trabajo' };
    }
    
    return { valid: true };
  }

  // Validación completa de usuario
  validateUser(userData: {
    nombre?: string;
    apellido?: string;
    cedula?: string;
    email?: string;
    password?: string;
    idRol?: number;
    telefonos?: Array<{ telefono: string; tipoTel: string }>;
  }): { valid: boolean; errors: string[] } {
    
    const errors: string[] = [];

    // Validaciones requeridas
    if (userData.nombre !== undefined) {
      const nombreResult = this.validateNombre(userData.nombre);
      if (!nombreResult.valid && nombreResult.message) {
        errors.push(nombreResult.message);
      }
    }

    if (userData.apellido !== undefined) {
      const apellidoResult = this.validateApellido(userData.apellido);
      if (!apellidoResult.valid && apellidoResult.message) {
        errors.push(apellidoResult.message);
      }
    }

    if (userData.cedula !== undefined) {
      const cedulaResult = this.validateCedula(userData.cedula);
      if (!cedulaResult.valid && cedulaResult.message) {
        errors.push(cedulaResult.message);
      }
    }

    if (userData.email !== undefined) {
      const emailResult = this.validateEmail(userData.email);
      if (!emailResult.valid && emailResult.message) {
        errors.push(emailResult.message);
      }
    }

    if (userData.password !== undefined) {
      const passwordResult = this.validatePassword(userData.password);
      if (!passwordResult.valid && passwordResult.message) {
        errors.push(passwordResult.message);
      }
    }

    if (userData.idRol !== undefined) {
      const rolResult = this.validateIdRol(userData.idRol);
      if (!rolResult.valid && rolResult.message) {
        errors.push(rolResult.message);
      }
    }

    // Validar teléfonos si se proporcionan
    if (userData.telefonos && Array.isArray(userData.telefonos)) {
      userData.telefonos.forEach((telefono, index) => {
        const telefonoResult = this.validateTelefono(telefono.telefono);
        if (!telefonoResult.valid && telefonoResult.message) {
          errors.push(`Teléfono ${index + 1}: ${telefonoResult.message}`);
        }

        const tipoResult = this.validateTipoTelefono(telefono.tipoTel);
        if (!tipoResult.valid && tipoResult.message) {
          errors.push(`Teléfono ${index + 1}: ${tipoResult.message}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Método helper para limpiar datos de entrada
  cleanUserData(userData: any): any {
    const cleaned: any = {};

    if (userData.nombre) cleaned.nombre = userData.nombre.trim();
    if (userData.apellido) cleaned.apellido = userData.apellido.trim();
    if (userData.cedula) cleaned.cedula = userData.cedula.trim();
    if (userData.email) cleaned.email = userData.email.toLowerCase().trim();
    if (userData.password) cleaned.password = userData.password.trim();
    if (userData.idRol) cleaned.idRol = userData.idRol;

    // Limpiar teléfonos
    if (userData.telefonos && Array.isArray(userData.telefonos)) {
      cleaned.telefonos = userData.telefonos
        .filter((tel: any) => tel.telefono && tel.telefono.trim() !== '')
        .map((tel: any) => ({
          telefono: tel.telefono.trim(),
          tipoTel: tel.tipoTel || 'celular'
        }));
    }

    return cleaned;
  }
}
