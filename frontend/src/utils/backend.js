import { request } from "./server";

export class BackendService {
    constructor() {
      this.baseUrl = window.env.URL;
      this.isBackendActive = false;
    }
  
  
    async getSongs(params, onSuccess, onError) {
      request("GET", `/Song${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async getSongAudio(params, onSuccess, onError) {
      request("GET", `/Song/download/indexed${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async deleteSongs(params, onSuccess, onError) {
      request("DELETE", `/Song${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
  
    async setSong(data, onSuccess, onError) {
      request("POST", `/Song`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async putSong(data, onSuccess, onError) {
      request("PUT", `/Song`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }

    async getAlbums(params, onSuccess, onError) {
      request("GET", `/Album${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async deleteAlbums(params, onSuccess, onError) {
      request("DELETE", `/Album${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async setAlbum(data, onSuccess, onError) {
      request("POST", `/Album`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async setAlbum(data, onSuccess, onError) {
      request("PUT", `/Album`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
  
    async getAuthors(params, onSuccess, onError) {
      request("GET", `/Author${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    } 
    async deleteAuthors(params, onSuccess, onError) {
      request("DELETE", `/Author${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    } 
    async setAuthor(data, onSuccess, onError) {
      request("POST", `/Author`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
    async putAuthor(data, onSuccess, onError) {
      request("PUT", `/Author`, data, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
}
  
