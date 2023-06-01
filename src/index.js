import './css/style.css';
import PhotoSketch from './PhotoSketch.js';
import LoadMoreBtn from './components/LoadMoreBtn.js';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const refs = {
    searchFormRef: document.querySelector('.search-form'),
    inputRef: document.querySelector('input[type="text"]'),
    buttonRef: document.querySelector('.search-btn'),
    galleryRef: document.querySelector('.gallery')
}

const photoSketch = new PhotoSketch();
const loadMoreBtn = new LoadMoreBtn({
    selector: '.load-more',
    isHidden: true,
});

refs.searchFormRef.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', onLoadMore);


 async function onSubmit(event) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const inputValue = formEl.elements.searchQuery.value.trim();
    if (!inputValue) {
        Notiflix.Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
        loadMoreBtn.hide();
    }
    else {
        try {
            photoSketch.searchQuery = inputValue;
            photoSketch.resetPage();
            formEl.reset();
            clearImagesList();

            const response = await photoSketch.getImages();
            const markup = response.hits.map(image => createPicturesMarkup(image)).join('');

            if(response.hits.length === 0) {
                Notiflix.Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
                    photoSketch.resetPage();
                    loadMoreBtn.hide();
                    return;
            }
            else if (response.hits.length < photoSketch.perPage) {
                updateImagesList(markup);
                loadMoreBtn.hide();
            }
            else {
                Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
                updateImagesList(markup);
                loadMoreBtn.show();
            }
        } catch (error) {
            onError(error);
        }
    }
}

async function onLoadMore() {
    loadMoreBtn.disable();
    try {
        photoSketch.incrementPage();
        const response = await photoSketch.getImages();
        const totalPages = Math.ceil(response.totalHits / photoSketch.perPage);
        loadMoreBtn.enable();
        
        const markup = response.hits.map(image => createPicturesMarkup(image)).join('');
        updateImagesList(markup);

        if(photoSketch.page > 1) {
            {
            const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
            window.scrollBy({
                top: cardHeight * 2,
                behavior: "smooth",
                });
            }
        }
        if(photoSketch.page >= totalPages) {
            Notiflix.Notify.info(`We're sorry, but you've reached the end of search results.`);
            loadMoreBtn.hide();
        }
        else {
            loadMoreBtn.show();
        }
        
        pushLightbox();
    } catch(error) {
        onError(error);
        loadMoreBtn.enable();
    }
}


function createPicturesMarkup({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) {
   return `<div class="photo-card">
        <a class="gallery-link" href="${largeImageURL}">        
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
            <p class="info-item">
            <b>Likes</b>${likes}
            </p>
            <p class="info-item">
            <b>Views</b>${views}
            </p>
            <p class="info-item">
            <b>Comments</b>${comments}
            </p>
            <p class="info-item">
            <b>Downloads</b>${downloads}
            </p>
        </div>
    </div>`;
}
function updateImagesList(markup) {
    refs.galleryRef.insertAdjacentHTML("beforeend", markup);
}
function clearImagesList() {
    refs.galleryRef.innerHTML = '';
}
function onError(error) {
    console.error(error);
} 

function pushLightbox() {
    const lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
      caption: 'true',
    });
  }
