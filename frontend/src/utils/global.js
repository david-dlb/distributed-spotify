export const genres =[
    { id: 0, name: "Rock" },
    { id: 1, name: "Pop" },
    { id: 2, name: "Jazz" },
    { id: 3, name: "Blues" },
    { id: 4, name: "Classical" },
    { id: 5, name: "HipHop" },
    { id: 6, name: "Electronic" },
    { id: 7, name: "Country" },
    { id: 8, name: "Reggae" },
    { id: 9, name: "Metal" },
    { id: 10, name: "Punk" },
    { id: 11, name: "Funk" },
    { id: 12, name: "Soul" },
    { id: 13, name: "RnB" },
    { id: 14, name: "Disco" },
    { id: 15, name: "Folk" },
    { id: 16, name: "Indie" },
    { id: 17, name: "Latin" },
    { id: 18, name: "Rap" },
    { id: 19, name: "House" },
    { id: 20, name: "Techno" },
    { id: 21, name: "Dance" },
    { id: 22, name: "Ambient" },
    { id: 23, name: "Trance" },
    { id: 24, name: "Dubstep" },
    { id: 25, name: "Gospel" },
    { id: 26, name: "Opera" },
    { id: 27, name: "Grunge" },
    { id: 28, name: "Ska" },
    { id: 29, name: "Reggaeton" },
    { id: 30, name: "Swing" },
    { id: 31, name: "Synthpop" },
    { id: 32, name: "KPop" },
    { id: 33, name: "Unknow" }
];


export const getGenreNameById = (id) => {
    const genre = genres.find(g => g.id === id);
    console.log(id, genre)
    return genre ? genre.name : "Género desconocido";
}