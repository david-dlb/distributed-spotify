import { request, requestPost } from "./server";

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
      try {
        const a = await request("GET", `/Song/download/indexed${params}`, null, (d) => {
        }, (e) => {
        })

        console.log("wait", a)
        onSuccess(a)
      } catch (error) {
        
      }
      // request("GET", `/Song/download/indexed${params}`, null, (d) => {
      //   return onSuccess(d)
      // }, (e) => {
      //   return onError(e)
      // })

      // const response = await fetch(`http://10.0.10.2:8000/api/Song/download/indexed${params}`);
      // if (!response.ok) {
      //   onError('Error al obtener el segmento de audio')
      //   throw new Error('Error al obtener el segmento de audio');
      // }
      // const d = await response.arrayBuffer()
      // onSuccess(d)
    }
    async deleteSongs(params, onSuccess, onError) {
      request("DELETE", `/Song${params}`, null, (d) => {
        return onSuccess(d)
      }, (e) => {
        return onError(e)
      })
    }
  
    async setSong(data, onSuccess, onError) {
      requestPost("POST", `/Song`, data, (d) => {
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
      await request("GET", `/Album${params}`, null, (d) => {
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
      await request("GET", `/Author${params}`, null, (d) => {
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
  
