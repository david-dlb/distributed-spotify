document.getElementById("album").addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(e.target.name)
    requestToServer("POST", "http://localhost:5140/api/Album", {name: e.target.name.value}, (d) => {
        console.log(d)
    }, (e) => {
        console.log(d)
    })
})

document.getElementById("author").addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(e.target.name)
    requestToServer("POST", "http://localhost:5140/api/Author", {name: e.target.name.value}, (d) => {
        console.log(d)
    }, (e) => {
        console.log(d)
    })
})

document.getElementById("song").addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(e.target.name)
    requestToServer("POST", "http://localhost:5140/api/Song", {name: e.target.name.value}, (d) => {
        console.log(d)
    }, (e) => {
        console.log(d)
    })
})
 

const getAlbums = () => {
    requestToServer("GET", "http://localhost:5140/api/Album?limit=324344324", null, (d) => {
        console.log(d)
    }, (e) => {
        console.log(d)
    })
}


document.getElementById("add-song").addEventListener("click", () => {
    
})