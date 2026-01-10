import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {
  apiUrl = "http://localhost:3000/sistema";

  constructor(private http: HttpClient) {}

  exportarDados(){
    return this.http.get(`${this.apiUrl}/exportar`, {
      responseType: "blob"
    });
  }

  excluirDados() {
    return this.http.delete(`${this.apiUrl}/limpar`);
  }

  importarDados(arquivo: File) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post(`${this.apiUrl}/importar`, formData);
  }
}
