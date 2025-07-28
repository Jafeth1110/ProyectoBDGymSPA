export class User {
  constructor(
    public idUsuario: number = 0, 
    public nombre: string = '',
    public apellido: string = '',
    public cedula: string = '',
    public email: string = '',
    public password: string = '',
    public rol: string = '',
    public idRol?: number,
    public telefonos: Array<{
      idTelefono?: number;
      tipoTel: string;
      telefono: string;
    }> = []
  ) {
    // Inicializar telefonos como array vacío por defecto
    this.telefonos = [];
    
    // Procesar telefonos si se proporcionan
    if (telefonos && Array.isArray(telefonos)) {
      this.telefonos = telefonos.map(tel => {
        if (!tel || typeof tel !== 'object') {
          return { tipoTel: '', telefono: '' };
        }
        
        return {
          idTelefono: tel.idTelefono,
          tipoTel: tel.tipoTel || '',
          telefono: tel.telefono ? String(tel.telefono).trim() : ''
        };
      });
    } else if (telefonos && typeof telefonos === 'object') {
      // Si telefonos es un objeto en lugar de array, convertirlo
      const telefonoObj = telefonos as any;
      this.telefonos = [{
        idTelefono: telefonoObj.idTelefono,
        tipoTel: telefonoObj.tipoTel || '',
        telefono: telefonoObj.telefono ? String(telefonoObj.telefono).trim() : ''
      }];
    }
  }

  // Método para obtener el idRol basado en el rol
  getIdRol(): number {
    switch (this.rol) {
      case 'admin':
        return 1;
      case 'cliente':
        return 2;
      case 'entrenador':
        return 3;
      default:
        return 2; // Por defecto cliente
    }
  }

  // Método para agregar un teléfono
  addTelefono(tipoTel: string = '', telefono: string = ''): void {
    this.telefonos.push({
      tipoTel: tipoTel,
      telefono: telefono
    });
  }

  // Método para remover un teléfono
  removeTelefono(index: number): void {
    if (index >= 0 && index < this.telefonos.length) {
      this.telefonos.splice(index, 1);
    }
  }

  // Método para obtener teléfonos válidos (filtrar vacíos)
  getValidTelefonos(): Array<{tipoTel: string, telefono: string}> {
    return this.telefonos.filter(tel => 
      tel.telefono && tel.telefono.trim() !== ''
    );
  }
}
