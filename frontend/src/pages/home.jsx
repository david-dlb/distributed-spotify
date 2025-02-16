import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import CardAlbum from '../components/CardAlbum/CardAlbum'
import { requestToServer } from '../utils/server'
import { BackendService } from '../utils/backend'


const Home = () => {
  const [albums, setAlbums] = useState([])
  const backendService = new BackendService()

  useEffect(() => {
    const api = async () => {
      console.log(1)
      backendService.getAlbums(`?limit=${10}&page=1`, (d) => {
        setAlbums(d.value)
      }, (e) => {
          console.log(e)
      })
    }
    api()
  }, [])
  return (
    <div className="">
      

    <Navbar/>

    <CardAlbum albums={albums}/>
    </div>
  )
}

export default Home
