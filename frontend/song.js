const limit = 10
const getSongs = async() => {
    requestToServer("GET", `http://localhost:5140/api/Song?limit=${limit}`, null, (d) => {
        console.log(d)
    }, (e) => {
        console.log(d)
    })
}

getSongs()