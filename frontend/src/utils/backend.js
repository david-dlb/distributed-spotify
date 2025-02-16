import { requestToServer, requestToServerForm } from "./server";

export class BackendService {
    constructor() {
      this.baseUrl = window.env.URL;
      this.isBackendActive = false;
    }
  
  
    async getSongs(params, onSuccess, onError) {
      requestToServer("GET", `/Song${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async getSongAudio(params, onSuccess, onError) {
      const response = await fetch(`${window.env.URL}/Song/download/indexed${params}`);
      if (!response.ok) {
        onError('Error al obtener el segmento de audio')
        throw new Error('Error al obtener el segmento de audio');
      }
      const d = await response.arrayBuffer()
      onSuccess(d)
    }
    async deleteSongs(params, onSuccess, onError) {
      requestToServer("DELETE", `/Song${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
  
    async setSong(data, onSuccess, onError) {
      requestToServerForm("POST", `/Song`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async putSong(data, onSuccess, onError) {
      requestToServerForm("PUT", `/Song`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }

    async getAlbums(params, onSuccess, onError) {
      requestToServer("GET", `/Album${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async deleteAlbums(params, onSuccess, onError) {
      requestToServer("DELETE", `/Album${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async setAlbum(data, onSuccess, onError) {
      requestToServerForm("POST", `/Album`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async setAlbum(data, onSuccess, onError) {
      requestToServerForm("PUT", `/Album`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
  
    async getAuthors(params, onSuccess, onError) {
      requestToServer("GET", `/Author${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    } 
    async deleteAuthors(params, onSuccess, onError) {
      requestToServer("DELETE", `/Author${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    } 
    async setAuthor(data, onSuccess, onError) {
      requestToServerForm("POST", `/Author`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async putAuthor(data, onSuccess, onError) {
      requestToServerForm("PUT", `/Author`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
}
  
