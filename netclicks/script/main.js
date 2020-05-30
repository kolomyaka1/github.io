const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '771c63cb9af8b9a513a6bb5673256de5';
const SERVER = 'https://api.themoviedb.org/3/';
//меню 

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');
const preloader = document.querySelector('.preloader');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');
const posterPath = document.querySelector('.poster_path');
const modalContent = document.querySelector('.modal__content');

const loading = document.createElement('div');
loading.className = 'loading';



//Работа с карточками

class DBService {
    
    getData = async (url) => {        
        const res = await fetch(url)
        if (res.ok) {
            return res.json();       
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`);
        }                   
    }

    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }
    
    getSearchResult = (query) => {
        return this.getData(`${SERVER}search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`)
    }

    getTvShow = id => {
        return this.getData(`${SERVER}tv/${id}?api_key=${API_KEY}&language=ru-RU`);
    }
    getTopRated = () => this.getData(`${SERVER}tv/top_rated?api_key=${API_KEY}&language=ru-RU`);

    getPopular = () => this.getData(`${SERVER}tv/popular?api_key=${API_KEY}&language=ru-RU`);

    getTopWeek = () => this.getData(`${SERVER}tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);

    getTopToday = () => this.getData(`${SERVER}tv/airing_today?api_key=${API_KEY}&language=ru-RU`);
}




const renderCard = (response, target) => {
    tvShowsList.textContent = '';   

    console.log(response); 

    if(!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = ('По вашему запросу ничего не найдено...');        
        return;       
    }
        tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
        


    response.results.forEach(item => {

        const { 
              backdrop_path: backdrop,
              name: title,
              poster_path: poster,
              vote_average: vote,
              id
            } = item;
        
        
        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>`:'';

        const card =  document.createElement('li');
        card.idTV = id;
       
        card.className = 'tv-shows__item';
        card.innerHTML = `
          <a href="#" id="${id}" class="tv-card">
            ${voteElem}
            <img class="tv-card__img"
              src="${posterIMG}"
              data-backdrop="${backdropIMG}"
              alt="${title}">
            <h4 class="tv-card__head">${title}</h4>
          </a>
        `;
        
        loading.remove();
        tvShowsList.append(card);
    });
};

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    if (value) {
      
      new DBService().getSearchResult(value).then(renderCard);
    }  
    searchFormInput.value = ''; 
});



//открытие/закрытие меню

const closeDropdown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active');
    })
};

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();      
    } 
})

leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;   
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }

    if (target.closest('#top-rated')) {
        tvShows.append(loading);
        new DBService().getTopRated().then((response) => renderCard(response, target));     
    }
    if (target.closest('#popular')) {
        tvShows.append(loading);
        new DBService().getPopular().then((response) => renderCard(response, target));
    }
    if (target.closest('#week')) {
        tvShows.append(loading);
        new DBService().getTopWeek().then((response) => renderCard(response, target));
    }
    if (target.closest('#today')) {
        tvShows.append(loading);
        new DBService().getTopToday().then((response) => renderCard(response, target));
    }
    if (target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';
    }
    
});


// Открытие модального окна


tvShowsList.addEventListener('click', event => {

    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {

        preloader.style.display = 'block';

        new DBService().getTvShow(card.id)
        .then(data => {   
            
            if(data.poster_path) {
                posterWrapper.src = IMG_URL + posterWrapper;
                tvCardImg.alt = data.name;
                posterWrapper.style.display = '';
                modalContent.style.paddingLeft = '';
            } else {
                posterWrapper.style.display = 'none';
                modalContent.style.paddingLeft = '25px';
            }

            tvCardImg.alt = data.name;           
            tvCardImg.src = IMG_URL + data.poster_path;
            modalTitle.textContent = data.name;           
            genresList.textContent = '';
           
           
            for (const item of data.genres) {
                genresList.innerHTML += `<li>${item.name}</li>`;
            };

            rating.textContent = data.vote_average;
            description.textContent = data.overview;
            modalLink.href = data.homepage;
        })
        
        .then(() => {
            document.body.style.overflow = 'hidden';
            modal.classList.remove('hide'); 
        }) 
        .finally(() => {
            preloader.style.display = '';
        })       
    }
    
});

// Закрытие модального окна 

modal.addEventListener('click', event => {
    const cross = event.target.closest('.cross');
    console.log(event.target.closest('.cross'));
    
    if (cross || 
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});


// Смена карточки 

const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');
    
    if (card) {
      const img = card.querySelector('.tv-card__img');  
        

      if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
      }                 
    }
    
};

tvShowsList.addEventListener('mouseover', changeImage );
tvShowsList.addEventListener('mouseout', changeImage );






