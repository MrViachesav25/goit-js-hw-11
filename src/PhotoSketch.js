import axios from 'axios';

export default class PhotoSketch {
    constructor() {
        this.URL = 'https://pixabay.com/api/';
        this.API_KEY = '36861525-e0c9def87db19971deb2e17d1';
        this.perPage = 40;
        this.searchQuery = '';
    }

   async getImages() {
        const params = {
            key: this.API_KEY,
            q: this.searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            per_page: this.perPage,
            page: this.page
        }
        try {
            const response = await axios.get(`${this.URL}`, {params});
            const { hits, totalHits } = response.data; 
            return {hits, totalHits};
        } catch (error) {
            console.log(error);
        }
    }

    resetPage() {
        this.page = 1;
    }

    incrementPage() {
        this.page += 1;
    }
}