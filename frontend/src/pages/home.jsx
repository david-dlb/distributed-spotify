import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import CardAlbum from '../components/CardAlbum/CardAlbum'
import { requestToServer } from '../utils/server'


const Home = () => {
  const [albums, setAlbums] = useState([])


  useEffect(() => {
    const api = async () => {
      requestToServer("GET", `/Album?limit=${10}`, null, (d) => {
        setAlbums(d.value)
      }, (e) => {
          console.log(d)
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
